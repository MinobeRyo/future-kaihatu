  // MusicMagicCircle.js
  class MusicMagicCircle {
    constructor(canvasId) {
      // キャンバス要素の取得
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) {
        console.error('Canvas not found:', canvasId);
        return;
      }
      
      this.ctx = this.canvas.getContext('2d');
      console.log('Canvas initialized:', this.canvas.width, 'x', this.canvas.height);
      
      // 基本設定
      this.centerX = this.canvas.width / 2;
      this.centerY = this.canvas.height / 2;
      this.radius = Math.min(this.centerX, this.centerY) - 50;
      
      // 音楽理論データ
      this.notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      this.currentRoot = 0; // C
      
      // 表示設定
      this.showCircleOfFifths = true;
      this.showDiatonicScale = false;
      this.showChordTriangle = false;
      
      // コード設定
      this.chordType = 'none'; // none, major, minor, maj7, min7, dom7, etc.
      
      // 再生設定
      this.isPlaying = false;
      this.rotation = 0;
      
      // イベントリスナーの設定
      this.setupEventListeners();
      
      // 初期描画
      this.draw();
      console.log('MusicMagicCircle initialized');
    }
    

    setupEventListeners() {
      // マウスのドラッグで内側の図形を回転できるようにする
      let isDragging = false;
      let lastAngle = 0;
      let accumulatedRotation = 0; // 累積回転量
      
      this.canvas.addEventListener('mousedown', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // マウスが円内にあるかチェック
        const distanceFromCenter = Math.sqrt(
          Math.pow(mouseX - this.centerX, 2) + 
          Math.pow(mouseY - this.centerY, 2)
        );
        
        if (distanceFromCenter < this.radius) {
          isDragging = true;
          lastAngle = Math.atan2(mouseY - this.centerY, mouseX - this.centerX);
          accumulatedRotation = 0; // リセット
        }
      });
      
      this.canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const currentAngle = Math.atan2(mouseY - this.centerY, mouseX - this.centerX);
        let deltaAngle = currentAngle - lastAngle;
        
        // 角度の変化が大きすぎる場合（円周の反対側にマウスが移動した場合）は調整
        if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
        if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
        
        accumulatedRotation += deltaAngle;
        lastAngle = currentAngle;
        
        // 30度 = Math.PI / 6
        const stepSize = Math.PI / 6;
        const steps = Math.round(accumulatedRotation / stepSize);
        
        // 1ステップ以上回転したら実際に反映
        if (Math.abs(steps) >= 1) {
          this.rotation += steps * stepSize;
          accumulatedRotation -= steps * stepSize;
          this.draw();
        }
      });
      
      document.addEventListener('mouseup', () => {
        isDragging = false;
      });
      
      // 音名をクリックしたときの処理
      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // クリック位置と中心の距離
        const distance = Math.sqrt(
          Math.pow(clickX - this.centerX, 2) + 
          Math.pow(clickY - this.centerY, 2)
        );
        
        // 外側の円の範囲内かチェック (音名の選択)
        if (distance > this.radius * 0.6 && distance < this.radius) {
          const angle = Math.atan2(clickY - this.centerY, clickX - this.centerX);
          const noteIndex = Math.round(((angle + Math.PI) / (2 * Math.PI)) * 12) % 12;
          
          this.currentRoot = noteIndex;
          this.draw();
          console.log('Selected root', this.notes[this.currentRoot]);
          
          if (this.isPlaying) {
            this.playCurrentChord();
          }
        }
      });
    }
    draw() {
      // キャンバスをクリア
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // 背景を黒に
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // 五度圏（トグル可能）
      if (this.showCircleOfFifths) {
        this.drawChromaticCircle();
      }
      
      // ルート音のハイライト
      if (this.showCircleOfFifths) {
        this.highlightRoot();
      }
      
      // 内側の回転可能な図形
      this.ctx.save();
      this.ctx.translate(this.centerX, this.centerY);
      this.ctx.rotate(this.rotation);
      
      // ダイアトニックスケール (オプション)
      if (this.showDiatonicScale) {
        this.drawDiatonicScale();
      }
      
      // コード三角形 (オプション)
      if (this.showChordTriangle) {
        this.drawChordTriangle();
      }
      
      this.ctx.restore();
      
      // コード名の表示
      this.drawChordName();
    }
    
    drawChromaticCircle() {
      // 外側の円
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // 内側の円
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, this.radius * 0.6, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // 12分割の区切り線 - 文字の間に線が来るように調整
      for (let i = 0; i < 12; i++) {
        // 文字の間の角度を計算
        const angle = (i + 0.5) * (Math.PI * 2 / 12);
        const innerX = this.centerX + Math.cos(angle) * (this.radius * 0.6);
        const innerY = this.centerY + Math.sin(angle) * (this.radius * 0.6);
        const outerX = this.centerX + Math.cos(angle) * this.radius;
        const outerY = this.centerY + Math.sin(angle) * this.radius;
        
        this.ctx.beginPath();
        this.ctx.moveTo(innerX, innerY);
        this.ctx.lineTo(outerX, outerY);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
      
      // 音名の配置
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = '#FFFFFF';
      
      for (let i = 0; i < 12; i++) {
        const angle = i * (Math.PI * 2 / 12);
        const x = this.centerX + Math.cos(angle) * (this.radius * 0.8);
        const y = this.centerY + Math.sin(angle) * (this.radius * 0.8);
        
        this.ctx.fillText(this.notes[i], x, y);
      }
    }
      
    drawDiatonicScale() {
      // ダイアトニックスケール (Cメジャースケール)
      const diatonicPattern = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
      
      // 円のサイズを白い円と完全に一致させる
      const innerRadius = this.radius * 0.6;
      const outerRadius = this.radius;
      
      // 中央の円
      this.ctx.beginPath();
      this.ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
      this.ctx.strokeStyle = '#3080FF';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      
      // 各音階のセグメントを描画
      const segmentWidth = Math.PI * 2 / 12; // 1セグメント = 30度
      const rotationOffset = -2 * segmentWidth; // 60度反時計回りに回転
      
      for (let i = 0; i < diatonicPattern.length; i++) {
        const notePosition = diatonicPattern[i];
        
        // セグメントの中心が音程位置に来るように調整し、全体を回転
        const centerAngle = (notePosition * segmentWidth) - Math.PI / 2 + rotationOffset;
        const startAngle = centerAngle - segmentWidth / 2;
        const endAngle = centerAngle + segmentWidth / 2;
        
        // セグメントを描画（内側の辺は描かない）
        this.ctx.beginPath();
        // 内側の開始点に移動
        this.ctx.moveTo(Math.cos(startAngle) * innerRadius, Math.sin(startAngle) * innerRadius);
        // 左側の直線（内→外）
        this.ctx.lineTo(Math.cos(startAngle) * outerRadius, Math.sin(startAngle) * outerRadius);
        // 外側の円弧
        this.ctx.arc(0, 0, outerRadius, startAngle, endAngle);
        // 右側の直線（外→内）
        this.ctx.lineTo(Math.cos(endAngle) * innerRadius, Math.sin(endAngle) * innerRadius);
        
        this.ctx.strokeStyle = '#3080FF';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
      }
      
      // ラベルを表示
      // 「マイナー」（左上の位置 = C, 0の位置）
      const minorAngle = (0 * segmentWidth) - Math.PI / 2 + rotationOffset;
      const minorX = Math.cos(minorAngle) * (outerRadius * 1.3);
      const minorY = Math.sin(minorAngle) * (outerRadius * 1.3);
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = '#3080FF';
      this.ctx.fillText('マイナー', minorX, minorY);
      
      // 「メジャー」（左下の位置 = A, 9の位置）
      const majorAngle = (9 * segmentWidth) - Math.PI / 2 + rotationOffset;
      const majorX = Math.cos(majorAngle) * (outerRadius * 1.3);
      const majorY = Math.sin(majorAngle) * (outerRadius * 1.3);
      this.ctx.fillText('メジャー', majorX, majorY);
      
      // 中央のテキスト
      this.ctx.font = 'bold 20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = '#3080FF';
      this.ctx.fillText('スケール', 0, -12);
      this.ctx.fillText('(7音)', 0, 12);
    }
    
    drawChordTriangle() {
      const triangleRadius = this.radius * 0.3;
      
      // メジャートライアド
      const majorTriad = [0, 4, 7]; // ルート、メジャー3rd、5th
      this.ctx.beginPath();
      for (let i = 0; i < majorTriad.length; i++) {
        const noteIndex = majorTriad[i];
        const angle = noteIndex * (Math.PI * 2 / 12);
        const x = Math.cos(angle) * triangleRadius;
        const y = Math.sin(angle) * triangleRadius;
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.closePath();
      this.ctx.strokeStyle = '#FF8000';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      
      // マイナートライアド
      const minorTriad = [0, 3, 7]; // ルート、マイナー3rd、5th
      this.ctx.beginPath();
      for (let i = 0; i < minorTriad.length; i++) {
        const noteIndex = minorTriad[i];
        const angle = noteIndex * (Math.PI * 2 / 12);
        const x = Math.cos(angle) * triangleRadius;
        const y = Math.sin(angle) * triangleRadius;
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.closePath();
      this.ctx.strokeStyle = '#00C0FF';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      
      // ラベル表示
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#FF8000';
      this.ctx.fillText('メジャー', -triangleRadius * 0.5, -triangleRadius * 0.3);
      
      this.ctx.fillStyle = '#00C0FF';
      this.ctx.fillText('マイナー', triangleRadius * 0.5, triangleRadius * 0.3);
    }
    
    highlightRoot() {
      // ルート音の位置を計算
      const angle = this.currentRoot * (Math.PI * 2 / 12);
      const x = this.centerX + Math.cos(angle) * (this.radius * 0.8);
      const y = this.centerY + Math.sin(angle) * (this.radius * 0.8);
      
      // 背景ハイライト
      this.ctx.beginPath();
      this.ctx.arc(x, y, 20, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      this.ctx.fill();
      
      // セグメントのハイライト
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.arc(this.centerX, this.centerY, this.radius, 
                  angle - Math.PI/12, angle + Math.PI/12);
      this.ctx.closePath();
      this.ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
      this.ctx.fill();
    }
    
    drawChordName() {
      const rootNote = this.notes[this.currentRoot];
      let chordSuffix = '';
      
      switch(this.chordType) {
        case 'major': chordSuffix = ''; break;
        case 'minor': chordSuffix = 'm'; break;
        case 'maj7': chordSuffix = 'maj7'; break;
        case 'min7': chordSuffix = 'm7'; break;
        case 'dom7': chordSuffix = '7'; break;
        default: chordSuffix = ''; break;
      }
      
      this.ctx.font = 'bold 24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText(rootNote + chordSuffix, this.centerX, this.centerY - this.radius - 20);
    }
    
    // 表示設定メソッド
    toggleCircleOfFifths(show) {
      this.showCircleOfFifths = show;
      this.draw();
    }
    
    toggleDiatonicScale(show) {
      this.showDiatonicScale = show;
      this.draw();
    }
    
    toggleChordTriangle(show) {
      this.showChordTriangle = show;
      this.draw();
    }
    
    // コード設定メソッド
    setChordType(type) {
      this.chordType = type || 'none';
      this.draw();
      
      if (this.isPlaying) {
        this.playCurrentChord();
      }
    }
    
    // 音楽再生メソッド
    playCurrentChord() {
      const rootNote = this.notes[this.currentRoot];
      console.log('Playing:', rootNote, this.chordType);
      
      try {
        // 仮の実装: コンソールに音名を表示するだけ
        console.log('Playing note:', rootNote);
        
        // 将来的には audiomanager.js と chordCalculator.js を使用
      } catch (e) {
        console.error('Error playing chord:', e);
      }
      
      return true;
    }
    
    stopChord() {
      this.isPlaying = false;
    }
    
    togglePlay() {
      this.isPlaying = !this.isPlaying;
      
      if (this.isPlaying) {
        this.playCurrentChord();
      } else {
        this.stopChord();
      }
      
      return this.isPlaying;
    }
  }

  export default MusicMagicCircle;