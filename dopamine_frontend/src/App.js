import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Dopamine Clicker — Minimal, Dopamine-friendly UI matching extracted design
 * - Rectangular 'click me' CTA button centered with specified styling
 * - Stats (main and sub) below, centered, with correct typography and spacing
 * - Upgrades: hidden unless unlocked, then shown as small square boxes with 3px round border
 * - No sidebar or legacy upgrades UI; left logo stack remains
 * - Minimal, central, bold, 'dopamine'-clean aesthetic
 */

// PUBLIC_INTERFACE
function App() {
  // Activation animation (simulated boot delay)
  const [activated, setActivated] = useState(false);

  // Main stat & passive stat
  const [stimulation, setStimulation] = useState(0);
  const [dps, setDps] = useState(0);

  // Upgrades logic: show only unlocked boxes in row
  const [upgrades, setUpgrades] = useState({
    autobtn: false,      // threshold: 10
    fancyrect: false,    // 20
    emoji: false,        // 30
    party: false,        // 40
    cake: false,         // 50
  });

  // Unlock upgrades at stimulation milestones
  useEffect(() => {
    setUpgrades(prev => ({
      ...prev,
      autobtn: prev.autobtn || stimulation >= 10,
      fancyrect: prev.fancyrect || stimulation >= 20,
      emoji: prev.emoji || stimulation >= 30,
      party: prev.party || stimulation >= 40,
      cake: prev.cake || stimulation >= 50,
    }));
  }, [stimulation]);

  // Enable passive DPS when autobtn is unlocked
  useEffect(() => {
    setDps(upgrades.autobtn ? 1 : 0);
  }, [upgrades.autobtn]);

  // Passive stimulation tick
  useEffect(() => {
    if (activated && dps > 0) {
      const tick = setInterval(() => setStimulation(s => s + dps), 1000);
      return () => clearInterval(tick);
    }
  }, [activated, dps]);

  // Initial activation (short delay to mimic 'engine booting')
  useEffect(() => {
    const timer = setTimeout(() => setActivated(true), 650);
    return () => clearTimeout(timer);
  }, []);

  // PUBLIC_INTERFACE
  function handleClick() {
    if (activated) setStimulation(s => s + 1);
  }

  // Strict upgrade row config: order & badge for the first box
  const designUpgrades = [
    {
      key: "autobtn",
      icon: "🤖", // This shows the notification badge when unlocked (per design)
      badge: true,
    },
    {
      key: "fancyrect",
      icon: "🟫",
    },
    {
      key: "emoji",
      icon: "🧠",
    },
    {
      key: "party",
      icon: "🎉",
    },
    {
      key: "cake",
      icon: "🍰",
    },
  ];

  return (
    <div className="dopamine-simple-root">
      {/* Top minimalist status bar */}
      <div className="dopamine-statusbar">
        <span className="dopamine-statusbar-text">
          demo v1.0 - dopamine clicker idle
        </span>
      </div>
      <div className="dopamine-content-wrapper">
        {/* Main central column: button, stats, upgrades */}
        <main className="dopamine-center-main">
          {!activated ? (
            <div className="dopamine-preloader">Booting Dopamine Engine...</div>
          ) : (
            <>
              <button
                className="dopamine-cta-btn"
                onClick={handleClick}
                aria-label="click me"
                tabIndex={0}
              >
                click me
              </button>
              <div className="dopamine-stats-stack">
                <div className="dopamine-mainstat">{stimulation} stimulation</div>
                <div className="dopamine-substat">{dps} stimulation per second</div>
              </div>
              <div className="dopamine-upgrades-row">
                {designUpgrades.map(upg =>
                  upgrades[upg.key] ? (
                    <div className="dopamine-upgrade-box" key={upg.key}>
                      <span className="dopamine-upgrade-icon">{upg.icon}</span>
                      {upg.badge && (
                        <span className="dopamine-upgrade-badge" title="new!" />
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
