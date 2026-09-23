import { useEffect, useRef } from "react";
import { getCurrentUser } from "../services/auth";
import { syncAllUserModules, syncGlobalModules } from "../utils/globalOfflineSync";

function OfflineSyncBootstrap() {
  const syncingRef = useRef(false);

  useEffect(() => {
    async function runSync() {
      if (syncingRef.current) return;
      syncingRef.current = true;

      const currentUser = getCurrentUser();

      try {
        if (currentUser?.ID) {
          await syncAllUserModules(currentUser.ID);
        }

        await syncGlobalModules();
      } catch (error) {
        console.error("Offline sync bootstrap failed:", error);
      } finally {
        syncingRef.current = false;
      }
    }

    function handleOnline() {
      runSync();
    }

    if (navigator.onLine) {
      runSync();
    }

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}

export default OfflineSyncBootstrap;