import React, { useState } from "react";
import "./App.css";
import Tooltip from "./Tooltip";

// --- Placeholder SVGs per upgrade; these should match design look
const upgradeSvgs = {
  auto_click: (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="13" fill="#f7f6fd" stroke="#bbb" strokeWidth="1"/>
      <path d="M8 19l12-5-5 12-1-4-4 4 5-12z" fill="#888"/>
    </svg>
  ),
  visual_zone: (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="13" fill="#fff1eb" stroke="#bbb" strokeWidth="1"/>
      <ellipse cx="14" cy="14" rx="10" ry="7" fill="#bbb"/>
      <ellipse cx="14" cy="14" rx="8" ry="5" fill="#fde9ca"/>
      <ellipse cx="14" cy="14" rx="4" ry="2" fill="#888"/>
    </svg>
  ),
  meme_inbox: (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="13" fill="#eefff6" stroke="#bbb" strokeWidth="1"/>
      <rect x="7" y="10" width="14" height="8" rx="3" fill="#b1ebc5"/>
      <rect x="9" y="12" width="10" height="4" rx="1" fill="#fff"/>
      <circle cx="12" cy="14" r="1" fill="#888"/>
      <circle cx="16" cy="14" r="1" fill="#888"/>
    </svg>
  ),
  music_lofi: (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="13" fill="#f5f8ff" stroke="#bbb" strokeWidth="1"/>
      <ellipse cx="14" cy="18" rx="6" ry="3" fill="#add8ff"/>
      <rect x="12.5" y="6" width="3" height="10" rx="1.5" fill="#bbb"/>
      <circle cx="14" cy="10.5" r="2.2" fill="#888"/>
    </svg>
  ),
  rain_mode: (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="13" fill="#fff4f1" stroke="#bbb" strokeWidth="1"/>
      <ellipse cx="14" cy="15" rx="7" ry="4" fill="#fdc28d"/>
      <rect x="10" y="8" width="2" height="8" rx="1" fill="#888"/>
      <rect x="16" y="10" width="2" height="6" rx="1" fill="#f25c24"/>
    </svg>
  ),
};

const upgradesList = [
  {
    key: "auto_click",
    name: "Auto Clicker",
    desc: "Automatically generates 1 stimulation every second.",
    icon: upgradeSvgs.auto_click,
  },
  {
    key: "visual_zone",
    name: "Zone Unlocked",
    desc: "Unlocks a vibrant background visual effect zone.",
    icon: upgradeSvgs.visual_zone,
  },
  {
    key: "meme_inbox",
    name: "Inbox & Memes",
    desc: "Inbox tab unlocks with daily internet memes.",
    icon: upgradeSvgs.meme_inbox,
  },
  {
    key: "music_lofi",
    name: "Lofi Beats",
    desc: "Listen to lofi music while clicking.",
    icon: upgradeSvgs.music_lofi,
  },
  {
    key: "rain_mode",
    name: "Rain Mode",
    desc: "Rains dopamine cubes on the button.",
    icon: upgradeSvgs.rain_mode,
    accent: true,
  },
];

// PUBLIC_INTERFACE
/**
 * UpgradesSection
 * Pixel-perfect upgrades row, button, and stat description per dopamine clicker spec/screenshot.
 *
 * @param {object} props
 * @param {number} stimulation - Current currency/points
 * @param {function} onButtonClick - Click handler for the main button
 * @param {object} unlockLevels - Which upgrades are unlocked (key: int level or boolean)
 * @param {object} hasUnseen - Map of which upgrades are new to show the red badge
 * @param {function} onUpgradeClick - Callback when clicking an upgrade icon
 * @param {number} dps - Current click automation rate
 * @returns {JSX.Element}
 */
function UpgradesSection({
  stimulation,
  onButtonClick,
  unlockLevels,
  hasUnseen,
  onUpgradeClick,
  dps,
}) {
  // Tooltip logic for icons
  const [hovered, setHovered] = useState(null);

  return (
    <div className="dopamine-upg-section-root"
      style={{
        minHeight: "68vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        width: "100%",
        position: "relative",
      }}>
      <button
        className="dopamine-upg-btn"
        onClick={onButtonClick}
        aria-label="Click me for stimulation"
        style={{
          outline: "none",
          border: "1px solid #D1D5DB",
          background: "#FFF",
          borderRadius: 4,
          padding: "8px 16px",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          color: "#222",
          minWidth: 130,
          marginBottom: 16,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          transition: "background 0.15s, border 0.16s",
        }}
      >Click me</button>
      <div
        className="dopamine-upg-desc-label"
        style={{
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          color: "#444",
          marginBottom: 24,
          textAlign: "center",
          minHeight: 24,
        }}
      >
        {`EE stimulation (${stimulation} total${dps ? `, ${dps}/sec` : ""})`}
      </div>
      <div
        className="dopamine-upg-row-flex"
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 24,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 24,
          minHeight: 53,
        }}
        role="toolbar"
        aria-label="Upgrade icons"
      >
        {upgradesList.map((u, idx) =>
          unlockLevels[u.key] > 0 ? (
            <div
              key={u.key}
              className="dopamine-upg-circ-container"
              tabIndex={0}
              aria-label={u.name}
              style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "#fff",
                border: "1px solid #D1D5DB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: hovered === idx ? "0 2px 8px rgba(0,0,0,0.09)" : undefined,
                cursor: "pointer",
                outline: hovered === idx ? "2px solid #f25c24" : "none",
              }}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(idx)}
              onBlur={() => setHovered(null)}
              onClick={() => onUpgradeClick(u)}
              aria-describedby={hovered === idx ? `tooltip-${u.key}` : undefined}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: u.accent ? "#F25C24" : "#888",
                  filter: u.accent ? "drop-shadow(0 2px 12px #fdc28d44)" : "none",
                }}
              >
                {u.icon}
              </span>
              {hasUnseen[u.key] && (
                <span
                  className="dopamine-upg-badge"
                  title="New upgrade"
                  style={{
                    position: "absolute",
                    left: 3.5,
                    top: 3.5,
                    width: 13,
                    height: 13,
                    background: "#ef4444",
                    borderRadius: "999px",
                    border: "2px solid #fff",
                    boxShadow: "0 0 0 1.5px #fff8",
                    zIndex: 10,
                  }}
                />
              )}
              <Tooltip
                visible={hovered === idx}
                title={u.name}
                desc={u.desc}
                customClass="dopamine-tooltip-upg-row"
                id={`tooltip-${u.key}`}
              />
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

export default UpgradesSection;
