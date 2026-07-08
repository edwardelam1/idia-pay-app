## Goal
Replace the desktop keyboard trigger (Ctrl/Cmd+Tab) and the header "Flip 3D" pill button with a **mobile horizontal swipe gesture** across the middle of the screen to open/drive the Flip 3D switcher. IDIA Pay is mobile-only, so keyboard shortcuts and pointer buttons that assume a physical keyboard have no place.

## Changes

### 1. `src/lib/idia/LiquidOS.tsx`
- Remove the `useEffect` that listens for `Ctrl/Cmd+Tab` and `Ctrl+\``.
- Remove the header "⌘ Flip 3D" pill button (keep only the "Synapse Live" indicator).
- Extend the existing touch handler (currently used for sidebar open/close) so that a **horizontal swipe starting in the vertical middle band of the viewport** (roughly 30%–70% of screen height) opens the Flip 3D switcher when `phase.kind === "operational"` and there are ≥2 screens.
  - Track `touchStartX`, `touchStartY`, and `touchStartT` on `touchstart`.
  - On `touchend`: compute `dx`, `dy`, `dt`.
    - If `startY` is inside the middle band AND `|dx| > 60px` AND `|dx| > |dy| * 1.5` AND `dt < 500ms` → open `Flip3DSwitcher` and preselect direction (`dx > 0` = next screen preview, `dx < 0` = previous).
    - Otherwise fall through to existing edge-swipe sidebar logic (which only fires when `startX < 40` or a right-to-left swipe closes the sidebar).
- Priority: middle-swipe gesture is evaluated first; sidebar edge-swipe only runs if the middle-swipe condition is not met.

### 2. `src/components/liquidos/Flip3DSwitcher.tsx`
- Drive carousel navigation with **swipe gestures on the stage** instead of arrow keys / Tab:
  - Swipe left → next screen.
  - Swipe right → previous screen.
  - Tap the center (active) card → commit and close.
  - Tap a side card → make it active (rotate carousel toward it).
  - Tap the dark scrim → close without changing screen.
- Remove all `keydown` listeners (Tab, Arrows, Enter, Esc). Replace the Esc affordance with a small floating "Close" chip (thumb-reachable, top-right).
- Replace the HUD hint text like "Tab / ← →" with "Swipe · Tap to open".

### 3. No changes needed to `src/components/liquidos/flip3d.css` — the perspective, transforms, reflections, and reduced-motion rules all stay.

## Technical Details
- Gesture math (in `LiquidOS`):
  ```
  const midBandTop = window.innerHeight * 0.30;
  const midBandBottom = window.innerHeight * 0.70;
  const horizontal = Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5;
  const quick = dt < 500;
  const inMidBand = startY >= midBandTop && startY <= midBandBottom;
  ```
- Inside `Flip3DSwitcher`, use `onTouchStart` / `onTouchEnd` on the stage container; commit navigation by calling the same `setIndex` logic that the removed keyboard handlers used.
- Preserve reduced-motion support already in `flip3d.css`.
- No route, backend, or Supabase changes.

## Verification
- Manually swipe horizontally across the middle of the preview (mobile viewport) while inside an operational sub-module → Flip 3D opens.
- Swipe left/right inside the switcher → cards cycle.
- Tap active card → commits and closes; tap scrim → closes without change.
- Edge-swipe from left still opens the sidebar; right-swipe still closes it.
- No console errors, no references to keyboard shortcuts remain in the UI.
