// ピアノ鍵盤生成モジュール
import { CONFIG, WHITE_KEYS, BLACK_KEY_POSITIONS } from './config.js';
import { playNote } from './audioManager.js';

// ピアノ鍵盤の生成
export function createPianoKeyboard() {
  console.log("Creating piano keyboard");
  
  const keyboard = document.getElementById('piano-keyboard');
  keyboard.innerHTML = '';
  
  // 白鍵を配置
  createWhiteKeys(keyboard);
  
  // 黒鍵を配置
  createBlackKeys(keyboard);
}

// 白鍵の生成
function createWhiteKeys(keyboard) {
  let whiteKeyCount = 0;
  
  for (let octave = CONFIG.MIN_OCTAVE; octave <= CONFIG.MAX_OCTAVE; octave++) {
    const startNote = (octave === 0) ? 5 : 0; // A=5, C=0
    const endNote = (octave === CONFIG.MAX_OCTAVE) ? 0 : 6; // C=0, B=6
    
    for (let i = startNote; i <= endNote; i++) {
      const noteName = WHITE_KEYS[i];
      const fullNoteName = noteName + octave;
      
      const key = document.createElement('div');
      key.className = 'key white-key';
      key.setAttribute('data-note', fullNoteName);
      key.style.left = `${whiteKeyCount * (CONFIG.WHITE_KEY_WIDTH + CONFIG.WHITE_KEY_MARGIN * 2)}px`;
      key.style.width = `${CONFIG.WHITE_KEY_WIDTH}px`;
      key.style.height = `${CONFIG.WHITE_KEY_HEIGHT}px`;
      key.style.margin = `0 ${CONFIG.WHITE_KEY_MARGIN}px`;
      key.style.position = 'absolute';
      key.style.zIndex = '1';
      key.style.background = 'white';
      key.style.border = '1px solid #ccc';
      key.style.borderRadius = '0 0 4px 4px';
      
      // Cの鍵盤にはラベルを表示
      if (noteName === 'C') {
        const label = document.createElement('div');
        label.className = 'key-label';
        label.textContent = fullNoteName;
        label.style.position = 'absolute';
        label.style.bottom = '5px';
        label.style.width = '100%';
        label.style.textAlign = 'center';
        label.style.fontSize = '10px';
        key.appendChild(label);
      }
      
      // MIDI番号の割り当て
      const midiNote = calculateWhiteKeyMidi(octave, noteName, i);
      key.setAttribute('data-midi', midiNote);
      
      // イベントリスナー
      addKeyEventListeners(key, fullNoteName);
      
      keyboard.appendChild(key);
      whiteKeyCount++;
    }
  }
}

// 黒鍵の生成
function createBlackKeys(keyboard) {
  let whiteKeyCount = 0;
  
  for (let octave = CONFIG.MIN_OCTAVE; octave <= CONFIG.MAX_OCTAVE; octave++) {
    const startNote = (octave === 0) ? 5 : 0;
    const endNote = (octave === CONFIG.MAX_OCTAVE) ? 0 : 6;
    
    for (let i = startNote; i <= endNote; i++) {
      const noteName = WHITE_KEYS[i];
      
      // 対応する黒鍵があるか確認
      const blackKey = BLACK_KEY_POSITIONS.find(bk => bk.afterWhite === i);
      
      if (blackKey && i !== endNote && noteName !== 'B') {
        const blackNoteName = blackKey.note;
        const fullBlackNoteName = blackNoteName + octave;
        
        const key = document.createElement('div');
        key.className = 'key black-key';
        key.setAttribute('data-note', fullBlackNoteName);
        
        // 黒鍵の位置計算
        const position = whiteKeyCount * (CONFIG.WHITE_KEY_WIDTH + CONFIG.WHITE_KEY_MARGIN * 2) 
                        + (CONFIG.WHITE_KEY_WIDTH * 0.7) 
                        - (CONFIG.BLACK_KEY_WIDTH / 2);
        
        key.style.left = `${position}px`;
        key.style.width = `${CONFIG.BLACK_KEY_WIDTH}px`;
        key.style.height = `${CONFIG.BLACK_KEY_HEIGHT}px`;
        key.style.position = 'absolute';
        key.style.zIndex = '2';
        key.style.backgroundColor = '#333';
        key.style.borderRadius = '0 0 4px 4px';
        
        // MIDI番号の割り当て
        const midiNote = calculateBlackKeyMidi(octave, blackNoteName);
        key.setAttribute('data-midi', midiNote);
        
        // イベントリスナー
        addKeyEventListeners(key, fullBlackNoteName);
        
        keyboard.appendChild(key);
      }
      
      whiteKeyCount++;
    }
  }
}

// 白鍵のMIDI番号計算
function calculateWhiteKeyMidi(octave, noteName, noteIndex) {
  if (octave === 0) {
    if (noteName === 'A') return 21;
    if (noteName === 'B') return 23;
  }
  
  const baseNote = 24; // C1
  const octaveOffset = (octave - 1) * 12;
  const noteOffset = [0, 2, 4, 5, 7, 9, 11][noteIndex];
  
  return baseNote + octaveOffset + noteOffset;
}

// 黒鍵のMIDI番号計算
function calculateBlackKeyMidi(octave, blackNoteName) {
  if (octave === 0 && blackNoteName === 'A#') {
    return 22;
  }
  
  const baseNote = 24; // C1
  const octaveOffset = (octave - 1) * 12;
  const blackKeyMap = { 'C#': 1, 'D#': 3, 'F#': 6, 'G#': 8, 'A#': 10 };
  const noteOffset = blackKeyMap[blackNoteName];
  
  return baseNote + octaveOffset + noteOffset;
}

// 鍵盤のイベントリスナー追加
function addKeyEventListeners(key, noteName) {
  key.addEventListener('mousedown', () => {
    playNote(noteName);
    key.classList.add('active');
  });
  
  key.addEventListener('mouseup', () => {
    key.classList.remove('active');
  });
  
  key.addEventListener('mouseleave', () => {
    key.classList.remove('active');
  });
}

// 鍵盤のハイライト
export function highlightKey(noteName) {
  const key = document.querySelector(`.key[data-note="${noteName}"]`);
  if (key) {
    key.classList.add('active');
    setTimeout(() => {
      key.classList.remove('active');
    }, CONFIG.HIGHLIGHT_DURATION);
  }
}