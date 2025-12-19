// コード計算モジュール
import { NOTE_LETTERS, CHORD_INTERVALS } from './config.js';
import { state } from './state.js';

// コードの構成音を計算
export function calculateChordNotes(root, accidental, type, octave) {
  console.log("Calculating chord:", root, accidental, type, octave);
  
  let baseRoot = root;
  
  // 調号の適用
  if (accidental === 'sharp') baseRoot += '#';
  else if (accidental === 'flat') baseRoot += 'b';
  
  // 選択されたコードタイプの間隔を取得
  const intervals = CHORD_INTERVALS[type] || CHORD_INTERVALS['none'];
  
  // ベースとなるルート音のMIDI番号を計算
  const rootIndex = NOTE_LETTERS.indexOf(baseRoot.replace('b', '#').charAt(0));
  const sharpFlatAdjust = baseRoot.includes('#') ? 1 : (baseRoot.includes('b') ? -1 : 0);
  const baseMidi = 12 * (parseInt(octave) + 1) + rootIndex + sharpFlatAdjust;
  
  console.log("Base MIDI:", baseMidi, "Root index", rootIndex);
  
  // 構成音のMIDI番号を計算
  const chordMidiNotes = intervals.map(interval => baseMidi + interval);
  console.log("Chord MIDI notes", chordMidiNotes);
  
  // 左手コードと右手メロディーを分離
  const leftHandNotes = [...chordMidiNotes];
  const rightHandNotes = type === 'none' ? [chordMidiNotes[0]] : [];
  
  // コード転回形の実装（左手のみ）
  if (type !== 'none' && leftHandNotes.length > 1) {
    switch (state.voicing) {
      case 'first':  // 第1転回形
        leftHandNotes.push(leftHandNotes.shift() + 12);
        break;
      case 'second': // 第2転回形
        leftHandNotes.push(leftHandNotes.shift() + 12);
        leftHandNotes.push(leftHandNotes.shift() + 12);
        break;
      case 'spread': // 広げる
        leftHandNotes.push(leftHandNotes[0] + 12);
        break;
    }
  }
  
  // 全ての音符
  const allNotes = [...new Set([...leftHandNotes, ...rightHandNotes])];
  
  // MIDI番号から音名に変換
  const midiToNoteName = (midi) => {
    const octave = Math.floor(midi / 12) - 1;
    const noteIdx = midi % 12;
    const noteName = NOTE_LETTERS[noteIdx];
    return noteName + octave;
  };
  
  const leftHandNoteNames = leftHandNotes.map(midiToNoteName);
  const rightHandNoteNames = rightHandNotes.map(midiToNoteName);
  const allNoteNames = [...new Set([...leftHandNoteNames, ...rightHandNoteNames])];
  
  return {
    leftHandMidiNotes: leftHandNotes,
    rightHandMidiNotes: rightHandNotes,
    allMidiNotes: allNotes,
    leftHandNoteNames: leftHandNoteNames,
    rightHandNoteNames: rightHandNoteNames,
    allNoteNames: allNoteNames
  };
}