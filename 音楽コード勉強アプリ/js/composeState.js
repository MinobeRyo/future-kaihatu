// ========================================
// 作曲モード - 状態管理
// ========================================

// ========== 状態オブジェクト ==========
export const composeState = {
  currentRoot: null,
  currentAccidental: 'none',
  currentType: 'major',
  currentLength: 1,
  currentOctave: 4,
  activeTrack: 'chord',
  timeline: [],
  maxCount: 32,
  isPlaying: false,
  isLooping: false,
  bpm: 120
};

// ========== グローバル変数 ==========
export let audioContext = null;
export let pianoInstrument = null;
let nextChordId = 1;

// ========== ID取得 ==========
export function getNextChordId() {
  return nextChordId++;
}

// ========== 位置再計算 ==========
export function recalculatePositions() {
  ['melody', 'chord', 'bass'].forEach(track => {
    const trackChords = composeState.timeline
      .filter(c => c.track === track)
      .sort((a, b) => a.position - b.position);

    let currentPosition = 0;
    trackChords.forEach(chord => {
      chord.position = currentPosition;
      currentPosition += chord.length;
    });
  });
}
