import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/**
 * MASTER DOPAMINE CLICKER GAME UI
 * - Handles button, upgrades, sound, achievements, notifications, automations, overlays, news/meme/music panels, zone/visuals.
 * - Responsive, a11y, and immersive. Modularized for clarity.
 */

// --------------- Utility functions

// PUBLIC_INTERFACE
function formatNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

// Sound effect URLs (replace with real hosted assets or use public domain ones)
const clickSounds = [
  "https://cdn.pixabay.com/audio/2022/03/15/audio_115b9e5fd9.mp3",
  "https://cdn.pixabay.com/audio/2022/10/16/audio_12b1fe26db.mp3"
];
const upgradeSound =
  "https://cdn.pixabay.com/audio/2022/07/26/audio_124bdbec48.mp3";
const achievementSound =
  "https://cdn.pixabay.com/audio/2022/10/16/audio_12b1fe26db.mp3";

// Demo lofi music, replace with Audius integration
const lofiMusicUrl =
  "https://cdn.pixabay.com/audio/2022/02/23/audio_115b6c0649.mp3";

// NEWS API endpoint (replace with real NewsAPI key for prod)
const newsUrl = "https://api.currentsapi.services/v1/latest-news?apiKey=demo";

// Meme API endpoint
const memeUrl = "https://api.imgflip.com/get_memes";

// Audius playlist mock (Audius has public feeds, can fetch client-side)
const audiusPlaylist = [
  {
    title: "Lofi Chill Song",
    url: lofiMusicUrl,
    artist: "Pixabay Music"
  }
];

// Upgrades definition
const coreUpgrades = [
  {
    key: "auto_click",
    name: "Auto Clicker",
    desc: "Automatically generates 1 stimulation every second.",
    baseCost: 20,
    icon: "⚡"
  },
  {
    key: "visual_zone",
    name: "Zone Unlocked",
    desc: "Unlocks a vibrant background visual effect zone.",
    baseCost: 60,
    icon: "🌀"
  },
  {
    key: "meme_inbox",
    name: "Inbox & Memes",
    desc: "Inbox tab unlocks with daily internet memes.",
    baseCost: 100,
    icon: "😹"
  },
  {
    key: "music_lofi",
    name: "Lofi Beats",
    desc: "Lets you play lofi music in the background.",
    baseCost: 180,
    icon: "🎵"
  },
  {
    key: "rain_mode",
    name: "Rain Mode",
    desc: "Rains dopamine cubes on the button.",
    baseCost: 270,
    icon: "🌧️"
  }
];

// Achievements definition (sample)
const allAchievements = [
  {
    key: "first_click",
    name: "First Juice",
    desc: "You clicked the button!",
    condition: (stats) => stats.totalClicks >= 1
  },
  {
    key: "hundred_clicks",
    name: "Centurion",
    desc: "100 total clicks? We admire your commitment.",
    condition: (stats) => stats.totalClicks >= 100
  },
  {
    key: "zone_unlocked",
    name: "Zonebender",
    desc: "You unlocked the vibrant zone.",
    condition: (stats) => stats.upgrades.visual_zone > 0
  },
  {
    key: "lofi_music",
    name: "Vibe Curator",
    desc: "The lofi music soothes your brain.",
    condition: (stats) => stats.upgrades.music_lofi > 0
  }
];

// -------------------- COMPONENTS

// PUBLIC_INTERFACE
function StatusBar({ news, connStatus }) {
  // Top sticky status bar (rendered at all times after initial minimalist phase)
  return (
    <nav className="dopamine-statusbar" aria-live="polite">
      <span className="dopamine-statusbar-text" style={{ marginRight: 18 }}>
        {connStatus}
      </span>
      <span className="dopamine-statusbar-text">
        <NewsTicker news={news} />
      </span>
    </nav>
  );
}

