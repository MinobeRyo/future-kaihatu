// ========================================
// 作曲モード - オーディオ管理
// ========================================

import { composeState } from './composeState.js';
import { NOTE_LETTERS, CHORD_INTERVALS } from './config.js';

let audioContext = null;
let instrument = null;
let isAudioReady = false;

// ========== AudioContext初期化 ==========
export function initAudio() {
  console.log('🎵 Initializing audio...');

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('✅ AudioContext created');
      return true;
    } catch (e) {
      console.error('❌ AudioContext initialization error', e);
      return false;
    }
  }

  return true;
}

// ========== 楽器音源読み込み ==========
export async function loadInstrument(instrumentName = 'acoustic_grand_piano') {
  console.log('🎹 Loading instrument:', instrumentName);

  if (!audioContext) {
    console.error('❌ AudioContext not initialized');
    return false;
  }

  try {
    instrument = await Soundfont.instrument(audioContext, instrumentName);
    isAudioReady = true;
    console.log('✅ Instrument loaded:', instrumentName);
    return true;
  } catch (error) {
    console.error('❌ Instrument loading failed:', error);
    return false;
  }
}

// ========== 音符を演奏 ==========
export function playNote(noteName, duration = 1) {
  if (!instrument) {
    console.warn('⚠️ Instrument not loaded yet!');
    return;
  }

  console.log('🎵 Playing note:', noteName);
  instrument.play(noteName, audioContext.currentTime, { duration });
}

// ========== 複数の音を同時に演奏 ==========
export function playNotes(noteNames, duration = 1) {
  if (!instrument) {
    console.warn('⚠️ Instrument not loaded yet!');
    return;
  }

  console.log('🎶 Playing notes:', noteNames);
  noteNames.forEach(noteName => {
    instrument.play(noteName, audioContext.currentTime, { duration });
  });
}

// ========== MIDI番号を音名に変換 ==========
function midiToNoteName(midi) {
  const octave = Math.floor(midi / 12) - 1;
  const noteIdx = midi % 12;
  const noteName = NOTE_LETTERS[noteIdx];
  return noteName + octave;
}

// ========== コードのMIDI番号を計算 ==========
function calculateChordMidi(root, accidental, type, octave) {
  // ルート音の決定
  let baseRoot = root;
  if (accidental === 'sharp') baseRoot += '#';
  else if (accidental === 'flat') baseRoot += 'b';

  // ルート音のインデックス取得
  let rootIndex = NOTE_LETTERS.indexOf(baseRoot.replace('b', '#'));

  // フラット記号の処理
  if (rootIndex === -1 && baseRoot.includes('b')) {
    const naturalNote = baseRoot[0];
    rootIndex = NOTE_LETTERS.indexOf(naturalNote);
    rootIndex = (rootIndex - 1 + 12) % 12;
  }

  // ベースMIDI番号の計算
  const baseMidi = 12 * (parseInt(octave) + 1) + rootIndex;

  // コードの音程取得
  const intervals = CHORD_INTERVALS[type] || CHORD_INTERVALS['major'];

  // 各音のMIDI番号を計算
  return intervals.map(interval => baseMidi + interval);
}

// ========== 現在選択中のコード/音を演奏 ==========
export function playCurrentSelection() {
  if (!isAudioReady) {
    console.warn('⚠️ Audio not ready yet');
    return;
  }

  const { currentRoot, currentAccidental, currentType, currentOctave, activeTrack } = composeState;

  if (!currentRoot) {
    console.warn('⚠️ No root note selected');
    return;
  }

  console.log('🎹 Playing current selection:', currentRoot, currentAccidental, currentType, currentOctave, activeTrack);

  let midiNotes;

  if (activeTrack === 'chord') {
    // コードモード: コードの全音を演奏
    midiNotes = calculateChordMidi(currentRoot, currentAccidental, currentType, currentOctave);
  } else {
    // メロディ/ベースモード: 単音を演奏
    midiNotes = calculateChordMidi(currentRoot, currentAccidental, 'none', currentOctave);
  }

  const noteNames = midiNotes.map(midiToNoteName);
  console.log('🎶 Notes to play:', noteNames);

  playNotes(noteNames, 1.5);
}

// ========== タイムライン上のコードを演奏 ==========
export function playTimelineChord(chord, duration = 1) {
  if (!isAudioReady) {
    console.warn('⚠️ Audio not ready yet');
    return;
  }

  // 休符の場合は何もしない
  if (chord.isRest) {
    console.log('🔇 Rest - no sound');
    return;
  }

  console.log('🎹 Playing timeline chord:', chord);

  let midiNotes;

  if (chord.track === 'chord') {
    // コードトラック
    midiNotes = calculateChordMidi(chord.root, chord.accidental, chord.type, chord.octave || 4);
  } else {
    // メロディ/ベーストラック（単音）
    midiNotes = calculateChordMidi(chord.root, chord.accidental, 'none', chord.octave);
  }

  const noteNames = midiNotes.map(midiToNoteName);
  playNotes(noteNames, duration);
}

// ========== タイムライン全体を再生 ==========
export function playTimeline(onComplete) {
  if (!isAudioReady) {
    console.warn('⚠️ Audio not ready yet');
    return;
  }

  const { timeline, bpm, activeTrack } = composeState;

  // アクティブトラックのコードをフィルター
  const trackChords = timeline
    .filter(c => c.track === activeTrack)
    .sort((a, b) => a.position - b.position);

  if (trackChords.length === 0) {
    console.log('⚠️ No chords to play');
    if (onComplete) onComplete();
    return;
  }

  // 1カウントあたりの秒数を計算（4分音符 = 1カウント）
  const secondsPerCount = 60 / bpm;

  console.log('▶️ Playing timeline at', bpm, 'BPM');

  let currentIndex = 0;

  function playNext() {
    if (currentIndex >= trackChords.length) {
      console.log('⏹️ Playback complete');
      composeState.isPlaying = false;
      if (onComplete) onComplete();
      return;
    }

    const chord = trackChords[currentIndex];
    const duration = chord.length * secondsPerCount;

    playTimelineChord(chord, duration);

    currentIndex++;

    // 次のコードを予約
    setTimeout(playNext, duration * 1000);
  }

  composeState.isPlaying = true;
  playNext();
}

// ========== 再生停止 ==========
export function stopPlayback() {
  composeState.isPlaying = false;
  // Soundfontは個別の音停止が難しいため、フラグで制御
  console.log('⏹️ Playback stopped');
}

// ========== 音源準備状態を確認 ==========
export function isAudioInitialized() {
  return isAudioReady;
}

// ========== AudioContextを取得 ==========
export function getAudioContext() {
  return audioContext;
}
