export function getCacheKey(moduleName, userId = "global") {
  return `myFarm_${moduleName}_cache_${userId}`;
}

export function getPendingKey(moduleName, userId = "global") {
  return `myFarm_${moduleName}_pending_${userId}`;
}

export function readStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Failed to read localStorage key "${key}"`, error);
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write localStorage key "${key}"`, error);
  }
}

export function getCachedItems(moduleName, userId = "global") {
  return readStorage(getCacheKey(moduleName, userId), []);
}

export function setCachedItems(moduleName, userId = "global", items) {
  writeStorage(getCacheKey(moduleName, userId), items);
}

export function getPendingItems(moduleName, userId = "global") {
  return readStorage(getPendingKey(moduleName, userId), []);
}

export function setPendingItems(moduleName, userId = "global", items) {
  writeStorage(getPendingKey(moduleName, userId), items);
}

export function addOfflineCreate(moduleName, userId, payload) {
  const cachedItems = getCachedItems(moduleName, userId);
  const pendingItems = getPendingItems(moduleName, userId);

  const offlineItem = {
    ID: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...payload,
    pendingSync: true,
    syncAction: "create",
    updatedAtOffline: new Date().toISOString(),
  };

  const updatedCache = [offlineItem, ...cachedItems];
  const updatedPending = [offlineItem, ...pendingItems];

  setCachedItems(moduleName, userId, updatedCache);
  setPendingItems(moduleName, userId, updatedPending);

  return offlineItem;
}

export function addOfflineUpdate(moduleName, userId, originalItem, updatedFields) {
  const cachedItems = getCachedItems(moduleName, userId);
  const pendingItems = getPendingItems(moduleName, userId);

  const updatedItem = {
    ...originalItem,
    ...updatedFields,
    pendingSync: true,
    syncAction: originalItem.syncAction === "create" ? "create" : "update",
    updatedAtOffline: new Date().toISOString(),
  };

  const updatedCache = cachedItems.map((item) =>
    item.ID === originalItem.ID ? updatedItem : item
  );

  const existingPendingIndex = pendingItems.findIndex(
    (item) => item.ID === originalItem.ID
  );

  let updatedPending;
  if (existingPendingIndex >= 0) {
    updatedPending = [...pendingItems];
    updatedPending[existingPendingIndex] = updatedItem;
  } else {
    updatedPending = [updatedItem, ...pendingItems];
  }

  setCachedItems(moduleName, userId, updatedCache);
  setPendingItems(moduleName, userId, updatedPending);

  return updatedItem;
}

export function addOfflineDelete(moduleName, userId, itemId, currentItem) {
  const cachedItems = getCachedItems(moduleName, userId);
  const pendingItems = getPendingItems(moduleName, userId);

  const updatedCache = cachedItems.filter((item) => item.ID !== itemId);

  let updatedPending;

  if (String(itemId).startsWith("offline-")) {
    updatedPending = pendingItems.filter((item) => item.ID !== itemId);
  } else {
    const withoutSame = pendingItems.filter((item) => item.ID !== itemId);

    updatedPending = [
      {
        ...currentItem,
        pendingSync: true,
        syncAction: "delete",
        updatedAtOffline: new Date().toISOString(),
      },
      ...withoutSame,
    ];
  }

  setCachedItems(moduleName, userId, updatedCache);
  setPendingItems(moduleName, userId, updatedPending);

  return updatedCache;
}

export async function syncPendingItems({
  moduleName,
  userId,
  createFn,
  updateFn,
  deleteFn,
  buildPayload,
}) {
  const pendingItems = getPendingItems(moduleName, userId);

  if (pendingItems.length === 0) {
    return { success: true, remaining: 0 };
  }

  const stillPending = [];

  for (const item of pendingItems) {
    try {
      const payload = buildPayload(item);

      if (item.syncAction === "delete") {
        if (!String(item.ID).startsWith("offline-")) {
          await deleteFn(item.ID);
        }
      } else if (
        item.syncAction === "update" &&
        !String(item.ID).startsWith("offline-")
      ) {
        await updateFn(item.ID, payload);
      } else {
        await createFn(payload);
      }
    } catch (error) {
      console.error(`Failed to sync ${moduleName} item:`, error);
      stillPending.push(item);
    }
  }

  setPendingItems(moduleName, userId, stillPending);

  return {
    success: stillPending.length === 0,
    remaining: stillPending.length,
  };
}

export async function loadWithOfflineSupport({
  moduleName,
  userId,
  fetchFn,
  syncConfig,
}) {
  if (!navigator.onLine) {
    const cachedItems = getCachedItems(moduleName, userId);

    return {
      items: cachedItems,
      offline: true,
      fromCache: true,
      empty: cachedItems.length === 0,
    };
  }

  try {
    if (syncConfig) {
      await syncPendingItems({
        moduleName,
        userId,
        ...syncConfig,
      });
    }

    const data = await fetchFn();
    setCachedItems(moduleName, userId, data);

    return {
      items: data,
      offline: false,
      fromCache: false,
      empty: data.length === 0,
    };
  } catch (error) {
    console.error(`Failed to load online data for ${moduleName}:`, error);

    const cachedItems = getCachedItems(moduleName, userId);

    if (cachedItems.length > 0) {
      return {
        items: cachedItems,
        offline: true,
        fromCache: true,
        empty: false,
        error,
      };
    }

    throw error;
  }
}