// メインファイル - 初期化と統合
import { initAudio, loadInstrument } from './audioManager.js';
import { createPianoKeyboard } from './keyboard.js';
import { setupEventListeners, setInitialActiveButtons } from './eventHandlers.js';
import { 
  updateChordDisplay, 
  createStatusDisplay, 
  updateStatus, 
  createStartPrompt, 
  removeStartPrompt,
  updateOctaveDisplay,           // 【追加】
  updateRightOctaveDisplay,      // 【追加】
  updateRightPatternDisplay      // 【追加】
} from './uiController.js';
import { state } from './state.js';
import { calculateChordNotes } from './chordCalculator.js';  // 【追加】

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded");
  
  // 起動プロンプトを表示
  createStartPrompt();
  
  // 初期化関数
  function initialize() {
    console.log("Initializing application...");
    
    // AudioContextの初期化
    if (!initAudio()) {
      console.error("Failed to initialize audio");
      updateStatus('オーディオ初期化に失敗しました', 'error');
      return;
    }
    
    // 起動プロンプトを削除
    removeStartPrompt();
    
    // ステータス表示の作成
    const statusDiv = createStatusDisplay();
    updateStatus('楽器を読み込んでいます...', 'info');
    
    // 楽器の読み込み
    loadInstrument(state.instrument)
      .then(() => {
        console.log("Instrument loaded successfully!");
        updateStatus('オーディオシステム準備完了！', 'success');
        
        // ========== 初期化完了後の処理 ==========
        
        // 1. ピアノ鍵盤の作成
        createPianoKeyboard();
        
        // 2. イベントリスナーの設定
        setupEventListeners();
        
        // 3. 初期アクティブボタンの設定
        setInitialActiveButtons();
        
        // 4. 【修正】初期コードデータの計算と表示更新
        const initialChordData = calculateChordNotes(
          state.rootNote,
          state.accidental,
          state.chordType,
          state.leftOctave,      // 【変更】octave → leftOctave
          state.voicing
        );
        updateChordDisplay(initialChordData);
        
        // 5. 【追加】オクターブ表示の初期化
        updateOctaveDisplay(state.leftOctave);
        updateRightOctaveDisplay(state.rightOctaveShift);
        updateRightPatternDisplay(state.rightHandPattern);
        
        console.log("Application initialized successfully with state", state);
      })
      .catch(err => {
        console.error("Error loading instrument:", err);
        updateStatus('オーディオ初期化エラー: ' + err.message, 'error');
      });
    
    // イベントリスナーを削除（一度だけ実行）
    document.removeEventListener('click', initialize);
  }
  
  // 画面クリックで初期化（ブラウザのオーディオ制限対応）
  document.addEventListener('click', initialize, { once: true });
});