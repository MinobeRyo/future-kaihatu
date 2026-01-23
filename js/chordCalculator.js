// コード計算モジュール
import { NOTE_LETTERS, CHORD_INTERVALS, RIGHT_HAND_PATTERNS } from './config.js';
import { state } from './state.js';

/**
 * コードの構成音を計算（左手＋右手対応版）
 * @param {string} root - ルート音 ('C', 'D', etc.)
 * @param {string} accidental - 調号 ('none', 'sharp', 'flat')
 * @param {string} type - コードタイプ ('major', 'minor', etc.)
 * @param {number} leftOctave - 左手のオクターブ
 * @param {string} voicing - 左手のボイシング ('root', 'first', 'second', 'spread')
 * @returns {object} - 左手・右手のMIDI番号と音名
 */
export function calculateChordNotes(root, accidental, type, leftOctave, voicing = 'root') {
  console.log("Calculating chord:", root, accidental, type, leftOctave, voicing);
  
  // ========== 1. ルート音の決定 ==========
  let baseRoot = root;
  
  if (accidental === 'sharp') baseRoot += '#';
  else if (accidental === 'flat') baseRoot += 'b';
  
  console.log("Base root with accidental:", baseRoot);
  
  // ========== 2. コードの音程取得 ==========
  const intervals = CHORD_INTERVALS[type] || CHORD_INTERVALS['none'];
  console.log("Chord intervals:", intervals);
  
  // ========== 3. ベースMIDI番号の計算 ==========
  // ルート音のインデックスを取得（C=0, C#=1, ..., B=11）
  let rootIndex = NOTE_LETTERS.indexOf(baseRoot.replace('b', '#'));
  
  // フラット記号の処理（例 Db → C#の位置）
  if (rootIndex === -1 && baseRoot.includes('b')) {
    const naturalNote = baseRoot[0];
    rootIndex = NOTE_LETTERS.indexOf(naturalNote);
    rootIndex = (rootIndex - 1 + 12) % 12;
  }
  
  // MIDI番号の計算: オクターブ×12 + 音階インデックス
  const baseMidi = 12 * (parseInt(leftOctave) + 1) + rootIndex;
  console.log("Base MIDI", baseMidi, "Root index", rootIndex);
  
  // ========== 4. 左手のMIDI計算 ==========
  let leftHandMidi = intervals.map(interval => baseMidi + interval);
  console.log("Left hand MIDI (before voicing):", leftHandMidi);
  
  // 左手ボイシングの適用
  if (type !== 'none' && leftHandMidi.length > 1) {
    switch (voicing) {
      case 'first':  // 第1転回形
        const lowest = leftHandMidi.shift();
        leftHandMidi.push(lowest + 12);
        break;
        
      case 'second': // 第2転回形
        if (leftHandMidi.length >= 3) {
          const first = leftHandMidi.shift();
          const second = leftHandMidi.shift();
          leftHandMidi.push(first + 12, second + 12);
        }
        break;
        
      case 'spread': // 開離配置
        leftHandMidi.push(baseMidi + 12);
        leftHandMidi.sort((a, b) => a - b);
        break;
    }
  }
  
  console.log("Left hand MIDI (after voicing):", leftHandMidi);
  
  // ========== 5. 右手のMIDI計算 ==========
  const rightHandPattern = RIGHT_HAND_PATTERNS[state.rightHandPattern] || RIGHT_HAND_PATTERNS['root'];
  let rightHandMidi = rightHandPattern.generate(baseMidi, intervals, state.rightOctaveShift);
  
  console.log("Right hand MIDI (before voicing):", rightHandMidi);
  
  // 右手ボイシングの適用
  if (state.rightVoicing === 'open' && rightHandMidi.length >= 2) {
    // 開離配置: 各音を2半音ずつ広げる
    rightHandMidi = rightHandMidi.map((midi, index) => midi + (index * 2));
  }
  
  console.log("Right hand MIDI (after voicing):", rightHandMidi);
  
  // ========== 6. MIDI番号を音名に変換 ==========
  const midiToNoteName = (midi) => {
    const octave = Math.floor(midi / 12) - 1;
    const noteIdx = midi % 12;
    const noteName = NOTE_LETTERS[noteIdx];
    return noteName + octave;
  };
  
  const leftHandNoteNames = leftHandMidi.map(midiToNoteName);
  const rightHandNoteNames = rightHandMidi.map(midiToNoteName);
  const allNoteNames = [...leftHandNoteNames, ...rightHandNoteNames];
  
  console.log("Left hand notes", leftHandNoteNames);
  console.log("Right hand notes:", rightHandNoteNames);
  
  // ========== 7. 結果を返す ==========
  return {
    leftHandMidi,           // 【変更】leftHandMidiNotes → leftHandMidi
    rightHandMidi,          // 【追加】右手のMIDI配列
    allMidiNotes: [...leftHandMidi, ...rightHandMidi],  // 全MIDI番号
    leftHandNoteNames,      // 左手の音名配列
    rightHandNoteNames,     // 【追加】右手の音名配列
    allNoteNames            // 全音名配列
  };
}