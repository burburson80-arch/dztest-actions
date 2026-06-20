(function () {
  "use strict";

  const stations = window.STATIONS || [];
  let currentIndex = -1;
  let audioCtx = null;
  let noiseNode = null;
  let gainNode = null;
  let toneOsc = null;
  let toneGain = null;
  let switchTimer = null;

  const els = {
    name: document.getElementById("station-name"),
    freq: document.getElementById("station-freq"),
    genre: document.getElementById("station-genre"),
    status: document.getElementById("status-text"),
    indicator: document.getElementById("signal-indicator"),
    staticBar: document.getElementById("static-bar"),
    needle: document.getElementById("needle"),
    scene: document.querySelector(".scene"),
  };

  function initAudio() {
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

    toneOsc = audioCtx.createOscillator();
    toneGain = audioCtx.createGain();
    toneGain.gain.value = 0;
    toneOsc.type = "sine";
    toneOsc.connect(toneGain);
    toneGain.connect(audioCtx.destination);
    toneOsc.start();
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

  function playStationTone(station) {
    if (!audioCtx || !toneOsc) return;

    const baseFreq = 180 + parseFloat(station.freq) * 2;
    const now = audioCtx.currentTime;

    toneOsc.frequency.cancelScheduledValues(now);
    toneOsc.frequency.setValueAtTime(baseFreq * 0.7, now);
    toneOsc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.3);

    toneGain.gain.cancelScheduledValues(now);
    toneGain.gain.setValueAtTime(0, now);
    toneGain.gain.linearRampToValueAtTime(0.04 + Math.random() * 0.03, now + 0.2);
    toneGain.gain.linearRampToValueAtTime(0.025, now + 2);
  }

  function setUIState(state, station) {
    els.indicator.className = "indicator " + state;
    els.staticBar.classList.toggle("active", state === "tuning");
    els.scene.classList.toggle("static-shake", state === "tuning");

    if (state === "tuning") {
      els.status.textContent = "Шипение… настройка частоты…";
      els.name.classList.add("fading");
    } else if (station) {
      els.status.textContent = "Принимаем «" + station.name + "»";
      els.name.classList.remove("fading");
      els.name.textContent = station.name;
      els.freq.textContent = station.freq;
      els.genre.textContent = station.genre;

      const angle = -90 + (parseFloat(station.freq) - 88) * 12;
      els.needle.style.transform = "translateX(-50%) rotate(" + angle + "deg)";
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
    initAudio();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    setUIState("tuning");
    const staticDuration = 800 + Math.random() * 1200;
    playStatic(staticDuration);

    setTimeout(() => {
      currentIndex = pickNextStation();
      const station = stations[currentIndex];
      setUIState("playing", station);
      playStationTone(station);
    }, staticDuration);
  }

  function scheduleNextSwitch() {
    const delay = 4000 + Math.random() * 8000;
    switchTimer = setTimeout(() => {
      switchStation();
      scheduleNextSwitch();
    }, delay);
  }

  function start() {
    document.body.addEventListener(
      "click",
      function unlock() {
        initAudio();
        if (audioCtx.state === "suspended") audioCtx.resume();
        document.body.removeEventListener("click", unlock);
      },
      { once: true }
    );

    switchStation();
    scheduleNextSwitch();
  }

  if (stations.length) {
    start();
  } else {
    els.status.textContent = "Станции не найдены";
  }

  window.addEventListener("beforeunload", () => {
    if (switchTimer) clearTimeout(switchTimer);
  });
})();
