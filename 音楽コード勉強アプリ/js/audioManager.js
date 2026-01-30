// 音声管理モジュール
import { state } from './state.js';

let audioContext = null;
let instrument = null;

// AudioContextの初期化
export function initAudio() {
  console.log("Initializing audio...");
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log("AudioContext created:", audioContext);
      return true;
    } catch (e) {
      console.error("AudioContext initialization error", e);
      return false;
    }
  }
  
  return true;
}

// 楽器音源の読み込み
export function loadInstrument(instrumentName) {
  console.log("Loading instrument:", instrumentName);
  
  if (!audioContext) {
    console.error("AudioContext not initialized");
    return Promise.reject(new Error("AudioContext not initialized"));
  }
  
  return Soundfont.instrument(audioContext, instrumentName)
    .then(loadedInstrument => {
      console.log("Instrument loaded:", loadedInstrument);
      instrument = loadedInstrument;
      return instrument;
    });
}

// 音符を演奏
export function playNote(noteName) {
  console.log("Attempting to play note:", noteName);
  
  if (instrument) {
    console.log("Using instrument to play:", noteName);
    instrument.play(noteName);
  } else {
    console.warn("Instrument not loaded yet!");
  }
}

// AudioContextの取得
export function getAudioContext() {
  return audioContext;
}

// 楽器の取得
export function getInstrument() {
  return instrument;
}