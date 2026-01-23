import { getCurrentChordName, getTotalCount, getCurrentSettings, getTrackTimeline } from './composeState.js';
import { composeState } from './composeState.js';

/**
 * プレビュー表示を更新
 */
export function updatePreview() {
  const chordName = getCurrentChordName();
  const settings = getCurrentSettings();
  
  document.getElementById('preview-chord').textContent = chordName;
  document.getElementById('preview-length').textContent = `長さ: ${settings.length}カウント`;
}

/**
 * ボタンのアクティブ状態を更新
 */
export function updateButtonStates() {
  const settings = getCurrentSettings();
  
  // Root
  document.querySelectorAll('.root-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.root === settings.root);
  });
  
  // Accidental
  document.querySelectorAll('.accidental-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.accidental === settings.accidental);
  });
  
  // Chord Type
  document.querySelectorAll('.chord-type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === settings.type);
  });
  
  // Octave
  document.querySelectorAll('.octave-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.octave) === settings.octave);
  });
  
  // Length
  document.querySelectorAll('.length-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.length) === settings.length);
  });
}

/**
 * トラック選択UIを更新
 */
export function updateTrackUI() {
  document.querySelectorAll('.track-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.track === composeState.activeTrack);
  });
  
  // トラック別表示切り替え
  const chordTypeSection = document.getElementById('chord-type-section');
  const octaveSection = document.getElementById('octave-section');
  
  if (composeState.activeTrack === 'chord') {
    chordTypeSection?.classList.remove('hidden');
    octaveSection?.classList.add('hidden');
  } else {
    chordTypeSection?.classList.add('hidden');
    octaveSection?.classList.remove('hidden');
  }
}

/**
 * 全タイムラインを描画
 */
export function renderAllTimelines() {
  ['melody', 'chord', 'bass'].forEach(track => {
    renderTimeline(track);
  });
}

/**
 * 指定トラックのタイムラインを描画
 */
function renderTimeline(track) {
  const timeline = document.getElementById(`timeline-${track}`);
  if (!timeline) return;
  
  timeline.innerHTML = '';
  
  // スロット作成
  for (let i = 0; i < composeState.maxCount; i++) {
    const slot = document.createElement('div');
    slot.className = 'timeline-slot';
    timeline.appendChild(slot);
  }
  
  // コードブロック配置
  const trackChords = getTrackTimeline(track);
  trackChords.forEach(chord => {
    const block = document.createElement('div');
    block.className = 'chord-block';
    block.style.width = `calc(${chord.length * 100 / composeState.maxCount}% - 2px)`;
    block.innerHTML = `<span>${chord.name}</span>`;
    block.dataset.chordId = chord.id;
    
    if (timeline.children[chord.position]) {
      timeline.children[chord.position].appendChild(block);
    }
  });
}

/**
 * BPM表示を更新
 */
export function updateBPMDisplay(bpm) {
  const bpmValue = document.getElementById('bpm-value');
  if (bpmValue) {
    bpmValue.textContent = bpm;
  }
}