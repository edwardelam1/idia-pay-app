/**
 * Standardized Pico-Bite contract.
 * Every Pico-Bite is a stateless terminal: it renders from `config`, fires
 * user intent through `onAction`, and never touches storage or telemetry
 * directly. LiquidOS injects everything it needs to know about its context.
 */
export interface PicoBiteProps<
  TConfig = Record<string, unknown>,
  TPayload = unknown,
> {
  /** Telemetry tag from the blueprint, e.g. "ft.pos.item_add". */
  telemetryTag: string;
  /** Schema payload defining labels, colors, limits, tiles, endpoints, etc. */
  config: TConfig;
  /** Emits an event up to the OS; the OS enriches + dispatches to the bus. */
  onAction: (payload: TPayload) => void;
  /** OS-driven gate. When false, the bite renders disabled + shows `gateReason`. */
  gateSatisfied?: boolean;
  gateReason?: string;
}