// PUBLIC_INTERFACE
function NewsTicker({ news }) {
  // News scrolling ticker
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!news || news.length === 0) return;
    const id = setInterval(() => setI((v) => (v + 1) % news.length), 6000);
    return () => clearInterval(id);
  }, [news]);
  if (!news || news.length === 0) return <span>&nbsp;</span>;
  return (
    <span className="stock-ticker">{news[i]?.title || ""}</span>
  );
}

// PUBLIC_INTERFACE
function CenterClicker({ stimulus, dps, click, upgrades, onButtonFlash, buttonClassName, transitionStyle, accessible, disabled }) {
  // Click button + stats
  return (
    <main className="dopamine-center-main">
      <button
        className={`dopamine-cta-btn${buttonClassName ? " " + buttonClassName : ""}`}
        style={transitionStyle}
        aria-label="Click me for stimulation"
        aria-disabled={!!disabled}
        onClick={click}
        disabled={!!disabled}
        tabIndex={0}
      >
        click me
      </button>
      <div
        className="dopamine-stats-stack stats-visible"
        style={{
          opacity: 1, pointerEvents: "auto", height: "auto", marginTop: 0
        }}
        aria-live="polite"
      >
        <div className="dopamine-mainstat">{formatNum(stimulus)} stimulation</div>
        <div className="dopamine-substat">{formatNum(dps)} stimulation per second</div>
      </div>
      {/* Animated overlay, e.g. rain? */}
      {upgrades.rain_mode > 0 && <RainVisual />}
    </main>
  );
}

// PUBLIC_INTERFACE
function UpgradesRow({ upgradesDef, unlockLevels, hasUnseen, onUpgradeClick }) {
  // Renders the 5 small upgrade icons/boxes in a row (show if unlocked)
  return (
    <section className="dopamine-upgrades-row" role="toolbar" aria-label="Upgrades">
      {upgradesDef.map((u, idx) =>
        unlockLevels[u.key] > 0 ? (
          <div key={u.key} className="dopamine-upgrade-box" tabIndex={0} aria-label={u.name} onClick={() => onUpgradeClick(u)}>
            <span className="dopamine-upgrade-icon">{u.icon}</span>
            {hasUnseen[u.key] && (
              <span className="dopamine-upgrade-badge" title="New upgrade"></span>
            )}
          </div>
        ) : null
      )}
    </section>
  );
}

// PUBLIC_INTERFACE
function ModularUpgradesCardCol({ upgradesDef, unlockLevels, playerPoints, onBuy, buyErrors, newlyUnlocked }) {
  // Modular upgrades column list - for buying/upgrading, with animation if new
  return (
    <section className="dopamine-upgrades-cards-col" style={{ marginBottom: 22 }}>
      {upgradesDef.map((u, i) =>
        unlockLevels[u.key] > 0 ? (
          <div key={u.key}
            className={`dopamine-mod-upgrade-card${newlyUnlocked === u.key ? " dopamine-upgrade-card-shake" : ""}${(unlockLevels[u.key] && unlockLevels[u.key] >= 5) ? " dopamine-upgrade-card-maxed" : ""}`}>
            <div className="dopamine-mod-upgrade-header">
              <span className="dopamine-upgrade-icon">{u.icon}</span>
              <span className="dopamine-mod-upgrade-title">{u.name}</span>
            </div>
            <div className="dopamine-mod-upgrade-desc">{u.desc}</div>
            <div className="dopamine-mod-upgrade-details">
              <span className="dopamine-mod-upgrade-count">Level {unlockLevels[u.key] || 0}</span>
              <span className="dopamine-mod-upgrade-cost">Cost: {formatNum(u.baseCost * Math.pow(1.9, unlockLevels[u.key] || 0))}</span>
            </div>
            <button
              className="dopamine-mod-upgrade-buy-btn"
              onClick={() => onBuy(u.key)}
              disabled={playerPoints < (u.baseCost * Math.pow(1.9, unlockLevels[u.key] || 0)) || (unlockLevels[u.key] >= 5)}
            >
              {unlockLevels[u.key] >= 5 ? "Maxed" : "Buy"}
            </button>
            <div className="dopamine-buy-err">{buyErrors[u.key] || ""}</div>
          </div>
        ) : null)}
    </section>
  );
}

