// イベントハンドラーモジュール
import { state, updateState } from './state.js';
import { loadInstrument, playNote } from './audioManager.js';
import { calculateChordNotes } from './chordCalculator.js';
import { highlightKey } from './keyboard.js';
import { 
  updateChordDisplay, 
  updateStatus, 
  updateOctaveDisplay,
  updateRightOctaveDisplay,
  updateRightPatternDisplay 
} from './uiController.js';
import { CONFIG } from './config.js';

/**
 * 【追加】タブ切り替え機能のセットアップ
 */
function setupTabSwitching() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;
      
      // 全てのタブボタンから active クラスを削除
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // クリックされたタブボタンに active クラスを追加
      button.classList.add('active');
      
      // 全てのタブパネルを非表示
      tabPanels.forEach(panel => panel.classList.remove('active'));
      
      // 対応するタブパネルを表示
      const targetPanel = document.getElementById(`${targetTab}-tab`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
      
      console.log(`Tab switched to: ${targetTab}`);
    });
  });
}

/**
 * 【修正】コード演奏関数（左手・右手対応）
 */
export function playChord() {
  console.log("Playing chord with state:", state);
  
  // コード計算
  const chordData = calculateChordNotes(
    state.rootNote,
    state.accidental,
    state.chordType,
    state.leftOctave,
    state.voicing
  );
  
  // コード名表示の更新
  updateChordDisplay(chordData);
  
  // 【修正】演奏モードに応じた音符の再生
  if (state.playMode === 'both') {
    // 両手演奏
    console.log("Playing both hands");
    [...chordData.leftHandNoteNames, ...chordData.rightHandNoteNames].forEach(noteName => {
      console.log("Playing note", noteName);
      playNote(noteName);
      highlightKey(noteName);
    });
    
  } else if (state.playMode === 'left-only') {
    // 左手のみ
    console.log("Playing left hand only");
    chordData.leftHandNoteNames.forEach(noteName => {
      console.log("Playing left note:", noteName);
      playNote(noteName);
      highlightKey(noteName);
    });
    
  } else if (state.playMode === 'right-only') {
    // 右手のみ
    console.log("Playing right hand only");
    chordData.rightHandNoteNames.forEach(noteName => {
      console.log("Playing right note:", noteName);
      playNote(noteName);
      highlightKey(noteName);
    });
  }
}

/**
 * 【修正】アクティブボタン設定のヘルパー関数
 */
function setActiveButton(selector, targetButton) {
  document.querySelectorAll(selector).forEach(btn => {
    btn.classList.remove('active');
  });
  targetButton.classList.add('active');
}

/**
 * 【修正】イベントリスナーの設定
 */
