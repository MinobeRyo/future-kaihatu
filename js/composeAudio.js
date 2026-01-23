// js/composeAudio.js
import { initAudio, loadInstrument, playNote, getInstrument } from './audioManager.js';
import { calculateChordNotes } from './chordCalculator.js';
import { getState as getComposeState } from './composeState.js';

let isAudioReady = false;

/**
 * 音源システムの初期化
 */
export async function initComposeAudio() {
  console.log("🎵 Initializing compose audio system...");
  
  if (!initAudio()) {
    console.error("❌ AudioContext initialization failed");
    return false;
  }
  
  try {
    await loadInstrument('acoustic_grand_piano');
    isAudioReady = true;
    console.log("✅ Compose audio ready!");
    return true;
  } catch (error) {
    console.error("❌ Instrument loading failed:", error);
    return false;
  }
}

/**
 * 作曲システムの現在の設定でコードを演奏
 */
export function playCurrentChord() {
  if (!isAudioReady) {
    console.warn("⚠️ Audio not ready yet");
    return;
  }
  
  const state = getComposeState();
  
  // composeStateの形式からchordCalculatorが期待する形式に変換
  const { root, accidental, chordType, octave } = state.input;
  
  console.log("🎹 Playing chord:", root, accidental, chordType, octave);
  
  // コード計算（既存関数をそのまま使用）
  const chordData = calculateChordNotes(
    root,
    accidental,
    chordType,
    octave,
    'root' // voicingは固定（後で拡張可能）
  );
  
  console.log("🎶 Notes to play:", chordData.allNoteNames);
  
  // 全ての音を再生
  chordData.allNoteNames.forEach(noteName => {
    playNote(noteName);
  });
}

/**
 * タイムライン上の特定のコードを演奏
 * @param {object} chord - { root, accidental, chordType, octave, length }
 */
export function playTimelineChord(chord) {
  if (!isAudioReady) {
    console.warn("⚠️ Audio not ready yet");
    return;
  }
  
  if (chord.type === 'rest') {
    console.log("🔇 Rest - no sound");
    return;
  }
  
  console.log("🎹 Playing timeline chord:", chord);
  
  const chordData = calculateChordNotes(
    chord.root,
    chord.accidental,
    chord.chordType,
    chord.octave,
    'root'
  );
  
  chordData.allNoteNames.forEach(noteName => {
    playNote(noteName);
  });
}

/**
 * 音源の準備状態を確認
 */
export function isAudioInitialized() {
  return isAudioReady;
}