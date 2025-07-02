import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Dopamine Clicker Minimal Opening UI
 *
 * - On app load: only the central "click me" button is visible, fading in over 2 seconds.
 * - Stats ("0 stimulation", "0 stimulation per second") hidden initially, fade in or appear after first click.
 * - No other elements are visible before first click.
 */

// PUBLIC_INTERFACE
function App() {
  // Track fade-in status for button
  const [buttonVisible, setButtonVisible] = useState(false);
  // Has the button ever been clicked?
  const [hasClicked, setHasClicked] = useState(false);

  // Stats state (always start at 0 as per requirements)
  const [stimulusPoints, setStimulusPoints] = useState(0);
  const [dps, setDps] = useState(0);

  // Fade in the button after mount (over 2 seconds)
  useEffect(() => {
    // Use a timeout so the transition works properly
    const timer = setTimeout(() => setButtonVisible(true), 20); // Short delay triggers CSS transition
    return () => clearTimeout(timer);
  }, []);

  // PUBLIC_INTERFACE
  function handleButtonClick() {
    if (!hasClicked) setHasClicked(true);
    setStimulusPoints(sp => sp + 1);
  }

  return (
    <div className="dopamine-simple-root minimalist-mode">
      <div className="dopamine-content-wrapper">
        <main className="dopamine-center-main only-button-main">
          {/* Fade-in button */}
          <button
            className={`dopamine-cta-btn fade-in-btn${buttonVisible ? " visible" : ""}`}
            style={{
              transition: "opacity 2s cubic-bezier(0.23, 1, 0.32, 1)",
              opacity: buttonVisible ? 1 : 0,
            }}
            onClick={handleButtonClick}
            aria-label="click me"
            tabIndex={0}
            autoFocus
          >
            click me
          </button>
          {/* Stats appear only after first click, can fade in too */}
          <div
            className={`dopamine-stats-stack${hasClicked ? " stats-visible" : ""}`}
            style={{
              opacity: hasClicked ? 1 : 0,
              transition: "opacity 0.56s cubic-bezier(.27,.97,.45,1.01)",
              pointerEvents: hasClicked ? "auto" : "none",
              height: hasClicked ? undefined : 0,
              marginTop: hasClicked ? 0 : "-6px"
            }}
            aria-hidden={!hasClicked}
          >
            <div className="dopamine-mainstat">{stimulusPoints} stimulation</div>
            <div className="dopamine-substat">{dps} stimulation per second</div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
