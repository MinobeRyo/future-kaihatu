// ========================================
// 解説ページ - メインロジック
// ========================================

// ========== 定数 ==========
const NOTE_LETTERS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const CHORD_INTERVALS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  seventh: [0, 4, 7, 10]
};

// 音のニュアンス説明
const NOTE_NUANCES = {
  C: 'Cは「ド」の音。明るく安定した響きで、多くの曲の基準となる音です。白鍵の中央に位置し、ピアノを始める時に最初に覚える音でもあります。',
  D: 'Dは「レ」の音。前向きで活発な印象を与えます。Cより少し高く、上昇していくようなエネルギーを感じさせる音です。',
  E: 'Eは「ミ」の音。温かみがあり、心地よい響きです。メジャーキーの中で重要な役割を持ち、明るさの核となる音です。',
  F: 'Fは「ファ」の音。少し緊張感を持った響きで、「次へ進みたい」という感覚を生み出します。物語の展開を感じさせる音です。',
  G: 'Gは「ソ」の音。力強く堂々とした響きです。Cと相性が良く、多くの曲でベース音として使われる重要な音です。',
  A: 'Aは「ラ」の音。オーケストラのチューニング基準（A=440Hz）としても有名。澄んだ、純粋な響きを持っています。',
  B: 'Bは「シ」の音。緊張感があり、「Cに戻りたい」という強い引力を持っています。ドラマチックな展開を作る音です。'
};

// メジャーコードのニュアンス
const MAJOR_NUANCES = {
  C: 'Cメジャーは最も基本的なコード。明るく開放的な響きで、「始まり」「希望」「純粋さ」を感じさせます。多くのポップスやロックの定番コードです。',
  D: 'Dメジャーは明るく輝かしい響き。「喜び」「祝福」を表現するのに最適で、ギターでも弾きやすいためフォークやカントリーでよく使われます。',
  E: 'Eメジャーは温かく豊かな響き。「愛情」「包容力」を感じさせ、ロックやブルースのキーとしても人気です。',
  F: 'Fメジャーは柔らかく穏やかな響き。「優しさ」「安らぎ」を表現し、バラードや子守歌によく合います。',
  G: 'Gメジャーは力強く開放的な響き。「冒険」「自由」を感じさせ、アコースティックギターの曲で特に人気のコードです。',
  A: 'Aメジャーは明るくクリアな響き。「爽やかさ」「青春」を表現し、ポップスやロックで頻繁に使われます。',
  B: 'Bメジャーは輝かしく華やかな響き。「達成感」「クライマックス」を感じさせ、曲のハイライトでよく使われます。'
};

// マイナーコードのニュアンス
const MINOR_NUANCES = {
  C: 'Cマイナーは切なく憂いを帯びた響き。「悲しみ」「内省」「深い感情」を表現するのに使われます。バラードや感動的なシーンでよく聴かれます。',
  D: 'Dマイナーは物悲しく深い響き。「哀愁」「郷愁」を感じさせ、クラシックやジャズでよく使われる美しいコードです。',
  E: 'Eマイナーは静かで内省的な響き。「孤独」「思索」を表現し、ギターで最も弾きやすいマイナーコードの一つです。',
  F: 'Fマイナーは暗く重い響き。「絶望」「苦悩」を感じさせ、ドラマチックな場面で効果的なコードです。',
  G: 'Gマイナーは悲壮感のある響き。「決意」「覚悟」を表現し、映画音楽やゲーム音楽でよく使われます。',
  A: 'Aマイナーは最も基本的なマイナーコード。「切なさ」「ノスタルジア」を感じさせ、日本の歌謡曲でもよく使われます。',
  B: 'Bマイナーは緊張感のある響き。「不安」「期待」を感じさせ、次の展開への橋渡しとしてよく使われます。'
};

