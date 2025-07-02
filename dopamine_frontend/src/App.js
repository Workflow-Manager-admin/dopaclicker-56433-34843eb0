import React, { useState, useEffect } from "react";
import "./App.css";

// PUBLIC_INTERFACE
function App() {
  /**
   * Minimal dopamine clicker homepage matching design/screenshot:
   * - Left: vertical stack of two large "DVD" logos
   * - Top: slim status bar
   * - Center: "click me" button, stat lines, row of upgrade boxes
   * - Upgrades are hidden until each is unlocked (at thresholds)
   * - Fully centered/flexible, minimal state
   */
  const [activated, setActivated] = useState(false);
  const [stimulation, setStimulation] = useState(0);
  const [dps, setDps] = useState(0);

  // Minimal upgrades: incrementally unlocked by click count
  const [upgrades, setUpgrades] = useState({
    autobtn: false,      // unlocks at 10
    fancyrect: false,    // unlocks at 20
    emoji: false,        // unlocks at 30
    party: false,        // unlocks at 40
    cake: false,         // unlocks at 50
  });

  // Unlock upgrades as milestones are surpassed
  useEffect(() => {
    setUpgrades(u => ({
      ...u,
      autobtn: u.autobtn || stimulation >= 10,
      fancyrect: u.fancyrect || stimulation >= 20,
      emoji: u.emoji || stimulation >= 30,
      party: u.party || stimulation >= 40,
      cake: u.cake || stimulation >= 50,
    }));
  }, [stimulation]);

  // When autobtn upgrade is unlocked, enable auto-ticking (dps=1)
  useEffect(() => {
    setDps(upgrades.autobtn ? 1 : 0);
  }, [upgrades.autobtn]);

  // Passive stimulation per second
  useEffect(() => {
    if (dps > 0 && activated) {
      const interval = setInterval(() => setStimulation(s => s + dps), 1000);
      return () => clearInterval(interval);
    }
  }, [activated, dps]);

  // Simulate a short boot/activation delay
  useEffect(() => {
    const timer = setTimeout(() => setActivated(true), 750);
    return () => clearTimeout(timer);
  }, []);

  // PUBLIC_INTERFACE
  function handleClick() {
    if (activated) setStimulation(s => s + 1);
  }

  // All design upgrades, in design-matching row order
  const designUpgrades = [
    {
      key: "autobtn",
      icon: "🤖", // shows notification badge (red dot)
      badge: true,
    },
    {
      key: "fancyrect",
      icon: "🟫",
      badge: false,
    },
    {
      key: "emoji",
      icon: "🧠",
      badge: false,
    },
    {
      key: "party",
      icon: "🎉",
      badge: false,
    },
    {
      key: "cake",
      icon: "🍰",
      badge: false,
    },
  ];

  return (
    <div className="dopamine-simple-root">
      {/* Top status bar */}
      <div className="dopamine-statusbar">
        <span className="dopamine-statusbar-text">demo v1.0 - dopamine clicker idle</span>
      </div>
      <div className="dopamine-content-wrapper">
        {/* Left: logos */}
        <div className="dopamine-logo-col">
          <div className="dopamine-dvd-logo">DVD</div>
          <div className="dopamine-dvd-logo" style={{ marginTop: "16px" }}>DVD</div>
        </div>
        {/* Center/main */}
        <main className="dopamine-center-main">
          {!activated ? (
            <div className="dopamine-preloader">Booting Dopamine Engine...</div>
          ) : (
            <>
              {/* Button */}
              <button
                className="dopamine-cta-btn"
                onClick={handleClick}
                aria-label="click me"
                tabIndex={0}
              >
                click me
              </button>
              {/* Stats */}
              <div className="dopamine-stats-stack">
                <div className="dopamine-mainstat">{stimulation} stimulation</div>
                <div className="dopamine-substat">{dps} stimulation per second</div>
              </div>
              {/* Upgrades Row (show only unlocked, strict order) */}
              <div className="dopamine-upgrades-row">
                {designUpgrades.map((upg) =>
                  upgrades[upg.key] ? (
                    <div className="dopamine-upgrade-box" key={upg.key}>
                      <span className="dopamine-upgrade-icon">{upg.icon}</span>
                      {upg.badge && (
                        <span className="dopamine-upgrade-badge" />
                      )}
                    </div>
                  ) : null
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
