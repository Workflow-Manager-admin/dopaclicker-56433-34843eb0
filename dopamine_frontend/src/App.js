import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// PUBLIC_INTERFACE
function App() {
  /** Game UI/State for Dopamine Clicker
   * Stateless: session resets on reload
   * Visual/audio unlocks, upgrades, modular zones, achievements, inbox, API integrations
   * Modern, playful design — color/theme/zone layout per project spec
   */

  // Main STATE
  const [activated, setActivated] = useState(false); // For initial delay
  const [clicks, setClicks] = useState(0);
  const [dps, setDps] = useState(0);
  const [lastTick, setLastTick] = useState(Date.now());
  const [upgrades, setUpgrades] = useState({ auto: 0, visual: 0, audio: 0, lofi: 0, meme: 0, news: 0, rain: 0, subwaysurf: 0, dvd: 0, overload: 0, stock: 0 });
  const [achievementNotifs, setAchievementNotifs] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [musicPlaying, setMusicPlaying] = useState(false);

  // "Unlocks" are flags for features/effects that are sessionally unlocked by click count, purchases, events etc.
  const [unlocks, setUnlocks] = useState({
    basicClicker: true,
    vibration: false,
    rainbow: false,
    confetti: false,
    visualFx: false,
    audioFx: false,
    automation: false,
    achievements: false,
    meme: false,
    news: false,
    lofi: false,
    inbox: false,
    rain: false,
    subwaysurf: false,
    dvd: false,
    overload: false,
    stock: false,
    cheat: false,
  });

  // For text/easter egg input
  const [cheatInput, setCheatInput] = useState("");

  // API data states
  const [memes, setMemes] = useState([]);
  const [news, setNews] = useState([]);
  const [musicList, setMusicList] = useState([]);
  const musicAudio = useRef(null);

  // Modular UI "zones" configuration
  // Top and bottom bars (6 zones each), left/right panels (4 zones each)
  // We'll provide some with content, some can be visual filler/empty as per playful design
  // Each zone may show/hide based on unlocks/clicks/etc

  /** -- VISUAL/AUDIO/INTERACTIVE LOGIC -- */
  // Unlock logic (triggered by click thresholds and purchases)
  useEffect(() => {
    const u = { ...unlocks };
    let unlockNotif = null;

    // Visual unlocks
    if (!u.vibration && clicks >= 20) {
      u.vibration = true;
      unlockNotif = "Unlocked: Button Vibration!";
    }
    if (!u.visualFx && clicks >= 45) {
      u.visualFx = true;
      unlockNotif = "Unlocked: Visual Effects!";
    }
    if (!u.automation && clicks >= 80) {
      u.automation = true;
      unlockNotif = "Unlocked: Automation!";
    }
    if (!u.rainbow && clicks >= 150) {
      u.rainbow = true;
      unlockNotif = "Unlocked: Rainbow Mode!";
    }
    if (!u.audioFx && clicks >= 200) {
      u.audioFx = true;
      unlockNotif = "Unlocked: Sound Effects!";
    }
    if (!u.confetti && clicks >= 350) {
      u.confetti = true;
      unlockNotif = "Unlocked: Confetti!";
    }
    if (!u.lofi && clicks >= 500) {
      u.lofi = true;
      unlockNotif = "Unlocked: Lofi Music Box!";
    }
    if (!u.meme && clicks >= 600) {
      u.meme = true;
      unlockNotif = "Unlocked: Meme Generator!";
    }
    if (!u.news && clicks >= 700) {
      u.news = true;
      unlockNotif = "Unlocked: News Ticker!";
    }
    if (!u.inbox && clicks >= 900) {
      u.inbox = true;
      unlockNotif = "Unlocked: Inbox!";
    }
    if (!u.rain && clicks >= 1200) {
      u.rain = true;
      unlockNotif = "Unlocked: Rain Visualizer!";
    }
    if (!u.subwaysurf && clicks >= 1800) {
      u.subwaysurf = true;
      unlockNotif = "Unlocked: Subway Surfer Loop!";
    }
    if (!u.dvd && clicks >= 2200) {
      u.dvd = true;
      unlockNotif = "Unlocked: DVD Bouncer!";
    }
    if (!u.stock && clicks >= 2700) {
      u.stock = true;
      unlockNotif = "Unlocked: Fake Stock Market!";
    }
    if (!u.overload && clicks >= 3000000) {
      u.overload = true;
      unlockNotif = "Unlocked: 3M Clicks Overload!";
    }
    // Achievements always on after 60 clicks
    if (!u.achievements && clicks >= 60) {
      u.achievements = true;
      unlockNotif = "Unlocked: Achievements!";
    }

    setUnlocks(u);
    if (unlockNotif) {
      raiseAchievement(unlockNotif);
    }
    // eslint-disable-next-line
  }, [clicks]);

  // Automation/auto-click logic
  useEffect(() => {
    if (!activated) return;
    if (dps > 0) {
      const interval = setInterval(() => setClicks((c) => c + dps), 1000);
      return () => clearInterval(interval);
    }
  }, [dps, activated]);

  // Lofi music fetch and player
  useEffect(() => {
    if (!unlocks.lofi) return;
    // Example API: https://audius-discovery-3.audius.co/v1/tracks/trending?app_name=EXAMPLEAPP
    fetch("https://audius-discovery-3.audius.co/v1/tracks/trending?app_name=DopeClickerApp")
      .then((resp) => resp.json())
      .then((data) => {
        setMusicList(
          (data.data || []).map((track) => ({
            url: track.preview_url,
            title: track.title,
          }))
        );
      })
      .catch(() => {});
  }, [unlocks.lofi]);

  // Memes
  useEffect(() => {
    if (!unlocks.meme) return;
    fetch(
      "https://api.imgflip.com/get_memes"
    )
      .then((r) => r.json())
      .then((data) => setMemes((data.data && data.data.memes) || []))
      .catch(() => {});
  }, [unlocks.meme]);

  // News API (Public, demo endpoint)
  useEffect(() => {
    if (!unlocks.news) return;
    fetch("https://newsapi.org/v2/top-headlines?country=us&apiKey=6fe763b0b13e42b08f7d3f4587aeccc8")
      .then((resp) => resp.json())
      .then((data) => setNews((data.articles && data.articles.slice(0, 6)) || []))
      .catch(() => {});
  }, [unlocks.news]);


  /** --- AUDIO FX --- */
  function playClickSound() {
    if (!unlocks.audioFx) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = 300 + Math.random() * 80;
    g.gain.value = 0.07;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.1);
    setTimeout(() => ctx.close(), 220);
  }
  function playAchievementSound() {
    if (!unlocks.audioFx) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sawtooth";
    o.frequency.value = 700 + Math.random() * 100;
    g.gain.value = 0.16;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.25);
    o.stop(ctx.currentTime + 0.3);
    setTimeout(() => ctx.close(), 400);
  }

  /** --- CLICK --- */
  function handleClick() {
    if (!activated) return;
    setClicks((c) => c + 1);
    playClickSound();
    if (unlocks.vibration && window.navigator.vibrate) window.navigator.vibrate(16);
    // Rainbow/confetti/overload handled in effects
  }

  /** --- UPGRADES --- */
  // Cost scales per upgrade level
  function getUpgradeCost(type) {
    const base = {
      auto: 25,
      visual: 40,
      audio: 50,
      lofi: 300,
      meme: 350,
      news: 370,
      rain: 440,
      subwaysurf: 500,
      dvd: 900,
      stock: 1000,
      overload: 1000000,
    }[type];
    return base
      ? Math.round(base * Math.pow(1.35, upgrades[type] || 0))
      : 9999999;
  }
  function purchaseUpgrade(type) {
    const cost = getUpgradeCost(type);
    if (clicks < cost) return;
    setClicks((c) => c - cost);
    switch (type) {
      case "auto":
        setDps((d) => d + 1);
        break;
      default:
        break;
    }
    setUpgrades((up) => ({ ...up, [type]: (up[type] || 0) + 1 }));
    // Unlock boosts by "buying" them
    setUnlocks((u) => ({ ...u, [type]: true }));
    switch (type) {
      case "auto":
        raiseAchievement("Upgrade: Autoclicker purchased!");
        break;
      case "visual":
        raiseAchievement("Upgrade: Visual Flicker FX!");
        break;
      case "audio":
        raiseAchievement("Upgrade: New Sound Vibes!");
        break;
      default:
        break;
    }
  }

  /** --- ACHIEVEMENT / INBOX --- */
  function raiseAchievement(text) {
    playAchievementSound();
    setAchievementNotifs((notifs) => [
      ...notifs,
      { text, time: Date.now() },
    ]);
    // Add message to inbox if unlocked
    if (unlocks.inbox)
      setInbox((inbox) => [
        ...inbox,
        {
          text,
          date: new Date().toLocaleTimeString(),
        },
      ]);
  }
  function removeNotif(idx) {
    setAchievementNotifs((notifs) => notifs.filter((_, i) => i !== idx));
  }

  /** --- SESSION DELAYED ACTIVATION --- */
  useEffect(() => {
    // 1 second fake boot for dopamine anticipation!
    const timer = setTimeout(() => setActivated(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  /** --- RAIN FX --- */
  useEffect(() => {
    if (!unlocks.rain) return;
    // No-op skeleton; could trigger once as an easter egg.
  }, [unlocks.rain]);

  /** --- EASTER EGG CHEAT CODE --- */
  useEffect(() => {
    // If someone enters a cheat code
    if (/dopamine_is_love/i.test(cheatInput)) {
      setUnlocks((u) => ({
        ...u,
        cheat: true,
        overload: true,
        subwaysurf: true,
        dvd: true,
        news: true,
        meme: true,
        audioFx: true,
        visualFx: true,
        lofi: true,
        achievements: true,
        automation: true,
        inbox: true,
        stock: true,
        rainbow: true,
        confetti: true,
      }));
      raiseAchievement("Cheat code: Everything unlocked!");
      setCheatInput("");
    }
    // eslint-disable-next-line
  }, [cheatInput]);

  /********* ZONE LAYOUTS **********/
  // Each zone can render conditionally by unlock/click/upgrade
  function renderTopBar() {
    return (
      <div className="zone top-bar">
        <Zone label="Rain" unlocked={unlocks.rain}>
          <RainVisualizer active={unlocks.rain} />
        </Zone>
        <Zone label="Subway" unlocked={unlocks.subwaysurf}>
          <SubwaySurfer active={unlocks.subwaysurf} />
        </Zone>
        <Zone label="Fake Stock" unlocked={unlocks.stock}>
          <StockSim active={unlocks.stock} />
        </Zone>
        <Zone label="News Ticker" unlocked={unlocks.news}>
          <NewsTicker articles={news} />
        </Zone>
        <Zone label="Welcome">
          <p className="game-title">Dopamine Clicker Game</p>
        </Zone>
        <Zone label="Achievements" unlocked={unlocks.achievements}>
          <Achievements achievements={achievementNotifs} removeNotif={removeNotif} />
        </Zone>
      </div>
    );
  }
  function renderBottomBar() {
    return (
      <div className="zone bottom-bar">
        <Zone label="Confetti" unlocked={unlocks.confetti}>
          <Confetti active={unlocks.confetti} />
        </Zone>
        <Zone label="Rainbow" unlocked={unlocks.rainbow}>
          <RainbowBar active={unlocks.rainbow} />
        </Zone>
        <Zone label="Automation" unlocked={unlocks.automation}>
          <p style={{ fontWeight: "bold" }}>
            +{dps} auto / sec
            <br />
            <button className="small-btn" onClick={() => purchaseUpgrade("auto")}>
              Upgrade Autoclick ({getUpgradeCost("auto")} clicks)
            </button>
          </p>
        </Zone>
        <Zone label="Lofi" unlocked={unlocks.lofi}>
          <LofiBox
            musicList={musicList}
            musicPlaying={musicPlaying}
            setMusicPlaying={setMusicPlaying}
            musicAudio={musicAudio}
          />
        </Zone>
        <Zone label="Inbox" unlocked={unlocks.inbox}>
          <InboxPane inbox={inbox} />
        </Zone>
        <Zone label="Cheat">
          <input
            style={{
              width: 50,
              background: "#eee",
              border: "none",
              borderRadius: 6,
              fontSize: "12px",
              padding: 3,
            }}
            placeholder="cheat?"
            value={cheatInput}
            onChange={(e) => setCheatInput(e.target.value)}
          />
        </Zone>
      </div>
    );
  }
  function renderLeftBar() {
    return (
      <div className="zone left-bar">
        <Zone label="Upgrades">
          <UpgradesMenu upgrades={upgrades} clicks={clicks} unlocks={unlocks} purchaseUpgrade={purchaseUpgrade} getUpgradeCost={getUpgradeCost} />
        </Zone>
        <Zone label="Visual" unlocked={unlocks.visualFx}>
          <p>Visual FX</p>
        </Zone>
        <Zone label="Audio" unlocked={unlocks.audioFx}>
          <p>Audio FX</p>
        </Zone>
        <Zone label="DVD" unlocked={unlocks.dvd}>
          <DVDPanel />
        </Zone>
      </div>
    );
  }
  function renderRightBar() {
    return (
      <div className="zone right-bar">
        <Zone label="Memes" unlocked={unlocks.meme}>
          <MemeGallery memes={memes} />
        </Zone>
        <Zone label="Overload" unlocked={unlocks.overload}>
          <OverloadDisplay clicks={clicks} />
        </Zone>
        <Zone label="---" />
        <Zone label="---" />
      </div>
    );
  }

  /********* MAIN RENDER **********/
  return (
    <div className={`App ${unlocks.rainbow ? "rainbow-bg" : ""} ${unlocks.confetti ? "confetti-bg" : ""}`}>
      {renderTopBar()}
      <div className="core">
        {renderLeftBar()}
        <div className={`core-center ${unlocks.visualFx ? "visualfx" : ""}`}>
          {/* Click Button & Stim System */}
          {!activated ? (
            <div className="preloader">
              <h2>Booting Dopamine Engine...</h2>
              <ProgressBar />
            </div>
          ) : (
            <div>
              <DopamineButton
                onClick={handleClick}
                clicks={clicks}
                unlocks={unlocks}
              />
              <div className="click-counter">
                <b>{Math.floor(clicks)}</b> clicks
              </div>
              {unlocks.basicClicker && (
                <StimulationMeter clicks={clicks} />
              )}
            </div>
          )}
        </div>
        {renderRightBar()}
      </div>
      {renderBottomBar()}
    </div>
  );
}

/** --- MODULAR COMPONENTS --- */

// PUBLIC_INTERFACE
function DopamineButton({ onClick, clicks, unlocks }) {
  // Animated button based on unlocks
  const style = {
    background:
      unlocks.rainbow
        ? `linear-gradient(90deg,#ff5252,#b9ff49,#5bdcff,#f1db4b,#ff5252)`
        : unlocks.visualFx
        ? "radial-gradient(circle,#ffbeb3,#ff81eb 60%,#fff 100%)"
        : "#fff",
    color: unlocks.visualFx ? "#222" : "#1a1a1a",
    border: unlocks.visualFx ? "3px solid #50c3ec" : "2px solid #23a6d5",
    boxShadow: unlocks.confetti
      ? "0 0 30px 6px #f8c419, 0 2px 16px #ff52ae"
      : "0 2px 10px #aaa",
    margin: "18px auto",
    minWidth: "140px",
    minHeight: "140px",
    borderRadius: 777,
    fontWeight: 900,
    fontSize: 32 + Math.min(8, Math.floor(clicks/37)),
    transition: "all .22s cubic-bezier(.77,.01,.08,.98)",
    position: "relative",
    overflow: "hidden",
    padding: "26px 38px",
    cursor: "pointer",
    animation: unlocks.rainbow ? "colorCycle 1.7s linear infinite" : "",
    filter: unlocks.confetti ? "hue-rotate(90deg)" : ""
  };
  return (
    <button className="dopamine-btn" style={style} onClick={onClick}>
      {unlocks.overload && clicks > 3000000 ? (
        <span>🤡 Nerd 🌪 Overload!</span>
      ) : (
        <span>
          {clicks > 2100 && unlocks.visualFx ? "Super Stimulate!" : clicks > 80 ? "Keep clicking!" : "Stimulate!"}
        </span>
      )}
    </button>
  );
}

// PUBLIC_INTERFACE
function StimulationMeter({ clicks }) {
  // Shows stimulation progression as satisfaction bar
  const stim = Math.tanh(clicks / 400) * 100;
  return (
    <div className="stim-meter">
      <div className="stim-fill" style={{ width: `${stim}%` }} />
      <span className="stim-label">{stim >= 90 ? "MAX DOPAMINE!" : "Stimulation: " + Math.floor(stim) + "%"}</span>
    </div>
  );
}

// PUBLIC_INTERFACE
function Zone({ label, unlocked = true, children }) {
  // 1 modular zone, shows label in hover/faint
  return (
    <div className={`zone-unit ${unlocked ? "unlocked" : "locked"}`}>
      {unlocked ? children : <span className="zone-label">{label}</span>}
    </div>
  );
}

// PUBLIC_INTERFACE
function Achievements({ achievements, removeNotif }) {
  return (
    <div className="achievements-panel">
      {achievements.map((a, i) => (
        <div className="achievement-toaster" key={i} onClick={() => removeNotif(i)}>
          <span role="img" aria-label="trophy">
            🏆
          </span>
          &nbsp;{a.text}
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function UpgradesMenu({ upgrades, clicks, unlocks, purchaseUpgrade, getUpgradeCost }) {
  const upgradeList = [
    { key: "auto", label: "Autoclicker", requires: "automation" },
    { key: "visual", label: "Visual Flicker", requires: "visualFx" },
    { key: "audio", label: "Audio FX", requires: "audioFx" },
    { key: "lofi", label: "Lofi Box", requires: "lofi" },
    { key: "meme", label: "Memes", requires: "meme" },
    { key: "news", label: "Newsfeed", requires: "news" },
    { key: "rain", label: "Rain Mode", requires: "rain" },
    { key: "subwaysurf", label: "Subway Surfer", requires: "subwaysurf" },
    { key: "dvd", label: "DVD Bounce", requires: "dvd" },
    { key: "stock", label: "Fake Stocks", requires: "stock" },
    { key: "overload", label: "3M Overload", requires: "overload" },
  ];
  return (
    <div className="upgrades-menu">
      <strong>Upgrades:</strong>
      <ul>
        {upgradeList.map((upg) => (
          <li key={upg.key} className={unlocks[upg.requires] ? "" : "locked"}>
            <span>
              {upg.label} ({upgrades[upg.key] || 0})
            </span>
            <button
              className="small-btn"
              disabled={!unlocks[upg.requires] || clicks < getUpgradeCost(upg.key)}
              onClick={() => purchaseUpgrade(upg.key)}
              title={unlocks[upg.requires] ? "Buy/Upgrade" : `Unlocks at milestone!`}
            >
              {getUpgradeCost(upg.key)} clicks
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// PUBLIC_INTERFACE
function MemeGallery({ memes }) {
  // Show random memes, up to 3 at a time
  if (!memes || !memes.length) return <p>Loading memes...</p>;
  const picks = [];
  for (let i = 0; i < 3; ++i) {
    picks.push(memes[Math.floor(Math.random() * memes.length)]);
  }
  return (
    <div className="meme-gallery">
      <strong>😆 Memes</strong>
      <div style={{ display: "flex", gap: 4 }}>
        {picks.map((mem, j) => (
          <img key={j} src={mem.url} alt={mem.name} style={{ width: 70, height: 70, borderRadius: 8 }} />
        ))}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function NewsTicker({ articles }) {
  if (!articles || articles.length === 0) return <div className="news-ticker" />;
  return (
    <div className="news-ticker">
      <marquee>
        {articles.map((a, i) =>
          <span key={i} style={{ marginRight: 36 }}>
            <strong>{a.title}</strong>
          </span>
        )}
      </marquee>
    </div>
  );
}

// PUBLIC_INTERFACE
function ProgressBar() {
  // Simulated boot/progress
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let t = setInterval(() => setProgress((p) => Math.min(100, p + 9)), 120);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="progress-bar-wrap">
      <div
        className="progress-bar"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg,#81f4f4,#ab7fff,#ffd760,#ffb782)",
          height: 9,
          borderRadius: 12,
          transition: "width .35s",
        }}
      />
    </div>
  );
}

// PUBLIC_INTERFACE
function InboxPane({ inbox }) {
  // Simple list of notifications/messages
  if (!inbox || inbox.length === 0) return <div><i>Inbox empty.</i></div>;
  return (
    <div className="inbox-pane">
      <strong>📥 Inbox</strong>
      <ul>
        {inbox.slice(-8).reverse().map((msg, idx) => (
          <li key={idx}>
            <span className="inbox-msg">{msg.text}</span>
            <span className="inbox-date">{msg.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// PUBLIC_INTERFACE
function LofiBox({ musicList, musicPlaying, setMusicPlaying, musicAudio }) {
  // Play/stop random lofi music (Audius)
  const [current, setCurrent] = useState(musicList?.[0] || null);
  useEffect(() => {
    if (musicList?.length) setCurrent(musicList[0]);
  }, [musicList]);
  function play() {
    if (current && musicAudio.current) {
      musicAudio.current.src = current.url;
      musicAudio.current.loop = true;
      musicAudio.current.play();
      setMusicPlaying(true);
    }
  }
  function stop() {
    if (musicAudio.current) {
      musicAudio.current.pause();
      setMusicPlaying(false);
    }
  }
  function next() {
    if (!musicList?.length) return;
    const idx = Math.floor(Math.random() * musicList.length);
    setCurrent(musicList[idx]);
    setTimeout(play, 250);
  }
  return (
    <div className="lofi-box">
      <strong>Lofi Box</strong>
      <div>
        {current ? <>{current.title}</> : "No audio"}
        <audio ref={musicAudio} />
      </div>
      {!musicPlaying ? (
        <button className="small-btn" onClick={play}>
          ▶️ Play
        </button>
      ) : (
        <button className="small-btn" onClick={stop}>
          ⏹️ Stop
        </button>
      )}
      <button className="small-btn" onClick={next}>
        Next
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
function RainVisualizer({ active }) {
  // Animated ascii/emoji rain overlay
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    let drops = [];
    let rain = setInterval(() => {
      if (!ref.current) return;
      drops.push({ left: Math.random() * 92 + "%", t: Date.now() });
      drops = drops.slice(-12);
      ref.current.innerHTML = drops
        .map(
          (d) =>
            `<span style="position:absolute;left:${d.left};top:${((Date.now() - d.t) / 7) % 80 + 1
            }vh;">💧</span>`
        )
        .join("");
    }, 110);
    return () => clearInterval(rain);
  }, [active]);
  return <div ref={ref} className="rain-viz" style={{ position: "relative", height: "24px" }} />;
}

// PUBLIC_INTERFACE
function SubwaySurfer({ active }) {
  // Anim loop: simple subway surfer (text/emoji)
  const [pos, setPos] = useState(0);
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => setPos((p) => (p + 1) % 25), 70);
    return () => clearInterval(interval);
  }, [active]);
  return (
    <div className="subwaysurf-loop">
      <span style={{ marginLeft: pos * 8 }}>{active ? "🚅💨" : ""}</span>
    </div>
  );
}

// PUBLIC_INTERFACE
function StockSim({ active }) {
  // Simple fake stock ticker
  const [stocks, setStocks] = useState([{ sym: "DOPA", val: 420 }]);
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setStocks((stockList) =>
        stockList.map((s) => ({
          ...s,
          val: Math.max(100, s.val + Math.round((Math.random() - 0.48) * 33)),
        }))
      );
    }, 1200);
    return () => clearInterval(interval);
  }, [active]);
  return (
    <div className="stock-ticker">
      <strong>{stocks.map((s) => s.sym).join(", ")}</strong>{" "}
      <span>
        {stocks.map((s) => (
          <b key={s.sym} style={{ color: s.val > 420 ? "#1ce537" : "#e62e00" }}>
            {s.val}
          </b>
        ))}
      </span>
    </div>
  );
}

// PUBLIC_INTERFACE
function Confetti({ active }) {
  // Render floating confetti
  if (!active) return null;
  return (
    <div className="confetti-box">
      {Array.from({ length: 13 }).map((_, i) => (
        <span key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 92}%`,
            animationDelay: `${Math.random()}s`,
            background: `hsl(${Math.floor(Math.random() * 360)},100%,70%)`,
          }}
        />
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function RainbowBar({ active }) {
  return <div className="rainbow-bar" style={{
    background: active ?
      "linear-gradient(90deg,#ff5252,#b9ff49,#5bdcff,#f1db4b,#ff5252)" : "#aaa",
    height: 6,
    borderRadius: 12,
    width: "100%",
    marginTop: 2
  }} />;
}

// PUBLIC_INTERFACE
function DVDPanel() {
  // DVD logo bouncing effect (fake)
  const [pos, setPos] = useState({ x: 7, y: 7, dx: 1.4, dy: 1.1 });
  const [color, setColor] = useState("#ff81eb");
  useEffect(() => {
    let boxW = 116, boxH = 40, maxX = 120, maxY = 80;
    const interval = setInterval(() => {
      setPos((p) => {
        let { x, y, dx, dy } = p;
        if (x + boxW > maxX || x < 0) {
          dx = -dx;
          setColor(getRndColor());
        }
        if (y + boxH > maxY || y < 0) {
          dy = -dy;
          setColor(getRndColor());
        }
        return { x: x + dx, y: y + dy, dx, dy };
      });
    }, 35);
    return () => clearInterval(interval);
  }, []);
  function getRndColor() {
    return `hsl(${Math.random() * 360}, 70%, 64%)`;
  }
  return (
    <div className="dvd-panel" style={{ position: "relative", width: 140, height: 97, overflow: "hidden" }}>
      <span
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          fontWeight: 900,
          fontSize: 32,
          color,
          background: "#fff7",
          borderRadius: 26,
          padding: "2px 15px",
          boxShadow: "0 0 10px #0004",
        }}
      >
        DVD
      </span>
    </div>
  );
}

// PUBLIC_INTERFACE
function OverloadDisplay({ clicks }) {
  // If player reached crazy high clicks, show animation…
  if (clicks < 3000000) return null;
  return (
    <div className="overload-display">
      <span style={{ fontSize: 22 }}>
        🤯🤯🤯 3 Million Clicks UNLOCKED! 🎉🎉🎉
      </span>
    </div>
  );
}

export default App;
