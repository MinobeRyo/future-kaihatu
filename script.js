document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded");
  
  // アプリの状態
  const state = {
    rootNote: 'C',
    accidental: 'none',
    chordType: 'none',
    octave: 4,
    voicing: 'root',
    instrument: 'acoustic_grand_piano',
    playMode: 'both'
  };

  // AudioContext関連
  let audioContext;
  let instrument = null;
  
  // 初期化関数 - ユーザーインタラクション後に呼ばれる
  function initAudio() {
    console.log("Initializing audio...");
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log("AudioContext created:", audioContext);
        
        // ステータス表示
        const statusDiv = document.createElement('div');
        statusDiv.id = 'audio-status';
        statusDiv.style.padding = '10px';
        statusDiv.style.backgroundColor = '#e8f5e9';
        statusDiv.style.marginBottom = '10px';
        statusDiv.style.borderRadius = '4px';
        statusDiv.textContent = 'オーディオシステム初期化中...';
        document.querySelector('.app-container').prepend(statusDiv);
        
        loadInstrument(state.instrument)
          .then(() => {
            console.log("Instrument loaded successfully!");
            statusDiv.style.backgroundColor = '#c8e6c9';
            statusDiv.textContent = 'オーディオシステム準備完了！';
            
            // 初期化完了後に鍵盤生成とイベントリスナー設定
            createPianoKeyboard();
            setupEventListeners();
            updateChordDisplay();
          })
          .catch(err => {
            console.error("Error loading instrument:", err);
            statusDiv.style.backgroundColor = '#ffcdd2';
            statusDiv.textContent = 'オーディオ初期化エラー: ' + err.message;
          });
        
        // イベントリスナーを削除
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
      } catch (e) {
        console.error("AudioContext initialization error:", e);
      }
    }
  }
  
  // 画面クリック/タッチでオーディオ初期化
  document.addEventListener('click', initAudio);
  document.addEventListener('touchstart', initAudio);

  // 88鍵盤の音名 (A0からC8)
  const allNotes = [];
  const noteLetters = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // A0 (21) からC8 (108) までの88鍵盤を生成
  for (let midiNote = 21; midiNote <= 108; midiNote++) {
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    const noteName = noteLetters[noteIndex];
    allNotes.push({
      midi: midiNote,
      name: noteName,
      fullName: noteName + octave,
      isBlack: noteName.includes('#')
    });
  }

  // 楽器音源の読み込み
  function loadInstrument(instrumentName) {
    console.log("Loading instrument:", instrumentName);
    return Soundfont.instrument(audioContext, instrumentName)
      .then(loadedInstrument => {
        console.log("Instrument loaded:", loadedInstrument);
        instrument = loadedInstrument;
        return instrument;
      });
  }

  // ピアノ鍵盤の生成 - 完全に新しいアプローチ
  function createPianoKeyboard() {
    console.log("Creating piano keyboard");
    const keyboard = document.getElementById('piano-keyboard');
    keyboard.innerHTML = '';
    
    // 鍵盤のパターン（白鍵のみ）を定義
    // C, D, E, F, G, A, B の白鍵の配列
    const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    // 黒鍵の配置パターン（対応する白鍵のインデックス）
    // C#は0（C）の右、D#は1（D）の右、など
    const blackKeyPositions = [
      { note: 'C#', afterWhite: 0 },
      { note: 'D#', afterWhite: 1 },
      { note: 'F#', afterWhite: 3 },
      { note: 'G#', afterWhite: 4 },
      { note: 'A#', afterWhite: 5 }
    ];
    
    // 定数
    const WHITE_KEY_WIDTH = 25;
    const WHITE_KEY_MARGIN = 1;
    const BLACK_KEY_WIDTH = 16;
    const BLACK_KEY_HEIGHT = 110;
    const WHITE_KEY_HEIGHT = 180;
    
    // オクターブの範囲（A0からC8まで）
    const minOctave = 0;
    const maxOctave = 8;
    
    // 白鍵を配置
    let whiteKeyCount = 0;
    
    for (let octave = minOctave; octave <= maxOctave; octave++) {
      // 最初のオクターブは特殊（A0, A#0, B0のみ）
      let startNote = (octave === 0) ? 5 : 0; // A=5, C=0
      
      // 最後のオクターブは特殊（C8のみ）
      let endNote = (octave === maxOctave) ? 0 : 6; // C=0, B=6
      
      for (let i = startNote; i <= endNote; i++) {
        const noteName = whiteKeys[i];
        const fullNoteName = noteName + octave;
        
        const key = document.createElement('div');
        key.className = 'key white-key';
        key.setAttribute('data-note', fullNoteName);
        key.style.left = `${whiteKeyCount * (WHITE_KEY_WIDTH + WHITE_KEY_MARGIN * 2)}px`;
        key.style.width = `${WHITE_KEY_WIDTH}px`;
        key.style.height = `${WHITE_KEY_HEIGHT}px`;
        key.style.margin = `0 ${WHITE_KEY_MARGIN}px`;
        key.style.position = 'absolute';
        key.style.zIndex = '1';
        key.style.background = 'white';
        key.style.border = '1px solid #ccc';
        key.style.borderRadius = '0 0 4px 4px';
        
        // Cの鍵盤にはラベルを表示
        if (noteName === 'C') {
          const label = document.createElement('div');
          label.className = 'key-label';
          label.textContent = fullNoteName;
          label.style.position = 'absolute';
          label.style.bottom = '5px';
          label.style.width = '100%';
          label.style.textAlign = 'center';
          label.style.fontSize = '10px';
          key.appendChild(label);
        }
        
        // MIDIノートの割り当て
        const octaveForMidi = parseInt(octave);
        const noteIndex = whiteKeys.indexOf(noteName);
        let midiNote;
        
        // MIDI番号の計算（簡略化のため、すべての白鍵に順番にMIDI番号を割り当て）
        if (octave === 0) {
          // A0(21), B0(23)の特殊なケース
          if (noteName === 'A') midiNote = 21;
          if (noteName === 'B') midiNote = 23;
        } else {
          const baseNote = 24; // C1のMIDI番号
          const octaveOffset = (octaveForMidi - 1) * 12;
          
          // C=0, D=2, E=4, F=5, G=7, A=9, B=11
          const noteOffset = [0, 2, 4, 5, 7, 9, 11][noteIndex];
          
          midiNote = baseNote + octaveOffset + noteOffset;
        }
        
        key.setAttribute('data-midi', midiNote);
        
        // 鍵盤クリックイベント
        key.addEventListener('mousedown', () => {
          playNote(fullNoteName);
          key.classList.add('active');
        });
        
        key.addEventListener('mouseup', () => {
          key.classList.remove('active');
        });
        
        key.addEventListener('mouseleave', () => {
          key.classList.remove('active');
        });
        
        keyboard.appendChild(key);
        whiteKeyCount++;
      }
    }
    
    // 黒鍵を配置
    whiteKeyCount = 0;
    
    for (let octave = minOctave; octave <= maxOctave; octave++) {
      // 最初のオクターブは特殊（A0, A#0, B0のみ）
      let startNote = (octave === 0) ? 5 : 0; // A=5, C=0
      
      // 最後のオクターブは特殊（C8のみ）
      let endNote = (octave === maxOctave) ? 0 : 6; // C=0, B=6
      
      for (let i = startNote; i <= endNote; i++) {
        const noteName = whiteKeys[i];
        
        // 対応する黒鍵があるか確認
        const blackKey = blackKeyPositions.find(bk => bk.afterWhite === i);
        
        if (blackKey && i !== endNote) { // 最後の白鍵の後には黒鍵なし
          // Bの後にC#は置かない（次のオクターブのCの後）
          if (noteName === 'B') continue;
          
          const blackNoteName = blackKey.note;
          const fullBlackNoteName = blackNoteName + octave;
          
          const key = document.createElement('div');
          key.className = 'key black-key';
          key.setAttribute('data-note', fullBlackNoteName);
          
          // 黒鍵の位置は白鍵の右端
          const position = whiteKeyCount * (WHITE_KEY_WIDTH + WHITE_KEY_MARGIN * 2) + (WHITE_KEY_WIDTH * 0.7) - (BLACK_KEY_WIDTH / 2);
          
          key.style.left = `${position}px`;
          key.style.width = `${BLACK_KEY_WIDTH}px`;
          key.style.height = `${BLACK_KEY_HEIGHT}px`;
          key.style.position = 'absolute';
          key.style.zIndex = '2';
          key.style.backgroundColor = '#333';
          key.style.borderRadius = '0 0 4px 4px';
          
          // MIDIノートの割り当て
          const octaveForMidi = parseInt(octave);
          let midiNote;
          
          // MIDI番号の計算
          if (octave === 0) {
            // A#0(22)の特殊なケース
            if (blackNoteName === 'A#') midiNote = 22;
          } else {
            const baseNote = 24; // C1のMIDI番号
            const octaveOffset = (octaveForMidi - 1) * 12;
            
            // C#=1, D#=3, F#=6, G#=8, A#=10
            const blackKeyMap = { 'C#': 1, 'D#': 3, 'F#': 6, 'G#': 8, 'A#': 10 };
            const noteOffset = blackKeyMap[blackNoteName];
            
            midiNote = baseNote + octaveOffset + noteOffset;
          }
          
          key.setAttribute('data-midi', midiNote);
          
          // 鍵盤クリックイベント
          key.addEventListener('mousedown', () => {
            playNote(fullBlackNoteName);
            key.classList.add('active');
          });
          
          key.addEventListener('mouseup', () => {
            key.classList.remove('active');
          });
          
          key.addEventListener('mouseleave', () => {
            key.classList.remove('active');
          });
          
          keyboard.appendChild(key);
        }
        
        whiteKeyCount++;
      }
    }
  }

  // 音符を演奏
  function playNote(noteName) {
    console.log("Attempting to play note:", noteName);
    if (instrument) {
      console.log("Using instrument to play:", noteName);
      instrument.play(noteName);
    } else {
      console.warn("Instrument not loaded yet!");
    }
  }

  // コード計算関数
  function calculateChordNotes(root, accidental, type, octave) {
    console.log("Calculating chord:", root, accidental, type, octave);
    let baseRoot = root;
    
    // 調号の適用
    if (accidental === 'sharp') baseRoot += '#';
    else if (accidental === 'flat') baseRoot += 'b';
    // 'none'と'natural'は変更なし
    
    // コード構成音の計算（半音単位での間隔）
    const chordIntervals = {
      'none': [0],                // 単音（ルートノートのみ）
      'major': [0, 4, 7],         // メジャー (例: C-E-G)
      'minor': [0, 3, 7],         // マイナー (例: C-Eb-G)
      '7': [0, 4, 7, 10],         // 7th (例: C-E-G-Bb)
      'maj7': [0, 4, 7, 11],      // メジャー7th (例: C-E-G-B)
      'm7': [0, 3, 7, 10],        // マイナー7th (例: C-Eb-G-Bb)
      'sus4': [0, 5, 7],          // サスフォー (例: C-F-G)
      'dim': [0, 3, 6],           // ディミニッシュ (例: C-Eb-Gb)
      'aug': [0, 4, 8]            // オーギュメント (例: C-E-G#)
    };
    
    // 選択されたコードタイプの間隔を取得
    const intervals = chordIntervals[type] || chordIntervals['none'];
    
    // ベースとなるルート音のMIDI番号を計算
    const rootIndex = noteLetters.indexOf(baseRoot.replace('b', '#').charAt(0));
    const sharpFlatAdjust = baseRoot.includes('#') ? 1 : (baseRoot.includes('b') ? -1 : 0);
    const baseMidi = 12 * (parseInt(octave) + 1) + rootIndex + sharpFlatAdjust;
    
    console.log("Base MIDI:", baseMidi, "Root index:", rootIndex);
    
    // 構成音のMIDI番号を計算
    const chordMidiNotes = intervals.map(interval => baseMidi + interval);
    console.log("Chord MIDI notes:", chordMidiNotes);
    
    // 左手コードと右手メロディーを分離
    const leftHandNotes = [...chordMidiNotes]; // 左手用コピー
    const rightHandNotes = type === 'none' ? [chordMidiNotes[0]] : []; // 右手用（'none'の場合は単音）
    
    // コード転回形の実装（左手のみ）
    if (type !== 'none' && leftHandNotes.length > 1) {
      switch (state.voicing) {
        case 'first':  // 第1転回形
          leftHandNotes.push(leftHandNotes.shift() + 12);
          break;
        case 'second': // 第2転回形
          leftHandNotes.push(leftHandNotes.shift() + 12);
          leftHandNotes.push(leftHandNotes.shift() + 12);
          break;
        case 'spread': // 広げる（オクターブ上のルート音を追加）
          leftHandNotes.push(leftHandNotes[0] + 12);
          break;
      }
    }
    
    // 全ての音符（左手と右手の両方）
    const allNotes = [...new Set([...leftHandNotes, ...rightHandNotes])];
    
    // MIDI番号から音名に変換
    const leftHandNoteNames = leftHandNotes.map(midi => {
      const octave = Math.floor(midi / 12) - 1;
      const noteIdx = midi % 12;
      const noteName = noteLetters[noteIdx];
      return noteName + octave;
    });
    
    const rightHandNoteNames = rightHandNotes.map(midi => {
      const octave = Math.floor(midi / 12) - 1;
      const noteIdx = midi % 12;
      const noteName = noteLetters[noteIdx];
      return noteName + octave;
    });
    
    const allNoteNames = [...new Set([...leftHandNoteNames, ...rightHandNoteNames])];
    
    return {
      leftHandMidiNotes: leftHandNotes,
      rightHandMidiNotes: rightHandNotes,
      allMidiNotes: allNotes,
      leftHandNoteNames: leftHandNoteNames,
      rightHandNoteNames: rightHandNoteNames,
      allNoteNames: allNoteNames
    };
  }

  // コード演奏関数
  function playChord() {
    console.log("Playing chord with state:", state);
    
    if (!audioContext) {
      console.warn("AudioContext not initialized yet. Click anywhere to initialize.");
      return;
    }
    
    const chordData = calculateChordNotes(
      state.rootNote,
      state.accidental,
      state.chordType,
      state.octave
    );
    
    // コード名表示の更新
    updateChordDisplay(chordData);
    
    // 構成音の演奏（演奏モードに応じて）
    if (instrument) {
      if (state.playMode === 'both') {
        // 両手モード：すべての音を演奏
        chordData.allNoteNames.forEach(noteName => {
          console.log("Playing note in chord (both hands):", noteName);
          playNote(noteName);
          highlightKey(noteName);
        });
      } else if (state.playMode === 'left-only') {
        // 左手のみモード：左手のコードのみ演奏
        chordData.leftHandNoteNames.forEach(noteName => {
          console.log("Playing note in chord (left hand only):", noteName);
          playNote(noteName);
          highlightKey(noteName);
        });
      }
    } else {
      console.warn("Instrument not loaded yet!");
    }
  }

  // 鍵盤ハイライト関数
  function highlightKey(noteName) {
    const key = document.querySelector(`.key[data-note="${noteName}"]`);
    if (key) {
      key.classList.add('active');
      setTimeout(() => {
        key.classList.remove('active');
      }, 1000);
    }
  }

  // コード名表示更新関数
  function updateChordDisplay(chordData) {
    let accidentalSymbol = '';
    if (state.accidental === 'sharp') accidentalSymbol = '♯';
    else if (state.accidental === 'flat') accidentalSymbol = '♭';
    // 'none'と'natural'はシンボルなし
    
    let chordTypeName = '';
    switch(state.chordType) {
      case 'none': chordTypeName = ''; break; // コードタイプなしは表示しない
      case 'major': chordTypeName = 'Major'; break;
      case 'minor': chordTypeName = 'Minor'; break;
      case '7': chordTypeName = '7'; break;
      case 'maj7': chordTypeName = 'Maj7'; break;
      case 'm7': chordTypeName = 'm7'; break;
      case 'sus4': chordTypeName = 'sus4'; break;
      case 'dim': chordTypeName = 'dim'; break;
      case 'aug': chordTypeName = 'aug'; break;
      default: chordTypeName = state.chordType;
    }
    
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

  // イベントリスナーの設定
  function setupEventListeners() {
    console.log("Setting up event listeners");
    
    // 基礎音ボタン
    document.querySelectorAll('.root-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.root-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.rootNote = btn.getAttribute('data-root');
        playChord();
      });
    });
    
    // 調号ボタン
    document.querySelectorAll('.accidental-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.accidental-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.accidental = btn.getAttribute('data-accidental');
        playChord();
      });
    });
    
    // コードタイプボタン
    document.querySelectorAll('.chord-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.chord-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.chordType = btn.getAttribute('data-type');
        playChord();
      });
    });
    
    // 音色選択
    document.getElementById('instrument-select').addEventListener('change', function() {
      state.instrument = this.value;
      const statusDiv = document.getElementById('audio-status');
      if (statusDiv) {
        statusDiv.textContent = '音色を変更中...';
        statusDiv.style.backgroundColor = '#fff9c4';
      }
      
      loadInstrument(state.instrument).then(() => {
        // 音色変更後に現在のコードを再生
        if (statusDiv) {
          statusDiv.textContent = '音色の変更が完了しました！';
          statusDiv.style.backgroundColor = '#c8e6c9';
        }
        playChord();
      }).catch(err => {
        console.error("Error changing instrument:", err);
        if (statusDiv) {
          statusDiv.textContent = '音色の変更に失敗しました: ' + err.message;
          statusDiv.style.backgroundColor = '#ffcdd2';
        }
      });
    });
    
    // オクターブ変更
    document.getElementById('octave-up').addEventListener('click', () => {
      if (state.octave < 6) {
        state.octave++;
        document.getElementById('current-octave').textContent = state.octave;
        playChord();
      }
    });
    
    document.getElementById('octave-down').addEventListener('click', () => {
      if (state.octave > 2) {
        state.octave--;
        document.getElementById('current-octave').textContent = state.octave;
        playChord();
      }
    });
    
    // 左手コード形状ボタン
    document.querySelectorAll('.voicing-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.voicing-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.voicing = btn.getAttribute('data-voicing');
        playChord();
      });
    });
    
    // 演奏モードボタン
    document.querySelectorAll('.play-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.play-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.playMode = btn.getAttribute('data-mode');
        // 演奏モードが変わったら表示を更新してコードを再生
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

  // 初期状態のアクティブボタン
  document.querySelector('.root-btn[data-root="C"]').classList.add('active');
  document.querySelector('.accidental-btn[data-accidental="none"]').classList.add('active');
  document.querySelector('.chord-type-btn[data-type="none"]').classList.add('active');
  document.querySelector('.voicing-btn[data-voicing="root"]').classList.add('active');
  document.querySelector('.play-mode-btn[data-mode="both"]').classList.add('active');
  
  // オーディオ初期化を促すメッセージ
  const startPrompt = document.createElement('div');
  startPrompt.style.padding = '15px';
  startPrompt.style.backgroundColor = '#e3f2fd';
  startPrompt.style.borderRadius = '4px';
  startPrompt.style.margin = '20px 0';
  startPrompt.style.textAlign = 'center';
  startPrompt.innerHTML = '<strong>🎹 ピアノアプリを起動するには画面をクリックしてください 🎹</strong><br>ブラウザの制限により、ユーザーのクリックがないと音が鳴りません。';
  document.querySelector('.app-container').prepend(startPrompt);
});