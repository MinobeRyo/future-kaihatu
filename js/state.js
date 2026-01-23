// アプリケーションの状態管理
export const state = {
  rootNote: 'C',
  accidental: 'none',
  chordType: 'none',
  leftOctave: 4,              // 【変更】octave → leftOctave
  rightOctaveShift: 1,        // 【追加】右手のオクターブシフト（左手からの相対値）
  voicing: 'root',            // 左手ボイシング
  rightHandPattern: 'root',   // 【追加】右手パターン
  rightVoicing: 'close',      // 【追加】右手ボイシング（密集/開離）
  instrument: 'acoustic_grand_piano',
  playMode: 'both'            // 【変更】'both', 'left-only', 'right-only'
};

// 状態を更新する関数
export function updateState(key, value) {
  if (key in state) {
    state[key] = value;
    console.log(`State updated: ${key} = ${value}`);
  } else {
    console.warn(`Invalid state key ${key}`);
  }
}

// 状態を取得する関数
export function getState(key) {
  return key ? state[key] : { ...state };
}