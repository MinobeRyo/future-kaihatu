// ========================================
// 作曲モード - メインロジック（エントリーポイント）
// ========================================

import { composeState, getNextChordId, recalculatePositions } from './composeState.js';
import { updatePreview, updateButtonStates, renderAllTimelines } from './composeUI.js';
import {
  initAudio,
  loadInstrument,
  playCurrentSelection,
  playTimeline,
  stopPlayback
} from './composeAudio.js';

let audioInitialized = false;

// ========== 初期化 ==========
function init() {
  console.log('=== 作曲モード初期化開始 ===');

  const requiredElements = [
    'preview-chord',
    'preview-length',
    'total-count',
    'timeline-melody',
    'timeline-chord',
    'timeline-bass',
    'add-chord-btn'
  ];

  let allFound = true;
  requiredElements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`❌ 要素が見つかりません: #${id}`);
      allFound = false;
    } else {
      console.log(`✅ 要素発見: #${id}`);
    }
  });

  if (!allFound) {
    console.error('必要な要素が不足しています。HTMLを確認してください。');
    return;
  }

  // 初期状態でコードモードに設定
  document.body.className = 'chord-mode';

  setupEventListeners();
  updatePreview();
  updateButtonStates();
  renderAllTimelines();

  console.log('=== 初期化完了 ===');
  console.log('現在の状態:', composeState);
}

// ========== オーディオ初期化（ユーザー操作時に呼び出し） ==========
async function initializeAudio() {
  if (audioInitialized) return true;

  console.log('🎵 オーディオシステム初期化中...');

  if (!initAudio()) {
    console.error('❌ AudioContext初期化失敗');
    return false;
  }

  try {
    await loadInstrument('acoustic_grand_piano');
    audioInitialized = true;
    console.log('✅ オーディオシステム準備完了');
    return true;
  } catch (error) {
    console.error('❌ 楽器読み込み失敗:', error);
    return false;
  }
}

// ========== イベントリスナー設定 ==========
function setupEventListeners() {
  console.log('イベントリスナー設定開始');

  // 基礎音選択
  document.querySelectorAll('.root-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      // 最初のクリックでオーディオ初期化
      await initializeAudio();

      document.querySelectorAll('.root-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      composeState.currentRoot = btn.dataset.root;
      updatePreview();
      updateButtonStates();
    });
  });

  // 調号選択
  document.querySelectorAll('.accidental-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.accidental-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      composeState.currentAccidental = btn.dataset.accidental;
      updatePreview();
    });
  });

  // コードタイプ選択
  document.querySelectorAll('.chord-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chord-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      composeState.currentType = btn.dataset.type;
      updatePreview();
    });
  });

  // オクターブ選択
  document.querySelectorAll('.octave-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.octave-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      composeState.currentOctave = parseInt(btn.dataset.octave);
      updatePreview();
    });
  });

  // 長さ選択
  document.querySelectorAll('.length-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.length-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      composeState.currentLength = parseInt(btn.dataset.length);
      updatePreview();
    });
  });

  // トラック切替ボタン
  document.querySelectorAll('.track-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const track = btn.dataset.track;

      // すべてのボタンから active を削除
      document.querySelectorAll('.track-mode-btn').forEach(b => b.classList.remove('active'));

      // クリックされたボタンに active を追加
      btn.classList.add('active');

      // bodyのクラスを変更（コードタイプ/オクターブの表示切替用）
      document.body.className = `${track}-mode`;

      composeState.activeTrack = track;
      console.log(`✅ トラック切替: ${track}`);
      updatePreview();
      renderAllTimelines();
    });
  });

  // 追加ボタン
  const addBtn = document.getElementById('add-chord-btn');
  if (addBtn) {
    addBtn.addEventListener('click', addChordToTimeline);
  }

  // 休符ボタン
  const restBtn = document.getElementById('rest-btn');
  if (restBtn) {
    restBtn.addEventListener('click', addRestToTimeline);
  }

  // 削除ボタンのイベント委譲
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-chord')) {
      const chordId = parseInt(e.target.dataset.id);
      deleteChord(chordId);
    }
  });

  // クリアボタン
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('すべてのコードを削除しますか?')) {
        composeState.timeline = [];
        renderAllTimelines();
      }
    });
  }

  // ========== オーディオ関連イベント ==========

  // プレビューボタン（音を確認）
  const previewBtn = document.getElementById('preview-btn');
  if (previewBtn) {
    previewBtn.addEventListener('click', async () => {
      await initializeAudio();
      playCurrentSelection();
    });
  }

  // 再生ボタン
  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', async () => {
      if (composeState.isPlaying) {
        stopPlayback();
        playBtn.textContent = '▶️ 再生';
        return;
      }

      await initializeAudio();
      playBtn.textContent = '⏸️ 一時停止';

      const handleComplete = () => {
        playBtn.textContent = '▶️ 再生';
        if (composeState.isLooping && composeState.timeline.length > 0) {
          playTimeline(handleComplete);
        }
      };

      playTimeline(handleComplete);
    });
  }

  // 停止ボタン
  const stopBtn = document.getElementById('stop-btn');
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      stopPlayback();
      const playBtn = document.getElementById('play-btn');
      if (playBtn) playBtn.textContent = '▶️ 再生';
    });
  }

  // ループボタン
  const loopBtn = document.getElementById('loop-btn');
  if (loopBtn) {
    loopBtn.addEventListener('click', () => {
      composeState.isLooping = !composeState.isLooping;
      loopBtn.classList.toggle('active', composeState.isLooping);
      console.log(`🔁 ループ: ${composeState.isLooping ? 'ON' : 'OFF'}`);
    });
  }

  // BPMスライダー
  const bpmSlider = document.getElementById('bpm-slider');
  const bpmValue = document.getElementById('bpm-value');
  if (bpmSlider && bpmValue) {
    bpmSlider.addEventListener('input', () => {
      composeState.bpm = parseInt(bpmSlider.value);
      bpmValue.textContent = composeState.bpm;
      console.log(`🎵 BPM: ${composeState.bpm}`);
    });
  }

  // ========== 保存/読込機能 ==========

  // 保存ボタン
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveProject);
  }

  // 読込ボタン
  const loadBtn = document.getElementById('load-btn');
  if (loadBtn) {
    loadBtn.addEventListener('click', loadProject);
  }

  console.log('✅ イベントリスナー設定完了');
}

