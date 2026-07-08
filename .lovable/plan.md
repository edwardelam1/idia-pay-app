# Flip 3D Switcher for LiquidOS

Add a Vista/7-style Flip 3D carousel that cycles through the current Sub-Module's **Screens** in the operational phase of `LiquidOS`. Live DOM (not snapshots) so nano-bite content keeps updating while flipped.

## Scope
- Only the operational phase in `src/lib/idia/LiquidOS.tsx`. Loading, error, and selection phases are untouched.
- Flip navigates between `screens` (already computed via `uniqueScreens(subModule)`). Sub-module and module-library navigation stay in the sidebar.

## Trigger
- Keyboard: `Ctrl/Cmd + Tab` opens the carousel; `Tab` / `Shift+Tab` or `←/→` cycle; `Enter` or click commits; `Esc` cancels.
- UI: small "Flip 3D" button in the operational header next to the "Synapse Live" pill (keyboard hint shown in tooltip).

## Rendering approach — CSS3, per user choice
- New component `src/components/liquidos/Flip3DSwitcher.tsx`.
- Full-screen overlay: dark scrim (`bg-black/55`) + `backdrop-blur-xl` behind the stage, matching Aero dimming/desaturation.
- Stage element sets `perspective: 1600px` and `perspective-origin: 50% 45%`; inner track uses `transform-style: preserve-3d`.
- Each screen rendered into a card `div` sized to viewport with the actual screen content (grid of nano-bites) inside a scaled wrapper so it reads at a glance but stays live/interactive on the focused card.
- Per-card transform (index `i` relative to focused): `translateX(i * 90px) translateZ(i * -180px) rotateY(-55deg)`; focused card interpolates to `rotateY(0)` centered.
- 300ms transitions on `transform` and `opacity` with `cubic-bezier(0.22, 1, 0.36, 1)` (easing that mimics DWM). Background cards get slight opacity falloff and pointer-events off; only the focused card is clickable.
- Optional reflection: mirrored copy below via `scaleY(-1)` + mask-image linear-gradient for alpha fade (Compiz-style, subtle).

## Layout Algorithm (matches the spec)
For screens array `S`, focused index `f`, and card index `i`, with `d = i - f`:
- `rotateY`: `d === 0 ? 0deg : -55deg`
- `translateX`: `d * 90px` (negative drift keeps left edges visible for identification)
- `translateY`: `d === 0 ? 0 : 8px`
- `translateZ`: `-Math.abs(d) * 180px`
- `opacity`: `d === 0 ? 1 : max(0.55, 1 - abs(d) * 0.12)`
- `zIndex`: `screens.length - abs(d)`

## Files
- **New**: `src/components/liquidos/Flip3DSwitcher.tsx` — self-contained overlay, receives `screens`, `activeScreen`, `renderScreen(screen)`, `onCommit(screen)`, `onClose()`.
- **New**: `src/components/liquidos/flip3d.css` — keyframes for enter/exit (scale from 0.96 + fade, 220ms), scoped card transitions, reflection mask.
- **Edit**: `src/lib/idia/LiquidOS.tsx`
  - Extract the per-screen content grid (currently inlined in the operational `<main>`) into a small `ScreenBoard` local component so both the normal view and the switcher can render it.
  - Add `flipOpen` state, global `keydown` listener (Ctrl/Cmd+Tab to open; Tab/Shift+Tab/Arrows to cycle a temporary `flipIndex`; Enter to commit → `setActiveScreen`; Esc to close).
  - Add the "Flip 3D" header button.
  - Render `<Flip3DSwitcher />` when `flipOpen`.
- **No other files touched.** No new deps. No route changes. No backend changes.

## Technical Details
- `preventDefault()` on Ctrl/Cmd+Tab so the browser tab switcher does not steal focus (works reliably in the preview iframe; documented caveat: real browsers block Ctrl+Tab override outside iframes — the `Ctrl+\`` fallback shortcut is bound as backup).
- Uses only Tailwind classes + inline `style={{ transform: ... }}`, consistent with existing LiquidOS styling. No changes to design tokens.
- Reduced motion: if `prefers-reduced-motion: reduce`, the carousel opens with no rotation (2D fan) and 120ms fade.
- Cleanup: window listeners removed on unmount; overlay traps focus while open and restores focus to the header button on close.

## Verification
- Manual: open preview, enter an operational screen, press Ctrl+Tab → carousel appears with live nano-bites, cycle with Tab, commit with Enter, screen swaps. Esc cancels without changing `activeScreen`.
- Console clean; no `[ERROR]` logs; no route changes so build stays green.
