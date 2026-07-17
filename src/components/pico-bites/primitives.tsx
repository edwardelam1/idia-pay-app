/**
 * Pico-Bite primitives. Re-exported from the legacy shared module during
 * the flattening migration so the new `pico-bites/` folder is the single
 * import surface for terminal UI.
 */
export {
  ActionButton,
  PicoCard,
  QuantityStepper,
  LongPressButton,
  Numpad,
  ManagerAuth,
  useShiftLock,
  useLocationDriftMonitor,
  setShiftLocation,
  setShiftClockedIn,
  markShiftDrifted,
  clearShiftDrift,
  haversineMeters,
  DRIFT_THRESHOLD_M,
} from "@/components/foodtruck-inputs/shared";
export type {
  ActionButtonVariant,
  ManagerAuthResult,
  LockedCoords,
} from "@/components/foodtruck-inputs/shared";