// ========== タイムラインに追加 ==========
function addChordToTimeline() {
  if (!composeState.currentRoot) {
    alert('⚠️ 基礎音を選択してください');
    return;
  }

  // アクティブトラックのみの合計を計算
  const trackChords = composeState.timeline.filter(c => c.track === composeState.activeTrack);
  const currentTotal = trackChords.reduce((sum, chord) => sum + chord.length, 0);

  if (currentTotal + composeState.currentLength > composeState.maxCount) {
    alert(`⚠️ このトラックは最大${composeState.maxCount}カウントを超えます`);
    return;
  }

  let chordName = composeState.currentRoot;

  // 調号を追加
  if (composeState.currentAccidental === 'sharp') {
    chordName += '♯';
  } else if (composeState.currentAccidental === 'flat') {
    chordName += '♭';
  }

  // コードタイプまたはオクターブを追加
  if (composeState.activeTrack === 'chord') {
    const typeNames = {
      major: '',
      minor: 'm',
      '7': '7',
      maj7: 'maj7',
      m7: 'm7',
      sus4: 'sus4',
      dim: 'dim',
      aug: 'aug'
    };
    chordName += typeNames[composeState.currentType] || '';
  } else {
    chordName += composeState.currentOctave;
  }

  const newChord = {
    id: getNextChordId(),
    name: chordName,
    root: composeState.currentRoot,
    accidental: composeState.currentAccidental,
    type: composeState.currentType,
    octave: composeState.currentOctave,
    length: composeState.currentLength,
    position: currentTotal,
    track: composeState.activeTrack,
    isRest: false
  };

  composeState.timeline.push(newChord);
  console.log('✅ コード追加:', newChord);

  renderAllTimelines();
}

// ========== 休符をタイムラインに追加 ==========
function addRestToTimeline() {
  // アクティブトラックの合計を計算
  const trackChords = composeState.timeline.filter(c => c.track === composeState.activeTrack);
  const currentTotal = trackChords.reduce((sum, chord) => sum + chord.length, 0);

  if (currentTotal + composeState.currentLength > composeState.maxCount) {
    alert(`⚠️ このトラックは最大${composeState.maxCount}カウントを超えます`);
    return;
  }

  const newRest = {
    id: getNextChordId(),
    name: '𝄽', // 休符記号
    root: null,
    accidental: 'none',
    type: 'rest',
    octave: null,
    length: composeState.currentLength,
    position: currentTotal,
    track: composeState.activeTrack,
    isRest: true // 休符フラグ
  };

  composeState.timeline.push(newRest);
  console.log('🎵 休符追加:', newRest);

  renderAllTimelines();
}

// ========== コード削除 ==========
function deleteChord(chordId) {
  const chord = composeState.timeline.find(c => c.id === chordId);
  if (chord) {
    console.log('🗑️ コード削除:', chord.name);
  }

  composeState.timeline = composeState.timeline.filter(chord => chord.id !== chordId);

  // 削除後に位置を再計算
  recalculatePositions();
  renderAllTimelines();
}

// ========== プロジェクト保存 ==========
function saveProject() {
  const projectData = {
    version: '1.0',
    savedAt: new Date().toISOString(),
    bpm: composeState.bpm,
    timeline: composeState.timeline
  };

  const jsonString = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // ダウンロードリンクを作成
  const a = document.createElement('a');
  a.href = url;
  a.download = `compose_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('💾 プロジェクト保存完了');
}

// ========== プロジェクト読込 ==========
function loadProject() {
  // ファイル選択ダイアログを表示
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target.result);

        // データの検証
        if (!projectData.timeline || !Array.isArray(projectData.timeline)) {
          alert('⚠️ 無効なファイル形式です');
          return;
        }

        // 確認ダイアログ
        if (composeState.timeline.length > 0) {
          if (!confirm('現在のデータを上書きしますか？')) {
            return;
          }
        }

        // データを復元
        composeState.timeline = projectData.timeline;
        if (projectData.bpm) {
          composeState.bpm = projectData.bpm;
          const bpmSlider = document.getElementById('bpm-slider');
          const bpmValue = document.getElementById('bpm-value');
          if (bpmSlider) bpmSlider.value = composeState.bpm;
          if (bpmValue) bpmValue.textContent = composeState.bpm;
        }

        // 再描画
        renderAllTimelines();

        console.log('📂 プロジェクト読込完了:', projectData);
        alert('✅ プロジェクトを読み込みました');
      } catch (error) {
        console.error('❌ 読込エラー:', error);
        alert('⚠️ ファイルの読み込みに失敗しました');
      }
    };

    reader.readAsText(file);
  });

  input.click();
}

// ========== 初期化実行 ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
