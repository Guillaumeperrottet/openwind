# Design: Openwind

Shared system for the map and spot app screens. Preserve the existing site shell, logo, data palette and all product behavior.

## System
- Genre: modern-minimal.
- Shape: app screen. The map and weather observations are the primary material.
- Theme: Openwind brand, derived from the existing sky and slate palette.
- Posture: restrained. Accent identifies actions and selections; weather colors encode real values.

## Tokens
`src/styles/openwind/tokens.css` is the source of truth. All new app colors and typography use its `--ow-*` roles. Existing Tailwind tokens remain available to untouched screens.
- Surface: white and slate paper. Ink: slate 900, secondary slate 700, muted slate 600.
- Accent: existing sky 800. Focus: sky 700.
- Typography: system sans, with tabular weather figures. Existing logo retained.
- Scale: 13px captions, 14px labels, 16px body, 20px section heads, 32px page titles.
- Spacing: 4, 8, 12, 16, 24, 32, 48, 64px.
- Controls: 44px touch targets. 8px control radius; 16px floating panels.
- Spot container: 1184px. Map remains full width for navigation.

## Controls
Map commands use one compact row: labeled sport filters, then wind and home icons with accessible names. Spot pages show current conditions, the 48-hour history, the detailed Windguru-style forecast table, then the 7-day forecast chart. A shortcut at the top jumps directly to the detailed forecast.

One primary treatment: sky 800 with white text. Secondary controls use ink, a quiet surface, and a visible selection. Focus appears immediately. Every icon-only action has an accessible name.

## Motion
Still by default. State feedback only; no automatic marketing movement. Reduced-motion users retain all content and controls.

## Exports
- `src/styles/openwind/tokens.css`
- `src/styles/openwind/base.css`, scoped to the map, popups and spot pages.