export function setupEventListeners() {
  console.log("Setting up event listeners");
  
  // ========== 【追加】タブ切り替え ==========
  setupTabSwitching();
  
  // ========== 基礎音ボタン ==========
  document.querySelectorAll('.root-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.root-btn', btn);
      updateState('rootNote', btn.getAttribute('data-root'));
      playChord();
    });
  });
  
  // ========== 調号ボタン ==========
  document.querySelectorAll('.accidental-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.accidental-btn', btn);
      updateState('accidental', btn.getAttribute('data-accidental'));
      playChord();
    });
  });
  
  // ========== コードタイプボタン ==========
  document.querySelectorAll('.chord-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.chord-type-btn', btn);
      updateState('chordType', btn.getAttribute('data-type'));
      playChord();
    });
  });
  
  // ========== 音色選択 ==========
  const instrumentSelect = document.getElementById('instrument-select');
  if (instrumentSelect) {
    instrumentSelect.addEventListener('change', function() {
      updateState('instrument', this.value);
      updateStatus('音色を変更中...', 'warning');
      
      loadInstrument(state.instrument)
        .then(() => {
          updateStatus('音色の変更が完了しました！', 'success');
          playChord();
        })
        .catch(err => {
          console.error("Error changing instrument", err);
          updateStatus('音色の変更に失敗しました: ' + err.message, 'error');
        });
    });
  }
  
  // ========== 左手オクターブ変更 ==========
  const leftOctaveUp = document.getElementById('left-octave-up');
  const leftOctaveDown = document.getElementById('left-octave-down');
  
  if (leftOctaveUp) {
    leftOctaveUp.addEventListener('click', () => {
      if (state.leftOctave < CONFIG.OCTAVE_MAX) {
        updateState('leftOctave', state.leftOctave + 1);
        updateOctaveDisplay(state.leftOctave);
        playChord();
      }
    });
  }
  
  if (leftOctaveDown) {
    leftOctaveDown.addEventListener('click', () => {
      if (state.leftOctave > CONFIG.OCTAVE_MIN) {
        updateState('leftOctave', state.leftOctave - 1);
        updateOctaveDisplay(state.leftOctave);
        playChord();
      }
    });
  }
  
  // ========== 右手オクターブシフト変更 ==========
  const rightOctaveUp = document.getElementById('right-octave-up');
  const rightOctaveDown = document.getElementById('right-octave-down');
  
  if (rightOctaveUp) {
    rightOctaveUp.addEventListener('click', () => {
      if (state.rightOctaveShift < 3) {  // 最大+3オクターブ
        updateState('rightOctaveShift', state.rightOctaveShift + 1);
        updateRightOctaveDisplay(state.rightOctaveShift);
        playChord();
      }
    });
  }
  
  if (rightOctaveDown) {
    rightOctaveDown.addEventListener('click', () => {
      if (state.rightOctaveShift > 0) {  // 最小0（左手と同じ）
        updateState('rightOctaveShift', state.rightOctaveShift - 1);
        updateRightOctaveDisplay(state.rightOctaveShift);
        playChord();
      }
    });
  }
  
  // ========== 左手ボイシングボタン ==========
  document.querySelectorAll('.voicing-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.voicing-btn', btn);
      updateState('voicing', btn.getAttribute('data-voicing'));
      playChord();
    });
  });
  
  // ========== 右手パターンボタン ==========
  document.querySelectorAll('.right-pattern-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.right-pattern-btn', btn);
      const pattern = btn.getAttribute('data-pattern');
      updateState('rightHandPattern', pattern);
      updateRightPatternDisplay(pattern);
      playChord();
    });
  });
  
  // ========== 右手ボイシングボタン ==========
  document.querySelectorAll('.right-voicing-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.right-voicing-btn', btn);
      updateState('rightVoicing', btn.getAttribute('data-voicing'));
      playChord();
    });
  });
  
  // ========== 演奏モードボタン ==========
  document.querySelectorAll('.play-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButton('.play-mode-btn', btn);
      updateState('playMode', btn.getAttribute('data-mode'));
      
      // 【修正】即座にコード表示を更新
      const chordData = calculateChordNotes(
        state.rootNote,
        state.accidental, 
        state.chordType,
        state.leftOctave,
        state.voicing
      );
      updateChordDisplay(chordData);
      playChord();
    });
  });
}

/**
 * 【修正】初期状態のアクティブボタン設定
 */
export function setInitialActiveButtons() {
  console.log("Setting initial active buttons");
  
  // 基本設定
  const rootBtn = document.querySelector(`.root-btn[data-root="${state.rootNote}"]`);
  if (rootBtn) rootBtn.classList.add('active');
  
  const accidentalBtn = document.querySelector(`.accidental-btn[data-accidental="${state.accidental}"]`);
  if (accidentalBtn) accidentalBtn.classList.add('active');
  
  const chordTypeBtn = document.querySelector(`.chord-type-btn[data-type="${state.chordType}"]`);
  if (chordTypeBtn) chordTypeBtn.classList.add('active');
  
  // 左手設定
  const voicingBtn = document.querySelector(`.voicing-btn[data-voicing="${state.voicing}"]`);
  if (voicingBtn) voicingBtn.classList.add('active');
  
  // 右手設定
  const rightPatternBtn = document.querySelector(`.right-pattern-btn[data-pattern="${state.rightHandPattern}"]`);
  if (rightPatternBtn) rightPatternBtn.classList.add('active');
  
  const rightVoicingBtn = document.querySelector(`.right-voicing-btn[data-voicing="${state.rightVoicing}"]`);
  if (rightVoicingBtn) rightVoicingBtn.classList.add('active');
  
  // 演奏モード
  const playModeBtn = document.querySelector(`.play-mode-btn[data-mode="${state.playMode}"]`);
  if (playModeBtn) playModeBtn.classList.add('active');
  
  // 初期表示の更新
  updateOctaveDisplay(state.leftOctave);
  updateRightOctaveDisplay(state.rightOctaveShift);
  updateRightPatternDisplay(state.rightHandPattern);
  
  console.log("Initial active buttons set");
}