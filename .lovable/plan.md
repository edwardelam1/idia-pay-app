## Part 1 — Make Flip 3D actually work (gesture-only, mobile first)

Confirmed from the code, three separate things break it:

1. **The open gesture rarely fires.** `LiquidOS.tsx` listens for `onTouchStart`/`onTouchEnd` on the shell, but requires the swipe to *start* between 30%–70% of viewport height. On mobile that band is occupied by the Nano-Bite grid and the scrollable Pico dock, which consume the touch, so the swipe almost never reaches the handler.
2. **Tap-to-open on the focused card is swallowed.** `flip3d.css` sets `pointer-events: auto` on the focused card's inner content, so a tap lands on the live rendered screen inside the card instead of the card's `onCommit` handler. The switcher opens but you can't select anything.
3. **Cards are sized for desktop.** `CARD_W` is 70% of viewport width with a fixed 90px neighbour offset; on a phone the neighbours sit almost entirely under the focused card, so it doesn't read as a carousel.

Fixes:

- Move the open-gesture detection to a **pointer-event listener on the shell in the capture phase** so it sees the swipe before scrollable children do, and require a horizontal intent (dx > 60px, dx > 2×dy) instead of a screen-position band. Vertical/scroll gestures pass through untouched.
- Add an **edge-of-screen two-finger / long-horizontal-drag fallback**: a horizontal drag beginning within 24px of the left or right edge also opens the switcher — this area never scrolls.
- In `Flip3DSwitcher`, make the card's own tap target the commit surface: keep the card preview **non-interactive** (`pointer-events: none` on inner content always), and commit on tap of the focused card, focus on tap of a neighbour. Swipe left/right steps focus; swipe up on the focused card closes.
- Recompute card geometry for mobile: card ≈ 78% of the smaller viewport dimension, neighbour offset and z-depth scaled to viewport width so at least the adjacent two screens peek out. Preserve the reduced-motion path.
- The card preview keeps rendering the real screen but inside a non-interactive, scaled wrapper so it can't intercept touches.

No behavior change to routing/state — `onCommit` still just sets the active screen.

## Part 2 — iPhone-style Pico-Bite rearranging inside a Nano-Bite

Interaction (in `NanoBiteHost.tsx`, the dock that renders the grid):

- **Long-press ~500ms** on any tile → haptic tick, enters **edit mode**: every tile starts a subtle wiggle (small alternating rotation, randomized delay per tile so they're out of phase), and tile actions are suspended so a drag can't fire a telemetry event.
- **Drag** a tile with your finger; other tiles reflow around it live (position swap on crossing a neighbour's midpoint), animated.
- **Release** drops the tile into the slot it's over.
- **Tap anywhere outside a tile, or the "Done" chip in the dock header**, exits edit mode and commits the order.
- Reduced-motion users get edit mode without the wiggle.

Implementation notes: pointer events (works for touch + mouse), transform-based movement so nothing reflows the document, no external drag library.

## Part 3 — Persisting order per user in the database

New table:

```text
public.pico_dock_layouts
  id           uuid pk
  user_id      uuid not null            -- auth.uid(), no FK to auth.users
  business_id  uuid null                -- active tenant
  nano_bite_id text not null
  tag_order    text[] not null          -- canonical pico.* tags, in order
  updated_at   timestamptz default now()
  unique (user_id, business_id, nano_bite_id)
```

- GRANTs for `authenticated` (select/insert/update/delete) and `service_role`; no `anon` access.
- RLS enabled; all policies scoped to `auth.uid() = user_id`.
- Writes use **discrete SELECT → INSERT or UPDATE** (no upsert, per the standing rule).

Wiring:

- New `src/lib/idia/dock-layout.ts` with `loadDockOrder(nanoBiteId, businessId)` and `saveDockOrder(nanoBiteId, businessId, tags)`.
- `NanoBiteHost` loads the saved order after `resolveLayoutFromSpec` resolves and applies it as a **sort over the resolved bites** — the Hub manifest stays authoritative for *which* tiles exist and for conflict/dimming; the saved order only reorders. Tags in the manifest but not in the saved order append at the end in manifest order; saved tags no longer published are ignored. This means a Hub redeploy can never resurrect a ghost tile.
- Save fires on drop (debounced), not on every reorder frame.

## Technical details

- Files touched: `src/lib/idia/LiquidOS.tsx` (gesture capture), `src/components/liquidos/Flip3DSwitcher.tsx` + `flip3d.css` (geometry, hit targets, swipe), `src/components/nanobites/NanoBiteHost.tsx` (edit mode + drag + order application), new `src/lib/idia/dock-layout.ts`, plus one migration.
- Existing telemetry flow is untouched: `onEmit` → `TelemetryBus.emit` + local `dispatch` stays exactly as-is; it is simply disabled while in edit mode.
- Requires a signed-in user for persistence; with no session the dock still reorders for the session but does not write.