// セブンスコードのニュアンス
const SEVENTH_NUANCES = {
  C: 'C7はブルージーで緊張感のある響き。「次への期待」「不安定さ」を持ち、解決を求める力があります。ジャズやブルースで多用されます。',
  D: 'D7は明るいながらも緊張感を持つ響き。「ワクワク感」「予感」を感じさせ、Gメジャーへの進行でよく使われます。',
  E: 'E7はブルースの代表的なコード。「渋さ」「粋」を感じさせ、ロックンロールやR&Bの基盤となるコードです。',
  F: 'F7はジャジーで洗練された響き。「都会的」「大人っぽさ」を表現し、ジャズスタンダードでよく見られます。',
  G: 'G7は親しみやすい緊張感を持つコード。「期待」「予告」を感じさせ、Cメジャーへ戻る前によく使われます。',
  A: 'A7はブルージーで力強い響き。「エネルギー」「情熱」を感じさせ、ブルースやロックで定番のコードです。',
  B: 'B7は強い緊張感と解決への渇望を持つコード。「クライマックス前」「最高潮」を演出するのに効果的です。'
};

// ========== 状態管理 ==========
let currentRoot = 'C';
let audioContext = null;
let instrument = null;
let audioInitialized = false;

// ========== 初期化 ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('📖 解説ページ初期化');
  
  setupEventListeners();
  updateAllDisplays();
  renderAllKeyboards();
});

// ========== オーディオ初期化 ==========
async function initAudio() {
  if (audioInitialized) return true;
  
  console.log('🎵 オーディオ初期化中...');
  
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    instrument = await Soundfont.instrument(audioContext, 'acoustic_grand_piano');
    audioInitialized = true;
    console.log('✅ オーディオ準備完了');
    return true;
  } catch (error) {
    console.error('❌ オーディオ初期化失敗:', error);
    return false;
  }
}

// ========== イベントリスナー ==========
function setupEventListeners() {
  // 根音選択ボタン
  document.querySelectorAll('.root-selector .root-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await initAudio();
      
      document.querySelectorAll('.root-selector .root-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentRoot = btn.dataset.root;
      updateAllDisplays();
      renderAllKeyboards();
    });
  });
  
  // 単音再生
  document.getElementById('play-single')?.addEventListener('click', async () => {
    await initAudio();
    playNote(currentRoot + '4');
  });
  
  // メジャーコード再生
  document.getElementById('play-major')?.addEventListener('click', async () => {
    await initAudio();
    playChord('major');
  });
  
  // マイナーコード再生
  document.getElementById('play-minor')?.addEventListener('click', async () => {
    await initAudio();
    playChord('minor');
  });
  
  // セブンスコード再生
  document.getElementById('play-seventh')?.addEventListener('click', async () => {
    await initAudio();
    playChord('seventh');
  });
}

// ========== 音を再生 ==========
function playNote(noteName) {
  if (!instrument) {
    console.warn('⚠️ 楽器が読み込まれていません');
    return;
  }
  
  console.log('🎵 再生:', noteName);
  instrument.play(noteName, audioContext.currentTime, { duration: 1.5 });
}

// ========== コードを再生 ==========
function playChord(chordType) {
  if (!instrument) {
    console.warn('⚠️ 楽器が読み込まれていません');
    return;
  }
  
  const notes = getChordNotes(currentRoot, chordType);
  console.log('🎹 コード再生:', notes);
  
  notes.forEach(note => {
    instrument.play(note, audioContext.currentTime, { duration: 1.5 });
  });
}

// ========== コードの構成音を取得 ==========
function getChordNotes(root, chordType) {
  const rootIndex = NOTE_LETTERS.indexOf(root);
  const intervals = CHORD_INTERVALS[chordType];
  const octave = 4;
  
  return intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    const noteOctave = octave + Math.floor((rootIndex + interval) / 12);
    return NOTE_LETTERS[noteIndex] + noteOctave;
  });
}

// ========== 構成音を日本語で取得 ==========
function getChordNotesDisplay(root, chordType) {
  const rootIndex = NOTE_LETTERS.indexOf(root);
  const intervals = CHORD_INTERVALS[chordType];
  
  return intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    let noteName = NOTE_LETTERS[noteIndex];
    // フラット表記に変換（見やすさのため）
    noteName = noteName.replace('C#', 'D♭')
                       .replace('D#', 'E♭')
                       .replace('F#', 'G♭')
                       .replace('G#', 'A♭')
                       .replace('A#', 'B♭');
    return noteName;
  }).join(' - ');
}

