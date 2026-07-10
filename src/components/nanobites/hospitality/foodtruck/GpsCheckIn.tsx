/**
 * Pico-Bite 4.1 · hosp.ft.fleet.loc_lock
 * GPS Check-In — event name input + geolocation poll + Lock Location.
 * Runs the hybrid 250m drift monitor while the shift is locked.
 */
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { recordExecution } from "@/lib/idia/executions";
import {
  ActionButton,
  DRIFT_THRESHOLD_M,
  PicoCard,
  SUBMODULE_ID,
  setShiftLocation,
  useCartonCode,
  useLocationDriftMonitor,
  useShiftLock,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.fleet.loc_lock";
const SCREEN = "Fleet Management";

const schema = z.object({
  eventName: z.string().trim().min(1).max(80),
});

export default function GpsCheckIn() {
  const cartonCode = useCartonCode();
  const { location, drifted, driftMeters } = useShiftLock();
  useLocationDriftMonitor();
  const [eventName, setEventName] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [polling, setPolling] = useState(false);

  const poll = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      console.log("[HARDWARE_STUB]: geolocation unsupported, using stub coords");
      setCoords({ lat: 34.0522, lng: -118.2437 });
      return;
    }
    setPolling(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
        setPolling(false);
      },
      () => {
        console.log("[HARDWARE_STUB]: geolocation denied, using stub coords");
        setCoords({ lat: 34.0522, lng: -118.2437 });
        setPolling(false);
      },
      { timeout: 5000 },
    );
  };

  const lock = () => {
    const parsed = schema.safeParse({ eventName });
    if (!parsed.success) {
      toast.error("Enter an event or location name.");
      return;
    }
    if (!coords) {
      toast.error("Poll GPS first.");
      return;
    }
    setShiftLocation(eventName, coords);
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: {
        eventName,
        coords,
        driftThresholdM: DRIFT_THRESHOLD_M,
        cadence: "hybrid",
      },
    });
    toast.success(`Locked at ${eventName}`);
  };

  const unlock = () => {
    setShiftLocation(null);
    toast.info("Location cleared");
  };

  return (
    <PicoCard title="GPS Check-In" subtitle="Hybrid lock · re-prompt on 250m drift">
      <input
        className="h-11 rounded-xl border px-3 text-[14px] bg-white"
        placeholder="Event / Location name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        maxLength={80}
      />
      <div className="grid grid-cols-2 gap-2">
        <ActionButton variant="ghost" onClick={poll} disabled={polling}>
          {polling ? "Polling…" : coords ? "Re-poll GPS" : "Poll GPS"}
        </ActionButton>
        <ActionButton onClick={lock}>
          {drifted ? "Re-Lock Location" : "Lock Location"}
        </ActionButton>
      </div>
      {coords && (
        <p className="text-[11px] text-muted-foreground text-center tabular-nums">
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </p>
      )}
      {drifted && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[12px] text-amber-900">
          Drift detected · {Math.round(driftMeters)}m from lock. Re-poll GPS and Re-Lock to resume sales.
        </div>
      )}
      {location && !drifted && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="text-[12px] text-emerald-900">Locked · {location}</span>
          <button onClick={unlock} className="text-[11px] text-emerald-800 underline">
            Clear
          </button>
        </div>
      )}
    </PicoCard>
  );
}
