// ========== 状態管理 ==========
const composeState = {
  currentRoot: null,
  currentAccidental: 'none',
  currentType: 'major',
  currentLength: 1,
  currentOctave: 4,
  activeTrack: 'chord',
  timeline: [],
  maxCount: 32,
  isPlaying: false,
  isLooping: false,
  bpm: 120
};

let audioContext = null;
let pianoInstrument = null;
let nextChordId = 1;

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

// ========== イベントリスナー設定 ==========
function setupEventListeners() {
  console.log('イベントリスナー設定開始');
  
  // 基礎音選択
  document.querySelectorAll('.root-btn').forEach(btn => {
    btn.addEventListener('click', () => {
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
  
  // 【追加】休符ボタン
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
  
  console.log('✅ イベントリスナー設定完了');
}

// ========== プレビュー更新 ==========
function updatePreview() {
  const previewChord = document.getElementById('preview-chord');
  const previewLength = document.getElementById('preview-length');
  
  if (!previewChord || !previewLength) return;
  
  let chordName = composeState.currentRoot || '?';
  
  // 調号を追加
  if (composeState.currentAccidental === 'sharp') {
    chordName += '♯';
  } else if (composeState.currentAccidental === 'flat') {
    chordName += '♭';
  }
  
  // コードモード時のみタイプを追加
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
    // メロディ/ベースモード時はオクターブを表示（1-8の数値）
    chordName += composeState.currentOctave;
  }
  
  previewChord.textContent = chordName;
  previewLength.textContent = `長さ: ${composeState.currentLength}カウント`;
}

// ========== ボタン状態更新 ==========
function updateButtonStates() {
  const canAdd = composeState.currentRoot !== null;
  const addBtn = document.getElementById('add-chord-btn');
  if (addBtn) {
    addBtn.disabled = !canAdd;
    addBtn.style.opacity = canAdd ? '1' : '0.5';
    addBtn.style.cursor = canAdd ? 'pointer' : 'not-allowed';
  }
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
    id: nextChordId++,
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
    id: nextChordId++,
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

// ========== 位置再計算 ==========
function recalculatePositions() {
  ['melody', 'chord', 'bass'].forEach(track => {
    const trackChords = composeState.timeline
      .filter(c => c.track === track)
      .sort((a, b) => a.position - b.position);
    
    let currentPosition = 0;
    trackChords.forEach(chord => {
      chord.position = currentPosition;
      currentPosition += chord.length;
    });
  });
}

// ========== すべてのタイムラインを描画 ==========
function renderAllTimelines() {
  ['melody', 'chord', 'bass'].forEach(track => {
    renderTimeline(track);
  });
  updateCountDisplay();
}

// ========== タイムライン描画 ==========
function renderTimeline(trackName) {
  const timeline = document.getElementById(`timeline-${trackName}`);
  const emptyMessage = document.getElementById(`empty-message-${trackName}`);
  
  if (!timeline) {
    console.error(`❌ timeline-${trackName}要素が見つかりません`);
    return;
  }
  
  // そのトラックのコードのみフィルター
  const trackChords = composeState.timeline.filter(chord => chord.track === trackName);
  
  // 空メッセージの表示切替
  if (emptyMessage) {
    emptyMessage.style.display = trackChords.length === 0 ? 'block' : 'none';
  }
  
  timeline.innerHTML = '';
  
  // 32個のスロットを作成
  for (let i = 0; i < composeState.maxCount; i++) {
    const slot = document.createElement('div');
    slot.className = 'timeline-slot';
    slot.dataset.position = i;
    timeline.appendChild(slot);
  }
  
  // コードブロックを配置
  trackChords.forEach(chord => {
    const startSlot = timeline.querySelector(`[data-position="${chord.position}"]`);
    if (!startSlot) return;
    
    // 占有スロットをマーク
    for (let i = 0; i < chord.length; i++) {
      const slot = timeline.querySelector(`[data-position="${chord.position + i}"]`);
      if (slot) {
        slot.classList.add('filled');
      }
    }
    
    // コードブロックを作成（休符の場合はクラスを追加）
    const block = document.createElement('div');
    block.className = chord.isRest ? 'chord-block rest' : 'chord-block';
    block.dataset.chordId = chord.id;
    block.style.width = `calc(${chord.length * 100}% + ${(chord.length - 1) * 2}px)`;
    
    block.innerHTML = `
      <span class="chord-name">${chord.name}</span>
      <span class="chord-length">${chord.length}</span>
      <button class="delete-chord" data-id="${chord.id}">×</button>
    `;
    
    startSlot.style.position = 'relative';
    startSlot.appendChild(block);
  });
}

// ========== カウント表示更新 ==========
function updateCountDisplay() {
  const totalCount = composeState.timeline.reduce((sum, chord) => sum + chord.length, 0);
  const countElement = document.getElementById('total-count');
  if (countElement) {
    countElement.textContent = totalCount;
  }
}

// ========== 初期化実行 ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
