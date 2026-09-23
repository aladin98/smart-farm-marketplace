// src/utils/globalOfflineSync.js
import { syncPendingItems } from "./offlineSync";
import { offlineModules } from "./offlineModules";

export async function syncAllUserModules(userId) {
  if (!userId || !navigator.onLine) return;

  const userModules = ["places", "equipments", "animals", "incubators", "cages"];

  for (const moduleName of userModules) {
    const config = offlineModules[moduleName];
    if (!config) continue;

    try {
      await syncPendingItems({
        moduleName,
        userId,
        createFn: config.createFn,
        updateFn: config.updateFn,
        deleteFn: config.deleteFn,
        buildPayload: config.buildPayload,
      });
    } catch (error) {
      console.error(`Global sync failed for ${moduleName}`, error);
    }
  }
}

export async function syncGlobalModules() {
  if (!navigator.onLine) return;

  const globalModules = ["learning"];

  for (const moduleName of globalModules) {
    const config = offlineModules[moduleName];
    if (!config) continue;

    try {
      await syncPendingItems({
        moduleName,
        userId: "global",
        createFn: config.createFn,
        updateFn: config.updateFn,
        deleteFn: config.deleteFn,
        buildPayload: config.buildPayload,
      });
    } catch (error) {
      console.error(`Global sync failed for ${moduleName}`, error);
    }
  }
}