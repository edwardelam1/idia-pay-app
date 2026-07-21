/**
 * Standardized Pico-Bite contract — universal `pico.*` catalog.
 * Every Pico-Bite is a stateless terminal: it renders from `config`, fires
 * user intent through `onAction(tag, payload)`, and never touches storage or
 * telemetry directly. LiquidOS injects everything it needs to know.
 */
export interface PicoBiteProps<
  TConfig extends Record<string, unknown> = Record<string, unknown>,
  TPayload = unknown,
> {
  /** Telemetry tag from the blueprint, e.g. "pico.input.chip_insert". */
  telemetryTag: string;
  /** Schema payload defining labels, colors, limits, tiles, endpoints, etc. */
  config?: TConfig;
  /** Emits an event up to the OS; OS enriches + dispatches to the bus. */
  onAction: (tag: string, payload: TPayload) => void;
  /** OS-driven gate. When false, the bite renders locked + shows `gateReason`. */
  gateSatisfied?: boolean;
  gateReason?: string;
}
