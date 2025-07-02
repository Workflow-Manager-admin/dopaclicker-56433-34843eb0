import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Dopamine Clicker — now with Modular Upgrade UI and Explicit Purchase Logic
 *
 * - All upgrades live in styled card/box modules under the stats.
 * - Each card: title, tooltip/description (hover), real-time cost, buy button, count/max, disables at max, feedback on insufficient points.
 * - All buy logic per user specification; effect only on explicit purchase.
 * - Styling directly inspired by design notes and PNG.
 */

// All possible upgrade configs: title, description, cost+effect formulas, max units, etc.
// (Cost formulas, max, and effects here can be adjusted as needed)

const UPGRADE_DEFS = [
  {
    key: "autobtn",
    title: "Auto Clicker",
    icon: "🤖",
    description: "Grants +1 passive stimulation/sec. First step to automation.",
    initialCost: 15,
    costFn: (count) => Math.floor(15 * Math.pow(2, count)),
    max: 1,
    effect: (currentDps, count) => currentDps + 1,
  },
  {
    key: "fancyrect",
    title: "Fancy Rectangle",
    icon: "🟫",
    description: "Makes the button extra-beautiful. No effect, just swag.",
    initialCost: 22,
    costFn: (count) => Math.floor(22 * Math.pow(1.9, count)),
    max: 2,
    effect: (current, count) => current, // Cosmetic only
  },
  {
    key: "emoji",
    title: "Brain Emoji",
    icon: "🧠",
    description: "Doubles click value (each click gives +2).",
    initialCost: 42,
    costFn: (count) => Math.floor(42 * Math.pow(2.5, count)),
    max: 1,
    effect: null, // Special logic flag
  },
  {
    key: "party",
    title: "Party Mode",
    icon: "🎉",
    description: "Parties = more dopamine! Doubles per-sec gain.",
    initialCost: 140,
    costFn: (count) => Math.floor(140 * Math.pow(2.3, count)),
    max: 1,
    effect: null, // Special logic flag
  },
  {
    key: "cake",
    title: "Cake Day",
    icon: "🍰",
    description: "Cake gives 2x points forever (click and per/sec)!",
    initialCost: 333,
    costFn: (count) => Math.floor(333 * Math.pow(3, count)),
    max: 1,
    effect: null, // Special logic flag
  },
];

// Upgrade unlock milestones (in order, by stimulation count)
const UPGRADE_UNLOCKS = {
  autobtn: 10,
  fancyrect: 20,
  emoji: 30,
  party: 40,
  cake: 50,
};

