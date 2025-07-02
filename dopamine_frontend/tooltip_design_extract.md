# Dopamine Frontend Tooltip UI: Design Extract

## Layout & Structure
- Tooltip is horizontally centered beneath the hovered upgrade box.
- Capsule/pill shape: rounded rectangle, full border radius (16px).
- Max width: 320px, min width: 180px; responsive.
- Padding: 16px top/bottom, 20px left/right.
- Margin from upgrade: 12px.

## Visual Style
- Background: #FFF (pure white).
- Border: 1px solid #ECECEC.
- Shadow: 0 6px 48px rgba(24,30,55,0.15) (soft, diffused).
- z-index: 1000 (always above all game content).

## Typography
- Font-family: 'Helvetica Neue', Arial, sans-serif.
- Title (upgrade name): 16px, font-weight 600, color #181E37.
- Subline (upgrade desc): 13px, weight 400, color #6E7381.
- Title-subline spacing: 2px.

## Animation & Behavior
- Appears on hover or focus of interactive upgrade elements (cards/boxes).
- Visibility Animation: Fade in/out, 120ms cubic-bezier(.4,0,.2,1).
- Pointer events: none (does not capture hover/focus).
- No text transformation; centered sharp text, never faint/washed out.

## CSS Example
```css
:root {
  --tooltip-bg: #FFF;
  --tooltip-border: #ECECEC;
  --tooltip-radius: 16px;
  --tooltip-shadow: 0 6px 48px rgba(24,30,55,0.15);
  --tooltip-title: #181E37;
  --tooltip-subtext: #6E7381;
  --tooltip-padding-y: 16px;
  --tooltip-padding-x: 20px;
  --tooltip-font: 'Helvetica Neue', Arial, sans-serif;
}
.dopamine-tooltip {
  background: var(--tooltip-bg);
  border: 1px solid var(--tooltip-border);
  border-radius: var(--tooltip-radius);
  box-shadow: var(--tooltip-shadow);
  color: var(--tooltip-title);
  font-family: var(--tooltip-font);
  padding: var(--tooltip-padding-y) var(--tooltip-padding-x);
  max-width: 320px;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  pointer-events: none;
  transition: opacity 0.12s cubic-bezier(.4,0,.2,1);
  z-index: 1000;
  margin-top: 12px;
  opacity: 0;
  visibility: hidden;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.dopamine-tooltip.visible {
  opacity: 1;
  visibility: visible;
}
.dopamine-tooltip-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--tooltip-title);
  margin-bottom: 2px;
  line-height: 1.33;
}
.dopamine-tooltip-subline {
  font-size: 13px;
  font-weight: 400;
  color: var(--tooltip-subtext);
  line-height: 1.5;
}
```

## Implementation Notes
- Must be used for ALL upgrade cards/boxes in dopamine_frontend via React, matching hover/focus triggers.
- Arrow/triangle not specified; pill shape only.
- Absolutely positioned relative to upgrade box container.
- No pointer/click handlers on tooltip.
