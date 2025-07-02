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
  // --- ADD DVD BOX UPGRADE HERE ---
  {
    key: "dvdbox",
    title: "DVD Box",
    icon: "💿",
    description: "Adds a bouncing DVD! Each purchase = 1 more, up to 30.",
    initialCost: 44,
    costFn: (count) => Math.floor(44 * Math.pow(2.35, count)),
    max: 30,
    effect: null, // visual only, no stat change
  },
  // ---
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

  // ---- Bouncing DVD Logic ----

  // Helper: returns N random directions (unit vectors) for DVDs
  function getInitialDVDs(count, boxW, boxH, size=44) {
    // center spawn, each DVD with unique random angle
    let arr = [];
    for (let i = 0; i < count; ++i) {
      // random angle/direction
      const angle = Math.random() * 2 * Math.PI;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      // position random (avoid edges), prevent exact overlap
      const x = (boxW/2) + Math.cos(angle) * (boxW/5) + (Math.random() * 12 - 6);
      const y = (boxH/2) + Math.sin(angle) * (boxH/5) + (Math.random() * 12 - 6);
      arr.push({
        x, y,
        dx,
        dy,
        speed: 1.15 + Math.random()*0.65, // ~1-1.8 px/tick
        color: "#4431e6", // or add color per DVD, e.g., null for emoji
        id: i + "-" + String(Math.round(Math.random()*99999)),
        icon: "💿",
      });
    }
    return arr;
  }

  // "Bouncing DVDs" area is present only if at least 1 DVD box purchased and after activated
  const dvdCount = activated ? (upgradeState.dvdbox?.count || 0) : 0;
  // Main DVD Bounce React state: array of dvd objects (position, direction etc)
  const [dvdBounces, setDvds] = useState([]);
  // State for boundary size (needed for boundary collisions)
  const [dvdBoxSize, setDvdBoxSize] = useState({w: 320, h: 110});
  // Ref to bouncing area, so we can resize/reposition on window size change
  const dvdBoxRef = React.useRef(null);

  // When DVD count changes, add extra DVD(s) if needed
  useEffect(() => {
    if (!activated || dvdCount < 1) {
      setDvds([]);
      return;
    }
    setDvds((prev) => {
      // If more needed, add them randomly (preserve others)
      if (prev.length < dvdCount) {
        // Insert new DVDs
        const newOnes = getInitialDVDs(
          dvdCount - prev.length,
          dvdBoxSize.w,
          dvdBoxSize.h
        );
        return [...prev, ...newOnes];
      }
      // If less, trim (should not happen except on test)
      if (prev.length > dvdCount) {
        return prev.slice(0, dvdCount);
      }
      return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dvdCount, activated, dvdBoxSize.w, dvdBoxSize.h]);

  // Responsive: update box size on window resize
  useEffect(() => {
    function handleResize() {
      // Use boundary box
      if (dvdBoxRef.current) {
        const rect = dvdBoxRef.current.getBoundingClientRect();
        setDvdBoxSize({ w: rect.width, h: rect.height });
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animation: move every DVD every N ms and handle bounces
  useEffect(() => {
    if (!activated || !dvdBounces.length) return;
    let stopped = false;
    // Each DVD: has x, y, dx, dy, speed
    function moveStep() {
      setDvds(prev => {
        return prev.map(dvd => {
          let {x, y, dx, dy, speed} = dvd;
          // Move (speed px)
          let nx = x + dx * speed;
          let ny = y + dy * speed;
          let ndx = dx, ndy = dy;
          const S = 43; // DVD size
          // Bounce X
          if (nx < 0) { nx = 0; ndx = -dx; }
          if (nx > dvdBoxSize.w - S) { nx = dvdBoxSize.w - S; ndx = -dx; }
          // Bounce Y
          if (ny < 0) { ny = 0; ndy = -dy; }
          if (ny > dvdBoxSize.h - S) { ny = dvdBoxSize.h - S; ndy = -dy; }
          // (In theory this prevents stuck, if edge exactly, add jitter)
          if (nx === 0 || nx === dvdBoxSize.w - S) {
            ndx += (Math.random()-0.5) * 0.15;
          }
          if (ny === 0 || ny === dvdBoxSize.h - S) {
            ndy += (Math.random()-0.5) * 0.15;
          }
          // Normalise
          let mag = Math.sqrt(ndx*ndx + ndy*ndy);
          if (mag < 0.2) { ndx = 1; ndy = 0.6; mag = Math.sqrt(ndx*ndx + ndy*ndy);}
          ndx /= mag; ndy /= mag;
          return { ...dvd, x: nx, y: ny, dx: ndx, dy: ndy };
        });
      });
      if (!stopped) requestAnimationFrame(moveStep);
    }
    requestAnimationFrame(moveStep);

    return () => { stopped = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activated, dvdBounces.length, dvdBoxSize.w, dvdBoxSize.h]);

  // ---- DVD Bounce Component ----
  function DVDBounceArea() {
    // Only show if there are any DVDs currently
    if (!activated || dvdCount < 1) return null;
    return (
      <div
        className="dvd-bounce-area"
        ref={dvdBoxRef}
        style={{
          width: "100%",
          maxWidth: 320,
          minHeight: 110,
          height: 110,
          position: "relative",
          marginBottom: 22,
          marginTop: 4,
          background: "#fafafc",
          border: "1.7px solid #bbb",
          borderRadius: 12,
          boxShadow: "0 2px 9px #eaeaea99, 0 1px 4px #eee6",
          overflow: "hidden",
          transition: "border 0.27s, box-shadow 0.22s"
        }}
        aria-label={`Bouncing DVD Area with ${dvdCount} DVD${dvdCount>1?'s':''}`}
      >
        {/* Show live count label */}
        <div style={{
          position: "absolute",
          top: 5, left: 11, fontSize: 13.6, fontWeight: 500, color: "#4431e6bb",
          textShadow: "0 1px 0 #fff, 0 1.5px 5px #8878c477"
        }}>
          {dvdCount} DVD{dvdCount > 1 ? "s" : ""}
        </div>
        {/* Each DVD icon (absolutely positioned) */}
        {dvdBounces.map((dvd, i) => (
          <span
            key={dvd.id || i}
            className="bouncing-dvd"
            style={{
              left: dvd.x,
              top: dvd.y,
              position: "absolute",
              width: 43, height: 43,
              fontSize: 33,
              cursor: "pointer",
              userSelect: "none",
              textShadow: "0 0 4px #eee,0 1.5px 12px #bbb2",
              filter:
                "drop-shadow(0 0 4px #7755bb77)" +
                (i % 7 === 0 ? " hue-rotate(85deg)" : "") +
                (i % 7 === 1 ? " hue-rotate(-55deg)" : "") +
                (i % 7 === 2 ? " saturate(1.6)" : ""),
              animation: (i % 3 === 0 ? "spinBounce 2.7s linear infinite" :
                          i % 3 === 1 ? "spinBounce 3.7s linear infinite reverse" :
                          "spinBounce 3.1s linear infinite") // Add subtle rotation
            }}
            aria-label="Bouncing DVD"
            title="DVD"
          >
            {dvd.icon}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="dopamine-simple-root">
      {/* Top minimalist status bar */}
      <div className="dopamine-statusbar">
        <span className="dopamine-statusbar-text">
          dopamine demo v1.0 — clicker idle
        </span>
      </div>
      <div className="dopamine-content-wrapper">
        {/* ---- BOUNCING DVD EFFECT AREA ---- */}
        <DVDBounceArea/>
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
