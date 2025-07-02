import React from "react";
import "./App.css";

/**
 * Dopamine Tooltip v2 — modular, matches exact dopamine spec and image.
 * - Use for ALL upgrade and relevant elements.
 * 
 * @param {boolean} visible - Whether the tooltip is visible.
 * @param {string} title - The main bold title of the tooltip.
 * @param {string} desc - The description/subtext of the tooltip.
 * @param {string} [customClass] - Additional className(s).
 * @returns {JSX.Element}
 */
// PUBLIC_INTERFACE
function Tooltip({ visible, title, desc, customClass }) {
  return (
    <div
      className={
        "dopamine-tooltip" +
        (visible ? " visible" : "") +
        (customClass ? " " + customClass : "")
      }
      role="tooltip"
      aria-live="polite"
      aria-hidden={!visible}
    >
      <span className="dopamine-tooltip-title">{title}</span>
      <span className="dopamine-tooltip-subline">{desc}</span>
    </div>
  );
}

export default Tooltip;
