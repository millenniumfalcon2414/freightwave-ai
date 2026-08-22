import { useEffect } from "react";
import { getLiveEventsFn } from "../api/realtime.functions";
import { liveEventBus } from "./liveEventBus";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let isActive = true;

    async function poll() {
      while (isActive) {
        try {
          const events = await getLiveEventsFn();
          if (events && events.length > 0) {
            events.forEach((ev) => {
              liveEventBus.publish(ev);
            });
            // We got events, invalidate the db snapshot so the UI syncs
            queryClient.invalidateQueries({ queryKey: ["db_snapshot"] });
          }
        } catch (error) {
          // Log as a warning instead of error to prevent triggering the global error catcher.
          // This is a normal occurrence during dev server restarts or network blips.
          console.warn("Realtime poll error:", error);
          // Wait a bit before retrying on error
          await new Promise((res) => setTimeout(res, 3000));
        }
      }
    }

    poll();

    return () => {
      isActive = false;
    };
  }, [queryClient]);
}