// PUBLIC_INTERFACE
function AchievementToasts({ achieved, achievementsDef, onClose }) {
  // Displays achievement unlocked notifications as toasts
  return (
    <div
      style={{
        top: 20,
        right: 0,
        position: "fixed",
        zIndex: 60,
        minWidth: 200,
        pointerEvents: "none"
      }}>
      {achieved.slice(-3).map(a => {
        const ach = achievementsDef.find(x => x.key === a.key);
        if (!ach) return null;
        return (
          <div key={a.key} className="dopamine-mod-upgrade-card dopamine-upgrade-card-succ" style={{
            background: "#fffde8",
            border: "2px solid #3beb68",
            marginBottom: 8,
            minHeight: 52,
            boxShadow: "0 2px 8px #b4ecd07d"
          }}>
            <b>🏆 {ach.name}</b>
            <div style={{ fontSize: 13.5, marginTop: 2 }}>{ach.desc}</div>
            <button style={{
              background: "#3beb68", color: "#fff", marginTop: 3,
              border: "none", borderRadius: 5, padding: "2px 10px", float: "right", fontSize: 13, cursor: "pointer"
            }} onClick={() => onClose(a.key)}>
              Close
            </button>
          </div>
        );
      })}
    </div>
  );
}

// PUBLIC_INTERFACE
function MemeInbox({ open, memes, onClose }) {
  // Inbox side panel with memes
  return (
    <aside style={{
      position: "fixed",
      right: open ? 0 : "-450px",
      top: 0,
      height: "100vh",
      width: 340,
      background: "#fff",
      boxShadow: "0 6px 42px #aaa9",
      transition: "right 0.49s cubic-bezier(0.17, 0.92, 0.4, 1.05)",
      zIndex: 90,
      padding: 22,
      overflowY: "auto"
    }}
      aria-hidden={!open}
      aria-label="Meme Inbox"
    >
      <button onClick={onClose} aria-label="Close meme inbox"
        style={{
          position: "absolute", right: 11, top: 9,
          zIndex: 12, background: "#fff", border: "1px solid #bbb",
          borderRadius: 8, padding: "2px 14px", cursor: "pointer"
        }}>Close</button>
      <h2 style={{ fontSize: 22, marginBottom: 14, color: "#6222a1" }}>Inbox & Memes</h2>
      {memes.length === 0 && <div style={{ color: "#888" }}>No memes yet...</div>}
      {memes.map(meme =>
        <div key={meme.id} style={{ marginBottom: 18 }}>
          <img src={meme.url} alt={meme.caption} style={{
            maxWidth: "98%", borderRadius: 9, boxShadow: "0 4px 14px #b8b8b899"
          }} />
          <div className="mononum" style={{
            fontSize: 13, marginTop: 5,
            color: "#18181c", fontWeight: 500
          }}>{meme.caption}</div>
        </div>
      )}
    </aside>
  );
}

// PUBLIC_INTERFACE
function LofiMusicBar({ unlocked, playing, onPlay, onPause, songMeta }) {
  // Music bar for lofi unlock
  if (!unlocked) return null;
  return (
    <footer style={{
      position: "fixed",
      bottom: 0,
      width: "100%",
      background: "#23203B",
      color: "#fff",
      padding: "7px 13px",
      display: "flex",
      alignItems: "center",
      fontSize: 17,
      opacity: 0.96,
      zIndex: 31
    }}>
      <span role="img" aria-label="Music" style={{ marginRight: 9 }}>🎵</span>
      {songMeta?.title || "Lofi Track"} — <span style={{ marginLeft: 6, fontSize: 14 }}>{songMeta?.artist}</span>
      <button onClick={playing ? onPause : onPlay}
        aria-label={playing ? "Pause music" : "Play music"}
        style={{
          marginLeft: 20,
          background: playing ? "#cf3e66" : "#93ede3",
          color: "#1e1744",
          border: "none",
          borderRadius: 6,
          padding: "1px 15px",
          fontSize: 16,
          cursor: "pointer"
        }}>
        {playing ? "Pause" : "Play"}
      </button>
    </footer>
  );
}

