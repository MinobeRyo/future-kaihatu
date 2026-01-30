// 定数と設定
export const CONFIG = {
  // 鍵盤のサイズ
WHITE_KEY_WIDTH: 25,
WHITE_KEY_MARGIN: 1,
BLACK_KEY_WIDTH: 16,
BLACK_KEY_HEIGHT: 110,
WHITE_KEY_HEIGHT: 180,

// 鍵盤の範囲
MIN_MIDI: 21,  // A0
MAX_MIDI: 108, // C8
MIN_OCTAVE: 0,
MAX_OCTAVE: 8,

// オクターブの制限
OCTAVE_MIN: 2,
OCTAVE_MAX: 6,

// ハイライト時間
HIGHLIGHT_DURATION: 1000
};

// 音符のリスト
export const NOTE_LETTERS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 白鍵のパターン
export const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// 黒鍵の配置パターン
export const BLACK_KEY_POSITIONS = [
{ note: 'C#', afterWhite: 0 },
{ note: 'D#', afterWhite: 1 },
{ note: 'F#', afterWhite: 3 },
{ note: 'G#', afterWhite: 4 },
{ note: 'A#', afterWhite: 5 }
];

// コードの構成音（半音単位での間隔）
export const CHORD_INTERVALS = {
'none': [0],                // 単音
'major': [0, 4, 7],         // メジャー
'minor': [0, 3, 7],         // マイナー
'7': [0, 4, 7, 10],         // 7th
'maj7': [0, 4, 7, 11],      // メジャー7th
'm7': [0, 3, 7, 10],        // マイナー7th
'sus4': [0, 5, 7],          // サスフォー
'dim': [0, 3, 6],           // ディミニッシュ
'aug': [0, 4, 8]            // オーギュメント
};

// コードタイプ名の表示
export const CHORD_TYPE_NAMES = {
'none': '',
'major': 'Major',
'minor': 'Minor',
'7': '7',
'maj7': 'Maj7',
'm7': 'm7',
'sus4': 'sus4',
'dim': 'dim',
'aug': 'aug'
};

// 【追加】右手パターンの定義
export const RIGHT_HAND_PATTERNS = {
'none': {
    name: 'なし',
    generate: () => []
},
'root': {
    name: 'ルート音',
    generate: (baseMidi, intervals, octaveShift) => {
        return [baseMidi + 12 * octaveShift];
    }
},
'chord-tones': {
    name: 'コードトーン',
    generate: (baseMidi, intervals, octaveShift) => {
        return intervals.map(i => baseMidi + 12 * octaveShift + i);
    }
},
'arpeggio': {
    name: 'アルペジオ',
    generate: (baseMidi, intervals, octaveShift) => {
        // 1オクターブ高い位置にコードトーンを配置
        return intervals.map(i => baseMidi + 12 * (octaveShift + 1) + i);
    }
},
'octave-double': {
    name: 'オクターブ重ね',
    generate: (baseMidi, intervals, octaveShift) => {
        // ルート音を2オクターブで重ねる
        return [
            baseMidi + 12 * octaveShift,
            baseMidi + 12 * (octaveShift + 1)
        ];
    }
},
'fifth': {
    name: '5度',
    generate: (baseMidi, intervals, octaveShift) => {
        // 完全5度の音（インターバルの3番目、または最後の音）
        const fifthInterval = intervals.length >= 3 ? intervals[2] : intervals[intervals.length - 1];
        return [baseMidi + 12 * octaveShift + fifthInterval];
    }
}
};