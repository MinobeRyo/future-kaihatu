// ========================================
// 作曲モード - 状態管理
// ========================================

// ========== 定数 ==========
const MAX_COUNT = 32;
const DEFAULT_BPM = 120;
const DEFAULT_LENGTH = 1;
const DEFAULT_OCTAVE = 4;

// ========== 状態定義 ==========
export const composeState = {
  // 現在選択中の値
  currentRoot: null,
  currentAccidental: 'none',
  currentType: 'major',
  currentLength: DEFAULT_LENGTH,
  currentOctave: DEFAULT_OCTAVE,
  
  // トラック設定
  activeTrack: 'chord',
  
  // タイムライン
  timeline: [],
  
  // 再生設定
  maxCount: MAX_COUNT,
  isPlaying: false,
  isLooping: false,
  bpm: DEFAULT_BPM,
  
  // ID管理
  nextChordId: 1
};

// ========== 状態取得 ==========
export function getState() {
  return composeState;
}

export function getTimeline() {
  return composeState.timeline;
}

export function getActiveTrack() {
  return composeState.activeTrack;
}

export function getCurrentSettings() {
  return {
    root: composeState.currentRoot,
    accidental: composeState.currentAccidental,
    type: composeState.currentType,
    length: composeState.currentLength,
    octave: composeState.currentOctave,
    track: composeState.activeTrack
  };
}

// ========== 状態変更 ==========
export function setRoot(root) {
  composeState.currentRoot = root;
  console.log('Root設定:', root);
}

export function setAccidental(accidental) {
  composeState.currentAccidental = accidental;
  console.log('Accidental設定:', accidental);
}

export function setChordType(type) {
  composeState.currentType = type;
  console.log('Type設定:', type);
}

export function setLength(length) {
  composeState.currentLength = parseInt(length);
  console.log('Length設定:', length);
}

export function setOctave(octave) {
  composeState.currentOctave = parseInt(octave);
  console.log('Octave設定:', octave);
}

export function setActiveTrack(track) {
  composeState.activeTrack = track;
  console.log('トラック変更:', track);
}

export function setBPM(bpm) {
  composeState.bpm = parseInt(bpm);
  console.log('BPM設定:', bpm);
}

// ========== タイムライン操作 ==========

/**
 * コードをタイムラインに追加
 */
export function addChordToTimeline() {
  if (!composeState.currentRoot) {
    alert('⚠️ 音を選択してください');
    return false;
  }
  
  // 現在のトラックの合計カウントを計算
  const trackTimeline = composeState.timeline.filter(c => c.track === composeState.activeTrack);
  const currentTotal = trackTimeline.reduce((sum, chord) => sum + chord.length, 0);
  
  // 最大カウント超過チェック
  if (currentTotal + composeState.currentLength > composeState.maxCount) {
    alert(`⚠️ 最大カウント（${composeState.maxCount}）を超えます`);
    return false;
  }
  
  // コード名を生成
  let chordName = composeState.currentRoot;
  
  if (composeState.currentAccidental === 'sharp') {
    chordName += '♯';
  } else if (composeState.currentAccidental === 'flat') {
    chordName += '♭';
  }
  
  if (composeState.activeTrack === 'chord') {
    const typeNames = {
      major: '',
      minor: 'm',
      '7': '7',
      maj7: 'maj7',
      m7: 'm7',
      sus4: 'sus4',
      dim: 'dim',
      aug: 'aug'
    };
    chordName += typeNames[composeState.currentType] || '';
  } else {
    chordName += composeState.currentOctave;
  }
  
  // 新規コード作成
  const newChord = {
    id: composeState.nextChordId++,
    name: chordName,
    track: composeState.activeTrack,
    root: composeState.currentRoot,
    accidental: composeState.currentAccidental,
    type: composeState.currentType,
    octave: composeState.currentOctave,
    length: composeState.currentLength,
    position: currentTotal,
    isRest: false
  };
  
  composeState.timeline.push(newChord);
  console.log('✅ コード追加:', newChord);
  
  return true;
}

/**
 * 休符を追加
 */