// PUBLIC_INTERFACE
function RainVisual() {
  // Dopamine rain animation when "rain mode" reaches level 1+
  // Simple: fire a bunch of animated colored dots falling with keyframes, random X.
  // For brevity, just render a set of falling cubes
  const [drops, setDrops] = useState([]);
  useEffect(() => {
    let running = true;
    function addDrop() {
      if (!running) return;
      setDrops(drops => drops.concat([{
        id: Math.random(),
        left: Math.random() * 90 + "%",
        duration: 1.1 + Math.random(),
        delay: Math.random() * 0.5
      }]));
      setTimeout(addDrop, 260 + Math.random() * 330);
    }
    addDrop();
    return () => { running = false; };
  }, []);
  return (
    <div style={{
      pointerEvents: "none", position: "absolute", left: 0, top: 0, width: "100%", height: "100%", zIndex: 2
    }}>
      {drops.slice(-14).map(d =>
        <span key={d.id}
          style={{
            position: "absolute",
            top: "-25px",
            left: d.left,
            fontSize: 21,
            color: "#a475d3",
            opacity: 0.82,
            animation: `rfcubedown ${d.duration}s linear ${d.delay}s 1 forwards`
          }}>
          🟪
        </span>
      )}
      <style>
        {`@keyframes rfcubedown {
          from { transform: translateY(0); opacity: 0.86; }
          90% { opacity: 1; }
          to { transform: translateY(240px); opacity: 0.01; }
        }`}
      </style>
    </div>
  );
}

// PUBLIC_INTERFACE
function DVDZone({ unlocked }) {
  // Bouncing DVD icon, unlocked after a certain upgrade
  const [pos, setPos] = useState({ x: 33, y: 22 });
  const [dx, setDx] = useState(2.3);
  const [dy, setDy] = useState(1.7);
  const ref = useRef();
  useEffect(() => {
    if (!unlocked) return;
    let box = ref.current;
    let width = box?.offsetWidth || 110, height = box?.offsetHeight || 110;
    let running = true;
    function animate() {
      if (!running) return;
      setPos(pos => {
        let { x, y } = pos;
        x += dx; y += dy;
        if (x <= 0 || x >= width - 43) setDx(dx => -dx);
        if (y <= 0 || y >= height - 43) setDy(dy => -dy);
        return { x: Math.max(0, Math.min(x, width - 43)), y: Math.max(0, Math.min(y, height - 43)) };
      });
      requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; };
    // eslint-disable-next-line
  }, [unlocked]);
  if (!unlocked) return null;
  return (
    <div className="dvd-bounce-area" ref={ref} aria-hidden={!unlocked}>
      <span className="bouncing-dvd" style={{
        left: pos.x, top: pos.y, animation: "spinBounce 2s linear infinite"
      }}>
        DVD
      </span>
    </div>
  );
}

// -- Fake stock simulator for fun (Zone)

function StockSimulator({ unlocked }) {
  const [price, setPrice] = useState(100);
  useEffect(() => {
    if (!unlocked) return;
    const id = setInterval(() => {
      setPrice(val => {
        let delta = Math.round((Math.random() - 0.47) * 5.7);
        return Math.max(1, val + delta);
      });
    }, 900);
    return () => clearInterval(id);
  }, [unlocked]);
  if (!unlocked) return null;
  return (
    <div style={{
      fontFamily: "monospace",
      margin: "6px 0 13px 0",
      padding: "7px 9px", borderRadius: 8, background: "#2a362e", color: "#b7ffcf"
    }}>
      $DOPA {price}
    </div>
  );
}

// -- App Main logic

