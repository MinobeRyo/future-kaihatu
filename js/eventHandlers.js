// イベントハンドラーモジュール
import { state, updateState } from './state.js';
import { loadInstrument } from './audioManager.js';
import { calculateChordNotes } from './chordCalculator.js';
import { highlightKey } from './keyboard.js';
import { updateChordDisplay, updateStatus, updateOctaveDisplay } from './uiController.js';
import { playNote } from './audioManager.js';
import { CONFIG } from './config.js';

// コード演奏関数
export function playChord() {
  console.log("Playing chord with state:", state);
  
  const chordData = calculateChordNotes(
    state.rootNote,
    state.accidental,
    state.chordType,
    state.octave
  );
  
  // コード名表示の更新
  updateChordDisplay(chordData);
  
  // 構成音の演奏
  if (state.playMode === 'both') {
    chordData.allNoteNames.forEach(noteName => {
      console.log("Playing note in chord (both hands):", noteName);
      playNote(noteName);
      highlightKey(noteName);
    });
  } else if (state.playMode === 'left-only') {
    chordData.leftHandNoteNames.forEach(noteName => {
      console.log("Playing note in chord (left hand only):", noteName);
      playNote(noteName);
      highlightKey(noteName);
    });
  }
}

// イベントリスナーの設定
export function setupEventListeners() {
  console.log("Setting up event listeners");
  
  // 基礎音ボタン
  document.querySelectorAll('.root-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.root-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateState('rootNote', btn.getAttribute('data-root'));
      playChord();
    });
  });
  
  // 調号ボタン
  document.querySelectorAll('.accidental-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.accidental-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateState('accidental', btn.getAttribute('data-accidental'));
      playChord();
    });
  });
  
  // コードタイプボタン
  document.querySelectorAll('.chord-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chord-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateState('chordType', btn.getAttribute('data-type'));
      playChord();
    });
  });
  
  // 音色選択
  document.getElementById('instrument-select').addEventListener('change', function() {
    updateState('instrument', this.value);
    updateStatus('音色を変更中...', 'warning');
    
    loadInstrument(state.instrument)
      .then(() => {
        updateStatus('音色の変更が完了しました！', 'success');
        playChord();
      })
      .catch(err => {
        console.error("Error changing instrument:", err);
        updateStatus('音色の変更に失敗しました: ' + err.message, 'error');
      });
  });
  
  // オクターブ変更
  document.getElementById('octave-up').addEventListener('click', () => {
    if (state.octave < CONFIG.OCTAVE_MAX) {
      updateState('octave', state.octave + 1);
      updateOctaveDisplay();
      playChord();
    }
  });
  
  document.getElementById('octave-down').addEventListener('click', () => {
    if (state.octave > CONFIG.OCTAVE_MIN) {
      updateState('octave', state.octave - 1);
      updateOctaveDisplay();
      playChord();
    }
  });
  
  // 左手コード形状ボタン
  document.querySelectorAll('.voicing-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.voicing-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateState('voicing', btn.getAttribute('data-voicing'));
      playChord();
    });
  });
  
  // 演奏モードボタン
  document.querySelectorAll('.play-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.play-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateState('playMode', btn.getAttribute('data-mode'));
      
      const chordData = calculateChordNotes(
        state.rootNote,
        state.accidental, 
        state.chordType,
        state.octave
      );
      updateChordDisplay(chordData);
      playChord();
    });
  });
}

// 初期状態のアクティブボタン設定
export function setInitialActiveButtons() {
  document.querySelector('.root-btn[data-root="C"]')?.classList.add('active');
  document.querySelector('.accidental-btn[data-accidental="none"]')?.classList.add('active');
  document.querySelector('.chord-type-btn[data-type="none"]')?.classList.add('active');
  document.querySelector('.voicing-btn[data-voicing="root"]')?.classList.add('active');
  document.querySelector('.play-mode-btn[data-mode="both"]')?.classList.add('active');
}