export function addRestToTimeline() {
  const trackTimeline = composeState.timeline.filter(c => c.track === composeState.activeTrack);
  const currentTotal = trackTimeline.reduce((sum, chord) => sum + chord.length, 0);
  
  if (currentTotal + composeState.currentLength > composeState.maxCount) {
    alert(`⚠️ 最大カウント（${composeState.maxCount}）を超えます`);
    return false;
  }
  
  const newRest = {
    id: composeState.nextChordId++,
    name: '𝄽',
    track: composeState.activeTrack,
    root: null,
    accidental: 'none',
    type: 'rest',
    octave: null,
    length: composeState.currentLength,
    position: currentTotal,
    isRest: true
  };
  
  composeState.timeline.push(newRest);
  console.log('✅ 休符追加:', newRest);
  
  return true;
}

/**
 * 最後に追加したコードを削除（Undo）
 */
export function deleteLastChord() {
  const trackTimeline = composeState.timeline.filter(c => c.track === composeState.activeTrack);
  
  if (trackTimeline.length === 0) {
    console.warn('⚠️ 削除するコードがありません');
    return false;
  }
  
  const lastChord = trackTimeline[trackTimeline.length - 1];
  const index = composeState.timeline.findIndex(c => c.id === lastChord.id);
  
  if (index !== -1) {
    composeState.timeline.splice(index, 1);
    console.log('🗑️ コード削除:', lastChord);
    recalculatePositions(composeState.activeTrack);
    return true;
  }
  
  return false;
}

/**
 * 特定のコードを削除
 */
export function deleteChordById(chordId) {
  const chord = composeState.timeline.find(c => c.id === chordId);
  if (!chord) return false;
  
  const track = chord.track;
  composeState.timeline = composeState.timeline.filter(c => c.id !== chordId);
  
  console.log('🗑️ コード削除:', chord.name);
  recalculatePositions(track);
  
  return true;
}

/**
 * トラック全体をクリア
 */
export function clearTrack(track) {
  const beforeLength = composeState.timeline.length;
  composeState.timeline = composeState.timeline.filter(c => c.track !== track);
  const deletedCount = beforeLength - composeState.timeline.length;
  
  console.log(`🗑️ トラッククリア: ${track} (${deletedCount}件削除)`);
  return deletedCount > 0;
}

/**
 * タイムライン全体をクリア
 */
export function clearAllTimelines() {
  const count = composeState.timeline.length;
  composeState.timeline = [];
  composeState.nextChordId = 1;
  
  console.log(`🗑️ 全トラッククリア (${count}件削除)`);
  return count > 0;
}

// ========== ユーティリティ ==========

/**
 * 指定トラックのタイムラインを取得
 */
export function getTrackTimeline(track) {
  return composeState.timeline.filter(c => c.track === track);
}

/**
 * 指定トラックの位置を再計算
 */
function recalculatePositions(track) {
  const trackChords = composeState.timeline
    .filter(c => c.track === track)
    .sort((a, b) => a.position - b.position);
  
  let currentPosition = 0;
  trackChords.forEach(chord => {
    chord.position = currentPosition;
    currentPosition += chord.length;
  });
}

/**
 * 全トラックの合計カウントを計算
 */
export function getTotalCount() {
  return composeState.timeline.reduce((sum, chord) => sum + chord.length, 0);
}

/**
 * 現在選択中のコード名を生成
 */
export function getCurrentChordName() {
  if (!composeState.currentRoot) {
    return '未選択';
  }
  
  let chordName = composeState.currentRoot;
  
  if (composeState.currentAccidental === 'sharp') {
    chordName += '♯';
  } else if (composeState.currentAccidental === 'flat') {
    chordName += '♭';
  }
  
  if (composeState.activeTrack === 'chord') {
    const typeNames = {
      major: '',
      minor: 'm',
      '7': '7',
      maj7: 'maj7',
      m7: 'm7',
      sus4: 'sus4',
      dim: 'dim',
      aug: 'aug'
    };
    chordName += typeNames[composeState.currentType] || '';
  } else {
    chordName += composeState.currentOctave;
  }
  
  return chordName;
}

/**
 * 状態のリセット
 */
export function resetState() {
  composeState.currentRoot = null;
  composeState.currentAccidental = 'none';
  composeState.currentType = 'major';
  composeState.currentLength = DEFAULT_LENGTH;
  composeState.currentOctave = DEFAULT_OCTAVE;
  composeState.timeline = [];
  composeState.nextChordId = 1;
  
  console.log('🔄 状態リセット完了');
}