// PUBLIC_INTERFACE
function App() {
  // Game state stuff
  const [stimulus, setStimulus] = useState(0);
  const [dps, setDps] = useState(0);
  const [upgrades, setUpgrades] = useState({
    auto_click: 0,
    visual_zone: 0,
    meme_inbox: 0,
    music_lofi: 0,
    rain_mode: 0
  });
  const [totalClicks, setTotalClicks] = useState(0);

  // unlock borders
  const [unseenUpgrades, setUnseenUpgrades] = useState({
    auto_click: true
  });

  // Modular upgrade purchasing
  const [buyErrors, setBuyErrors] = useState({});
  const [lastPurchased, setLastPurchased] = useState("");
  // Victory/achievement state
  const [achieved, setAchieved] = useState([]);
  // News/meme/music
  const [news, setNews] = useState([]);
  const [memes, setMemes] = useState([]);
  const [memePanelOpen, setMemePanelOpen] = useState(false);

  // Lofi Music
  const [musicPlaying, setMusicPlaying] = useState(false);

  // Act 1 minimalist fade state
  const [minimalist, setMinimalist] = useState(true);
  const [fadeBtn, setFadeBtn] = useState(true);
  const btnRef = useRef();

  // Visual overlays
  const [connStatus, setConnStatus] = useState("Idle mode");

  // --- Audio refs
  const audioClickRef = useRef(null);
  const audioMusicRef = useRef(null);

  // Sounds
  function playClickSound() {
    if (!audioClickRef.current) {
      audioClickRef.current = new Audio(clickSounds[Math.floor(Math.random() * clickSounds.length)]);
    }
    audioClickRef.current.currentTime = 0;
    audioClickRef.current.play();
  }
  function playMusic() {
    if (audioMusicRef.current) {
      audioMusicRef.current.play();
      setMusicPlaying(true);
    }
  }
  function pauseMusic() {
    if (audioMusicRef.current) {
      audioMusicRef.current.pause();
    }
    setMusicPlaying(false);
  }

  // First fade in button after mount then stats
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeBtn(true);
    }, 99);
    return () => clearTimeout(timer);
  }, []);

  // After first click, show rest of UI (remove minimalist mode after a short delay)
  useEffect(() => {
    if (minimalist && totalClicks >= 1) {
      setTimeout(() => {
        setMinimalist(false);
        setFadeBtn(false);
      }, 1100);
    }
    // eslint-disable-next-line
  }, [totalClicks, minimalist]);

  // DPS Automator: auto passive gain
  useEffect(() => {
    if (upgrades.auto_click >= 1) {
      setDps(upgrades.auto_click * 1);
    } else {
      setDps(0);
    }
  }, [upgrades.auto_click]);

  useEffect(() => {
    // Passive stim per second
    if (dps > 0) {
      const tick = setInterval(() => {
        setStimulus(sp => sp + dps);
      }, 999);
      return () => clearInterval(tick);
    }
  }, [dps]);

  // NEWS/MEMES fetch
  useEffect(() => {
    fetch(newsUrl)
      .then(r => r.json())
      .then(data => {
        setNews(data.news ? data.news.slice(0, 8) : []);
      }).catch(() => setNews([
        { title: "Welcome to Dopamine Clicker!" },
        { title: "News API not available, click harder for more fun!" }
      ]));
    // MEME fetch
    fetch(memeUrl)
      .then(r => r.json())
      .then(data => {
        const picks = [];
        if (data.success && data.data.memes) {
          for (let i = 0; i < 5; i++) {
            const m = data.data.memes[Math.floor(Math.random() * data.data.memes.length)];
            picks.push({ id: m.id, url: m.url, caption: m.name });
          }
        }
        setMemes(picks);
      }).catch(() => { });
  }, []);

  // ----- Main click handler
  // PUBLIC_INTERFACE
  function handleClick() {
    // On click: increment, play SFX, trigger first reveal
    setStimulus(sp => sp + 1);
    setTotalClicks(tc => tc + 1);
    if (!minimalist) {
      playClickSound();
    }
    checkAndUnlock();
  }

  // PUBLIC_INTERFACE
  function handleUpgradeBuy(upgKey) {
    // Try to buy the upgrade (increase level, subtract cost)
    setBuyErrors({});
    const curLvl = upgrades[upgKey] || 0;
    const udef = coreUpgrades.find(u => u.key === upgKey);
    const cost = Math.floor(udef.baseCost * Math.pow(1.9, curLvl));
    if (stimulus < cost) {
      setBuyErrors(e => ({ ...e, [upgKey]: "Not enough stimulation!" }));
      return;
    }
    if (curLvl >= 5) {
      setBuyErrors(e => ({ ...e, [upgKey]: "Maxed out!" }));
      return;
    }
    setStimulus(sp => sp - cost);
    setUpgrades(u => ({ ...u, [upgKey]: u[upgKey] + 1 }));
    setLastPurchased(upgKey);
    setTimeout(() => setLastPurchased(""), 900);
    setUnseenUpgrades(u => ({ ...u, [upgKey]: false }));
    // VFX/SFX
    new Audio(upgradeSound).play();
  }

  // Unseen for notification badge (new upgrade unlocked)
  function onUpgradeBoxClick(upg) {
    // If notification: remove
    setUnseenUpgrades(u => ({ ...u, [upg.key]: false }));
    // Panel open for meme inbox
    if (upg.key === "meme_inbox") setMemePanelOpen(true);
  }

  // PUBLIC_INTERFACE
  function handleToastClose(key) {
    // Remove achievement toast
    setAchieved(list => list.filter(a => a.key !== key));
  }

  // ----- Achievement & unlock system
  function checkAndUnlock() {
    // Run through achievements and unlocks
    const stats = {
      totalClicks,
      upgrades
    };
    allAchievements.forEach(a => {
      if (
        !achieved.map(x => x.key).includes(a.key) &&
        a.condition({ totalClicks: totalClicks + 1, upgrades }) // check after current click!
      ) {
        setAchieved(ach => [...ach, { key: a.key }]);
        setTimeout(() => {
          new Audio(achievementSound).play();
        }, 50);
      }
    });
    // Unlock notification: show badge on upgrade
    coreUpgrades.forEach((upg, idx) => {
      // unlock logic: simple per hardcoded milestones
      if (
        totalClicks + 1 >= upg.baseCost &&
        !upgrades[upg.key] &&
        !unseenUpgrades[upg.key]
      ) {
        setUnseenUpgrades(u => ({ ...u, [upg.key]: true }));
        setConnStatus(`🏅 New upgrade: ${upg.name}`);
        setTimeout(() => setConnStatus("Idle mode"), 2400);
      }
    });
  }

  // Music control refs
  useEffect(() => {
    if (!audioMusicRef.current && upgrades.music_lofi) {
      audioMusicRef.current = new window.Audio(lofiMusicUrl);
      audioMusicRef.current.loop = true;
      audioMusicRef.current.volume = 0.46;
    }
  }, [upgrades.music_lofi]);

  useEffect(() => {
    if (audioMusicRef.current) {
      if (musicPlaying) {
        audioMusicRef.current.play();
      } else {
        audioMusicRef.current.pause();
      }
    }
  }, [musicPlaying]);

  // Handle focus accessibility for first launch
  useEffect(() => {
    if (btnRef.current && fadeBtn) {
      btnRef.current.focus();
    }
  }, [fadeBtn]);

  // Core render
  return (
    <div className={"dopamine-simple-root" + (minimalist ? " minimalist-mode" : "")}>
      {/* Top bar, only after minimalism phase */}
      {!minimalist && <StatusBar news={news} connStatus={connStatus} />}
      {/* Main layout */}
      <div className="dopamine-content-wrapper" style={{ flexDirection: "row" }}>
        {/* Left "logo" col */}
        <div className="dopamine-logo-col" style={{
          display: minimalist ? "none" : "flex",
          flexDirection: "column", justifyContent: "flex-start",
          alignItems: "center", marginRight: 18, minWidth: 120
        }}>
          <div className="dopamine-dvd-logo" style={{
            width: 100, height: 100, fontSize: 85, marginBottom: 16,
            fontWeight: 900, color: "#111", borderRadius: 13,
            background: "radial-gradient(#fff,#f5f5f5 80%)", boxShadow: "0 1px 8px #ddd8"
          }}>DVD</div>
          <div className="dopamine-dvd-logo" style={{
            width: 100, height: 100, fontSize: 78,
            marginBottom: 18, fontWeight: 700,
            color: "#18181c", borderRadius: 13, background: "radial-gradient(#fff,#f5f5f5 80%)", boxShadow: "0 1px 8px #efe0"
          }}>DVD</div>
        </div>
        {/* Main clicker & overlays */}
        <div style={{
          display: "flex", flex: 1, flexDirection: "column",
          alignItems: "center", justifyContent: "center"
        }}>
          {minimalist ? (
            // Act 1: just the main button, fade in
            <main className="dopamine-center-main only-button-main">
              <button
                ref={btnRef}
                className={`dopamine-cta-btn fade-in-btn${fadeBtn ? " visible" : ""}`}
                style={{
                  transition: "opacity 2s cubic-bezier(0.23, 1, 0.32, 1)",
                  opacity: fadeBtn ? 1 : 0,
                }}
                onClick={handleClick}
                aria-label="click me"
                tabIndex={0}
                autoFocus
                aria-disabled={false}
              >
                click me
              </button>
              <div
                className={`dopamine-stats-stack${stimulus >= 1 ? " stats-visible" : ""}`}
                style={{
                  opacity: stimulus >= 1 ? 1 : 0,
                  transition: "opacity 0.56s cubic-bezier(.27,.97,.45,1.01)",
                  pointerEvents: stimulus >= 1 ? "auto" : "none",
                  height: stimulus >= 1 ? undefined : 0,
                  marginTop: stimulus >= 1 ? 0 : "-6px"
                }}
                aria-hidden={stimulus < 1}
              >
                <div className="dopamine-mainstat">{formatNum(stimulus)} stimulation</div>
                <div className="dopamine-substat">{formatNum(dps)} stimulation per second</div>
              </div>
            </main>
          ) : (
            <>
              <DVDZone unlocked={upgrades.visual_zone >= 1} />
              <CenterClicker
                stimulus={stimulus}
                dps={dps}
                click={handleClick}
                upgrades={upgrades}
                buttonClassName={lastPurchased && "dopamine-cta-btn-fancy"}
              />
              <StockSimulator unlocked={upgrades.visual_zone >= 1} />
              <UpgradesRow
                upgradesDef={coreUpgrades}
                unlockLevels={upgrades}
                hasUnseen={unseenUpgrades}
                onUpgradeClick={onUpgradeBoxClick}
              />
              <ModularUpgradesCardCol
                upgradesDef={coreUpgrades}
                unlockLevels={upgrades}
                playerPoints={stimulus}
                onBuy={handleUpgradeBuy}
                buyErrors={buyErrors}
                newlyUnlocked={lastPurchased}
              />
            </>
          )}
        </div>
      </div>
      {/* Meme/inbox panel */}
      <MemeInbox open={memePanelOpen && upgrades.meme_inbox >= 1} memes={memes} onClose={() => setMemePanelOpen(false)} />
      {/* Music bar */}
      <LofiMusicBar
        unlocked={upgrades.music_lofi >= 1}
        playing={musicPlaying}
        onPlay={playMusic}
        onPause={pauseMusic}
        songMeta={audiusPlaylist[0]}
      />
      {/* Achievement toasts */}
      <AchievementToasts
        achieved={achieved}
        achievementsDef={allAchievements}
        onClose={handleToastClose}
      />
      {/* Hidden audio for SFX */}
      <audio ref={audioClickRef} style={{ display: "none" }} preload="auto" />
      <audio ref={audioMusicRef} style={{ display: "none" }} preload="auto" />
    </div>
  );
}

export default App;
