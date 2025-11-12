# Mobile Layout Audit (≤768px)

- `Navigation`: horizontal nav stack overflows, no hamburger; status badge and logo crowd layout; link padding <44px and sticky bar lacks compact mode.
- `Dashboard`: `max-w-[1800px]` container with large padding creates horizontal scroll; multi-column grids (`md`, `xl`, `2xl`) keep 2–4 columns causing card squish; headings (`text-4xl`) dominate viewport and status chips overflow.
- `Quotes`: chat bubbles fixed at `max-w-[80%]` with heavy padding; footer input/button row wraps; sidebar cards retain desktop spacing so actions/tap targets feel tight; scenario buttons <44px tall.
- `LoadMatching`: `grid-cols-4` only breaks at `lg`; map locked at `h-[500px]`; panels have nested scrolls with narrow buttons; vehicle accordion toggle icon too small for touch.
- `RoutePlanning`: retains `xl:grid-cols-4` structure on tablets; map fixed `h-[360px]`; comparison grids stay 4-up until `lg` causing cramped metrics; long labels wrap unpredictably.
- Global components (`GlassCard`, `GlowButton`, base typography): default `p-6` and large font scales, no responsive adjustments; buttons and inputs lack ≥44px touch padding; limited `sm:`/`md:` classes for spacing or typography.

