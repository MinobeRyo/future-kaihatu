// ========================================
// 作曲モード - UI更新
// ========================================

import { composeState } from './composeState.js';

// ========== プレビュー更新 ==========
export function updatePreview() {
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
export function updateButtonStates() {
  const canAdd = composeState.currentRoot !== null;
  const addBtn = document.getElementById('add-chord-btn');
  if (addBtn) {
    addBtn.disabled = !canAdd;
    addBtn.style.opacity = canAdd ? '1' : '0.5';
    addBtn.style.cursor = canAdd ? 'pointer' : 'not-allowed';
  }
}

// ========== すべてのタイムラインを描画 ==========
export function renderAllTimelines() {
  ['melody', 'chord', 'bass'].forEach(track => {
    renderTimeline(track);
  });
  updateCountDisplay();
}

// ========== タイムライン描画 ==========
export function renderTimeline(trackName) {
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
export function updateCountDisplay() {
  const totalCount = composeState.timeline.reduce((sum, chord) => sum + chord.length, 0);
  const countElement = document.getElementById('total-count');
  if (countElement) {
    countElement.textContent = totalCount;
  }
}
