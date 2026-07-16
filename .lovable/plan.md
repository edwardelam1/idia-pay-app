## Problem
The app frame is still scrolling, so the header/footer borders inside each Nano-Bite card shift with the content instead of staying pinned to the viewport.

## Plan

### 1. Freeze the document root
In `src/styles.css`, add a global rule so the browser itself cannot scroll:

```css
html, body {
  height: 100%;
  overflow: hidden;
  overscroll-behavior: none;
}
```

### 2. Convert every full-screen shell from `min-h-screen` to `h-screen overflow-hidden`
The current shells can grow past the viewport. Change them to exactly viewport height with no overflow:

- `src/providers/TenancyProvider.tsx` — booting and rejected states
- `src/components/nanobites/system/TerminalProvisionGate.tsx` — root container
- `src/components/nanobites/system/AuthGate.tsx` — root container
- `src/lib/idia/LiquidOS.tsx` — loading, error, selection, and operational root containers

### 3. Lock the operational grid rows
In `src/lib/idia/LiquidOS.tsx`:

- Replace the grid's `auto-rows-fr` Tailwind class with an inline style:
  ```ts
  gridAutoRows: 'minmax(0, 1fr)'
  ```
  This prevents grid rows from expanding when card content is tall.
- Wrap each `NanoBiteRenderer` in a `min-h-0 overflow-hidden` cell so the grid item cannot force row growth.

### 4. Condense `SovereignWrapper` to fit its cell
In `src/components/sovereign/SovereignWrapper.tsx`:

- Remove the `minHeight: 160px` style that forces the card taller than its grid row.
- Change the content stage from `min-h-[44px]` to `min-h-0 overflow-hidden` so it shrinks instead of pushing the card footer out of frame.
- Keep the header/footer borders visible but allow the whole card to scale down to the available grid cell.

### 5. Verify the frame is frozen
Use a Playwright script against `http://localhost:8080` to:

- Confirm no vertical/horizontal scrollbars are present on the provision, auth, and operational screens.
- Screenshot the operational grid and confirm the Sovereign header/footer borders are fully visible and stationary within the viewport.

## Outcome
The entire app shell becomes a fixed viewport frame. The header and footer borders of each Nano-Bite stay in place, and any excess content is truncated/condensed rather than causing the page to scroll.