// PUBLIC_INTERFACE
function App() {
  // Activation animation (simulated boot delay)
  const [activated, setActivated] = useState(false);

  // Main stats: stimulation = "stimulusPoints", dps = passive per/sec gain
  const [stimulusPoints, setStimulusPoints] = useState(0);
  const [dps, setDps] = useState(0);

  // Upgrade counts (object: key -> { count, unlocked })
  const [upgradeState, setUpgradeState] = useState(
    Object.fromEntries(
      UPGRADE_DEFS.map(u => [
        u.key,
        { count: 0, unlocked: false }
      ])
    )
  );

  // Click multiplier based on upgrades (emoji/cake, etc)
  const [clickMultiplier, setClickMultiplier] = useState(1);

  // Display feedback for failed purchase (insufficient points, animate/shake)
  const [buyFeedback, setBuyFeedback] = useState({}); // { key: "err"|"succ", ... }

  // UI: show effect of "fancyrect" visually upon unlock
  const hasFancyRect =
    upgradeState.fancyrect.unlocked && upgradeState.fancyrect.count > 0;

  // Unlock upgrades at milestones
  useEffect(() => {
    setUpgradeState(prev => {
      const next = { ...prev };
      for (const upg of UPGRADE_DEFS) {
        if (
          !prev[upg.key].unlocked &&
          stimulusPoints >= UPGRADE_UNLOCKS[upg.key]
        ) {
          next[upg.key] = {
            ...prev[upg.key],
            unlocked: true,
          };
        }
      }
      return next;
    });
  }, [stimulusPoints]);

  // Dynamic effect recalculation for upgrades
  useEffect(() => {
    // DPS baseline is 0
    let ndps = 0;
    let cmul = 1;
    // AutoBtn: +1 per autobtn
    ndps += upgradeState.autobtn.count * 1;
    // Party: 2x dps
    if (upgradeState.party.count > 0) ndps *= 2;
    // Cake: 2x all points
    if (upgradeState.cake.count > 0) {
      ndps *= 2;
      cmul *= 2;
    }
    // Emoji: clicks give +2 (doubled if cake active)
    if (upgradeState.emoji.count > 0) cmul *= 2;
    setDps(ndps);
    setClickMultiplier(cmul);
  }, [
    upgradeState.autobtn.count,
    upgradeState.party.count,
    upgradeState.cake.count,
    upgradeState.emoji.count
  ]);

  // Passive tick, only while activated
  useEffect(() => {
    if (activated && dps > 0) {
      const tick = setInterval(() => setStimulusPoints(s => s + dps), 1000);
      return () => clearInterval(tick);
    }
  }, [activated, dps]);

  // Initial boot/activation
  useEffect(() => {
    const timer = setTimeout(() => setActivated(true), 650);
    return () => clearTimeout(timer);
  }, []);

  // PUBLIC_INTERFACE
  function handleClick() {
    if (!activated) return;
    setStimulusPoints(sp => sp + clickMultiplier);
  }

  // PUBLIC_INTERFACE
  function handleBuy(key) {
    // Defensive: look up upgrade config
    const upgDef = UPGRADE_DEFS.find(u => u.key === key);
    if (!upgDef) return;

    const currCount = upgradeState[key].count;
    const cost = upgDef.costFn(currCount);

    if (
      upgradeState[key].count >= upgDef.max ||
      !upgradeState[key].unlocked
    ) {
      // Should not buy if maxed or locked
      return;
    }

    if (stimulusPoints < cost) {
      setBuyFeedback((b) => ({ ...b, [key]: "err" }));
      setTimeout(() => setBuyFeedback((b) => ({ ...b, [key]: undefined })), 700);
      return;
    }

    // Deduct, increment, and apply special effect logic ONLY ON PURCHASE
    setStimulusPoints(sp => sp - cost);
    setUpgradeState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        count: prev[key].count + 1
      }
    }));
    setBuyFeedback((b) => ({ ...b, [key]: "succ" }));
    setTimeout(() => setBuyFeedback((b) => ({ ...b, [key]: undefined })), 450);
  }

  // Modular Upgrade Box/Card
  // PUBLIC_INTERFACE
  function UpgradeCard({ upg, state, buyFeedback, onBuy }) {
    const cost = upg.costFn(state.count);
    const maxed = state.count >= upg.max;
    // Style: shake/card error on feedback
    let cardClass = "dopamine-mod-upgrade-card";
    if (buyFeedback?.[upg.key] === "err") cardClass += " dopamine-upgrade-card-shake";
    if (buyFeedback?.[upg.key] === "succ") cardClass += " dopamine-upgrade-card-succ";
    if (maxed) cardClass += " dopamine-upgrade-card-maxed";

    return (
      <div className={cardClass}>
        <div className="dopamine-mod-upgrade-header">
          <span
            className="dopamine-upgrade-icon"
            title={upg.title}
            aria-label={upg.title}
            style={{ fontSize: "2.1rem", verticalAlign: "middle" }}
          >
            {upg.icon}
          </span>
          <span className="dopamine-mod-upgrade-title">{upg.title}</span>
        </div>
        <div
          className="dopamine-mod-upgrade-desc"
          title={upg.description}
          style={{ color: "#666", fontSize: "13.5px", marginBottom: 6, minHeight: 18 }}
        >
          {upg.description}
        </div>
        <div className="dopamine-mod-upgrade-details" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4
        }}>
          <span className="dopamine-mod-upgrade-count" aria-label="Count/max">
            {state.count} / {upg.max}
          </span>
          <span className="dopamine-mod-upgrade-cost" aria-label="Cost">
            {maxed ? "Maxed!" : `Cost: ${cost}`}
          </span>
        </div>
        <button
          className="dopamine-mod-upgrade-buy-btn"
          onClick={() => onBuy(upg.key)}
          disabled={maxed || stimulusPoints < cost}
          aria-label={`Buy ${upg.title}${maxed ? " (maxed)" : ""}`}
        >
          {maxed ? "Purchased" : `Buy`}
        </button>
        {buyFeedback?.[upg.key] === "err" && (
          <div className="dopamine-buy-err" role="alert">
            Need more stimulation!
          </div>
        )}
      </div>
    );
  }

  // Generate the list of unlocked upgrades in order
  const unlockedUpgrades = UPGRADE_DEFS.filter(
    upg => upgradeState[upg.key] && upgradeState[upg.key].unlocked
  );

  return (
    <div className="dopamine-simple-root">
      {/* Top minimalist status bar */}
      <div className="dopamine-statusbar">
        <span className="dopamine-statusbar-text">
          dopamine demo v1.0 — clicker idle
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
                className={`dopamine-cta-btn${hasFancyRect ? " dopamine-cta-btn-fancy" : ""}`}
                onClick={handleClick}
                aria-label="click me"
                tabIndex={0}
              >
                click me
              </button>
              <div className="dopamine-stats-stack">
                <div className="dopamine-mainstat">{stimulusPoints} stimulation</div>
                <div className="dopamine-substat">{dps} stimulation per second</div>
              </div>
              {/* Upgrades modular cards layout */}
              {unlockedUpgrades.length > 0 && (
                <div className="dopamine-upgrades-cards-col">
                  {unlockedUpgrades.map((upg) => (
                    <UpgradeCard
                      key={upg.key}
                      upg={upg}
                      state={upgradeState[upg.key]}
                      buyFeedback={buyFeedback}
                      onBuy={handleBuy}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
