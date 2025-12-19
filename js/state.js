// アプリケーションの状態管理
export const state = {
  rootNote: 'C',
  accidental: 'none',
  chordType: 'none',
  octave: 4,
  voicing: 'root',
  instrument: 'acoustic_grand_piano',
  playMode: 'both'
};

// 状態を更新する関数
export function updateState(key, value) {
  if (key in state) {
    state[key] = value;
    console.log(`State updated: ${key} = ${value}`);
  } else {
    console.warn(`Invalid state key: ${key}`);
  }
}

// 状態を取得する関数
export function getState(key) {
  return key ? state[key] : { ...state };
}