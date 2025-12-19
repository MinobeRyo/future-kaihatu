// UI更新・表示制御モジュール
import { CHORD_TYPE_NAMES, RIGHT_HAND_PATTERNS } from './config.js';  // 【修正】
import { state } from './state.js';

/**
 * コード名表示の更新
 */
export function updateChordDisplay(chordData) {
  let accidentalSymbol = '';
  if (state.accidental === 'sharp') accidentalSymbol = '♯';
  else if (state.accidental === 'flat') accidentalSymbol = '♭';
  
  const chordTypeName = CHORD_TYPE_NAMES[state.chordType] || state.chordType;
  
  // コードタイプが'none'の場合は単音表示
  const chordName = state.chordType === 'none' 
    ? `${state.rootNote}${accidentalSymbol}` 
    : `${state.rootNote}${accidentalSymbol} ${chordTypeName}`;
  
  document.getElementById('chord-name').textContent = chordName;
  
  // 構成音の表示を左手・右手別に対応
  if (chordData) {
    let notesDisplay = '';
    
    if (state.playMode === 'left-only') {
      // 左手のみ
      notesDisplay = `左手: ${chordData.leftHandNoteNames.join(' - ')}`;
      
    } else if (state.playMode === 'right-only') {
      // 右手のみ
      notesDisplay = `右手: ${chordData.rightHandNoteNames.join(' - ')}`;
      
    } else {  // 'both'
      // 両手
      const leftNotes = chordData.leftHandNoteNames.length > 0 
        ? chordData.leftHandNoteNames.join(' - ') 
        : 'なし';
      const rightNotes = chordData.rightHandNoteNames.length > 0 
        ? chordData.rightHandNoteNames.join(' - ') 
        : 'なし';
      notesDisplay = `左手: ${leftNotes} | 右手: ${rightNotes}`;
    }
    
    document.getElementById('chord-notes').textContent = `構成音: ${notesDisplay}`;
  }
}

/**
 * ステータス表示の作成
 */
export function createStatusDisplay() {
  const statusDiv = document.createElement('div');
  statusDiv.id = 'audio-status';
  statusDiv.style.padding = '10px';
  statusDiv.style.backgroundColor = '#e8f5e9';
  statusDiv.style.marginBottom = '10px';
  statusDiv.style.borderRadius = '4px';
  statusDiv.textContent = 'オーディオシステム初期化中...';
  document.querySelector('.app-container').prepend(statusDiv);
  return statusDiv;
}

/**
 * ステータス更新
 */
export function updateStatus(message, type = 'info') {
  const statusDiv = document.getElementById('audio-status');
  if (statusDiv) {
    statusDiv.textContent = message;
    
    switch(type) {
      case 'success':
        statusDiv.style.backgroundColor = '#c8e6c9';
        break;
      case 'error':
        statusDiv.style.backgroundColor = '#ffcdd2';
        break;
      case 'warning':
        statusDiv.style.backgroundColor = '#fff9c4';
        break;
      default:
        statusDiv.style.backgroundColor = '#e8f5e9';
    }
  }
}

/**
 * 起動プロンプトの作成
 */
export function createStartPrompt() {
  const startPrompt = document.createElement('div');
  startPrompt.id = 'start-prompt';
  startPrompt.style.padding = '15px';
  startPrompt.style.backgroundColor = '#e3f2fd';
  startPrompt.style.borderRadius = '4px';
  startPrompt.style.margin = '20px 0';
  startPrompt.style.textAlign = 'center';
  startPrompt.innerHTML = '<strong>🎹 ピアノアプリを起動するには画面をクリックしてください 🎹</strong><br>ブラウザの制限により、ユーザーのクリックがないと音が鳴りません。';
  document.querySelector('.app-container').prepend(startPrompt);
}

/**
 * 起動プロンプトの削除
 */
export function removeStartPrompt() {
  const startPrompt = document.getElementById('start-prompt');
  if (startPrompt) {
    startPrompt.remove();
  }
}

/**
 * 左手オクターブ表示の更新
 */
export function updateOctaveDisplay(octave) {
  const octaveElement = document.getElementById('left-current-octave');
  if (octaveElement) {
    octaveElement.textContent = octave;
  }
}

/**
 * 右手オクターブシフト表示の更新
 */
export function updateRightOctaveDisplay(shift) {
  const shiftElement = document.getElementById('right-octave-shift');
  if (shiftElement) {
    shiftElement.textContent = `+${shift}`;
  }
}

/**
 * 【修正】右手パターン名の表示更新
 */
export function updateRightPatternDisplay(patternKey) {
  const patternElement = document.getElementById('right-pattern-name');
  if (patternElement) {
    // RIGHT_HAND_PATTERNSから名前を取得
    const patternName = RIGHT_HAND_PATTERNS[patternKey]?.name || patternKey;
    patternElement.textContent = patternName;
  }
}