// ========== 表示を更新 ==========
function updateAllDisplays() {
  // 単音
  document.getElementById('single-note-name').textContent = currentRoot;
  document.getElementById('single-nuance').textContent = NOTE_NUANCES[currentRoot];
  
  // メジャーコード
  document.getElementById('major-chord-name').textContent = currentRoot;
  document.getElementById('major-notes').textContent = getChordNotesDisplay(currentRoot, 'major');
  document.getElementById('major-nuance').textContent = MAJOR_NUANCES[currentRoot];
  
  // マイナーコード
  document.getElementById('minor-chord-name').textContent = currentRoot + 'm';
  document.getElementById('minor-notes').textContent = getChordNotesDisplay(currentRoot, 'minor');
  document.getElementById('minor-nuance').textContent = MINOR_NUANCES[currentRoot];
  
  // セブンスコード
  document.getElementById('seventh-chord-name').textContent = currentRoot + '7';
  document.getElementById('seventh-notes').textContent = getChordNotesDisplay(currentRoot, 'seventh');
  document.getElementById('seventh-nuance').textContent = SEVENTH_NUANCES[currentRoot];
}

// ========== すべての鍵盤を描画 ==========
function renderAllKeyboards() {
  renderKeyboard('single-keyboard', [currentRoot]);
  renderKeyboard('major-keyboard', getChordNotesRaw(currentRoot, 'major'));
  renderKeyboard('minor-keyboard', getChordNotesRaw(currentRoot, 'minor'));
  renderKeyboard('seventh-keyboard', getChordNotesRaw(currentRoot, 'seventh'));
}

// ========== コードの構成音を取得（音名のみ） ==========
function getChordNotesRaw(root, chordType) {
  const rootIndex = NOTE_LETTERS.indexOf(root);
  const intervals = CHORD_INTERVALS[chordType];
  
  return intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return NOTE_LETTERS[noteIndex];
  });
}

// ========== ミニ鍵盤を描画 ==========
function renderKeyboard(containerId, highlightNotes) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  // 鍵盤のサイズ設定
  const WHITE_KEY_WIDTH = 36;
  const WHITE_KEY_MARGIN = 1;
  const WHITE_KEY_TOTAL = WHITE_KEY_WIDTH + WHITE_KEY_MARGIN * 2; // 38px
  const BLACK_KEY_WIDTH = 24;
  
  // 1オクターブ分の鍵盤を作成
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  
  // 白鍵を配置（position: relativeのラッパー内でabsolute配置）
  whiteKeys.forEach((note, index) => {
    const key = document.createElement('div');
    key.className = 'mini-key white';
    key.dataset.note = note;
    key.style.position = 'absolute';
    key.style.left = `${index * WHITE_KEY_TOTAL}px`;
    
    if (highlightNotes.includes(note)) {
      key.classList.add('active');
    }
    
    // ラベル
    const label = document.createElement('span');
    label.className = 'key-label';
    label.textContent = note;
    key.appendChild(label);
    
    container.appendChild(key);
  });
  
  // 黒鍵を配置（白鍵の境目に配置）
  // C#はCとDの間、D#はDとEの間、F#はFとGの間、G#はGとAの間、A#はAとBの間
  const blackKeyData = [
    { note: 'C#', afterWhiteIndex: 0 }, // Cの右端
    { note: 'D#', afterWhiteIndex: 1 }, // Dの右端
    { note: 'F#', afterWhiteIndex: 3 }, // Fの右端
    { note: 'G#', afterWhiteIndex: 4 }, // Gの右端
    { note: 'A#', afterWhiteIndex: 5 }  // Aの右端
  ];
  
  blackKeyData.forEach(({ note, afterWhiteIndex }) => {
    const key = document.createElement('div');
    key.className = 'mini-key black';
    key.dataset.note = note;
    
    // 白鍵の右端 - 黒鍵幅の半分 の位置に配置
    const leftPos = (afterWhiteIndex + 1) * WHITE_KEY_TOTAL - BLACK_KEY_WIDTH / 2;
    key.style.left = `${leftPos}px`;
    
    if (highlightNotes.includes(note)) {
      key.classList.add('active');
    }
    
    container.appendChild(key);
  });
}
