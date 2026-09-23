import { getCachedItems } from "./offlineSync";

export function getEntityFromStateOrCache({
  state,
  stateKey,
  id,
  moduleName,
  userId = "global",
}) {
  const entityFromState = state?.[stateKey];

  if (entityFromState) {
    return entityFromState;
  }

  if (!id || !moduleName) {
    return null;
  }

  const cachedItems = getCachedItems(moduleName, userId);

  return cachedItems.find((item) => String(item.ID) === String(id)) || null;
}