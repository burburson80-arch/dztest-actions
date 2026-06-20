(function () {
  "use strict";

  const stations = window.STATIONS || [];
  let currentIndex = -1;
  let started = false;
  let switchTimer = null;

  let audioCtx = null;
  let noiseNode = null;
  let gainNode = null;

  const radioAudio = new Audio();
  radioAudio.preload = "none";

  const els = {
    name: document.getElementById("station-name"),
    bitrate: document.getElementById("station-bitrate"),
    country: document.getElementById("station-country"),
    genre: document.getElementById("station-genre"),
    source: document.getElementById("station-source"),
    status: document.getElementById("status-text"),
    indicator: document.getElementById("signal-indicator"),
    staticBar: document.getElementById("static-bar"),
    staticOverlay: document.getElementById("static-overlay"),
    scene: document.querySelector(".scene"),
  };

  function initStaticAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 800;
    filter.Q.value = 0.5;

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noiseNode.start();
  }

  function resumeAudioContext() {
    initStaticAudio();
    if (audioCtx.state === "suspended") {
      return audioCtx.resume();
    }
    return Promise.resolve();
  }

  function playStatic(durationMs) {
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(0.35, now);

    for (let i = 0; i < 6; i++) {
      const t = now + (i * durationMs) / 6000;
      gainNode.gain.setValueAtTime(0.1 + Math.random() * 0.4, t);
    }

    gainNode.gain.linearRampToValueAtTime(0, now + durationMs / 1000);
    playCrackle(durationMs);
  }

  function playCrackle(durationMs) {
    const crackleCount = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < crackleCount; i++) {
      setTimeout(() => {
        if (!audioCtx) return;
        const crack = audioCtx.createOscillator();
        const crackGain = audioCtx.createGain();
        crack.type = "square";
        crack.frequency.value = 200 + Math.random() * 2000;
        crackGain.gain.value = 0.08 + Math.random() * 0.12;
        crack.connect(crackGain);
        crackGain.connect(audioCtx.destination);
        crack.start();
        crack.stop(audioCtx.currentTime + 0.02 + Math.random() * 0.04);
      }, Math.random() * durationMs);
    }
  }

  function stopStream() {
    radioAudio.pause();
    radioAudio.removeAttribute("src");
    radioAudio.load();
  }

  function playStream(station) {
    if (!station) return Promise.resolve();

    stopStream();

    function tryPlay(url, allowFallback) {
      radioAudio.src = url;
      return radioAudio.play().catch(() => {
        if (allowFallback && station.fallback && station.fallback !== url) {
          return tryPlay(station.fallback, false);
        }
        els.status.textContent = "Плохой приём — «" + station.name + "»";
        els.indicator.className = "indicator tuning";
        return Promise.reject();
      });
    }

    return tryPlay(station.stream, true);
  }

  function setUIState(state, station) {
    els.indicator.className = "indicator " + state;
    els.staticBar.classList.toggle("active", state === "tuning");
    els.staticOverlay.classList.toggle("active", state === "tuning");
    els.scene.classList.toggle("static-shake", state === "tuning");

    if (state === "tuning") {
      els.status.textContent = "Шипение… настройка частоты…";
      els.name.classList.add("fading");
      return;
    }

    if (!station) return;

    els.status.textContent = "Принимаем «" + station.name + "»";
    els.name.classList.remove("fading");
    els.name.textContent = station.name;
    els.bitrate.textContent = station.bitrate || "—";
    els.country.textContent = station.country || "—";
    els.genre.textContent = station.genre || "—";

    if (els.source && station.source) {
      els.source.href = station.source;
      els.source.textContent = "Radio-Vibe.com";
    }
  }

  function pickNextStation() {
    let next;
    do {
      next = Math.floor(Math.random() * stations.length);
    } while (next === currentIndex && stations.length > 1);
    return next;
  }

  function switchStation() {
    resumeAudioContext();
    stopStream();

    setUIState("tuning");
    const staticDuration = 800 + Math.random() * 1200;
    playStatic(staticDuration);

    setTimeout(() => {
      currentIndex = pickNextStation();
      const station = stations[currentIndex];
      setUIState("playing", station);
      playStream(station);
    }, staticDuration);
  }

  function scheduleNextSwitch() {
    const delay = 15000 + Math.random() * 25000;
    switchTimer = setTimeout(() => {
      switchStation();
      scheduleNextSwitch();
    }, delay);
  }

  function start() {
    if (started) return;
    started = true;
    switchStation();
    scheduleNextSwitch();
  }

  function bindUnlock() {
    els.status.textContent = "Нажмите на страницу, чтобы включить радио…";

    document.body.addEventListener(
      "click",
      () => {
        resumeAudioContext().then(start);
      },
      { once: true }
    );
  }

  if (stations.length) {
    bindUnlock();
  } else {
    els.status.textContent = "Станции не найдены";
  }

  window.addEventListener("beforeunload", () => {
    if (switchTimer) clearTimeout(switchTimer);
    stopStream();
  });
})();
