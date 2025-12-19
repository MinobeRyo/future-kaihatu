// メインファイル - 初期化と統合
import { initAudio, loadInstrument } from './audioManager.js';
import { createPianoKeyboard } from './keyboard.js';
import { setupEventListeners, setInitialActiveButtons } from './eventHandlers.js';
import { updateChordDisplay, createStatusDisplay, updateStatus, createStartPrompt, removeStartPrompt } from './uiController.js';
import { state } from './state.js';

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
      return;
    }
    
    // 起動プロンプトを削除
    removeStartPrompt();
    
    // ステータス表示の作成
    const statusDiv = createStatusDisplay();
    
    // 楽器の読み込み
    loadInstrument(state.instrument)
      .then(() => {
        console.log("Instrument loaded successfully!");
        updateStatus('オーディオシステム準備完了！', 'success');
        
        // 初期化完了後の処理
        createPianoKeyboard();
        setupEventListeners();
        setInitialActiveButtons();
        updateChordDisplay();
      })
      .catch(err => {
        console.error("Error loading instrument:", err);
        updateStatus('オーディオ初期化エラー: ' + err.message, 'error');
      });
    
    // イベントリスナーを削除
    document.removeEventListener('click', initialize);
  }
  
  // 画面クリックで初期化
  document.addEventListener('click', initialize, { once: true });
});