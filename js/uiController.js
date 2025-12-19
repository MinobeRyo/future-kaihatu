// UI更新・表示制御モジュール
import { CHORD_TYPE_NAMES } from './config.js';
import { state } from './state.js';

// コード名表示の更新
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
  
  // 構成音の表示
  if (chordData) {
    const notes = state.playMode === 'left-only' 
      ? chordData.leftHandNoteNames 
      : chordData.allNoteNames;
    
    document.getElementById('chord-notes').textContent = 
      `構成音: ${notes.join(' - ')}`;
  }
}

// ステータス表示の作成
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

// ステータス更新
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

// 起動プロンプトの作成
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

// 起動プロンプトの削除
export function removeStartPrompt() {
  const startPrompt = document.getElementById('start-prompt');
  if (startPrompt) {
    startPrompt.remove();
  }
}

// オクターブ表示の更新
export function updateOctaveDisplay() {
  document.getElementById('current-octave').textContent = state.octave;
}