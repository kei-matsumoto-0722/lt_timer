// アラーム音を生成
export const playAlarm = (frequency: number, duration: number, volume: number) => {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = frequency
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration
  )

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + duration)
}

// ベートーベン「運命」冒頭風の音（ジャジャジャジャーン）- 重厚で絶望的
export const playExplosion = () => {
  const audioContext = new AudioContext()
  const currentTime = audioContext.currentTime

  // 「運命」の有名な冒頭モチーフ: ソソソ ミ♭ー（G G G Eb）
  // より低く、より重く
  const motif = [
    { time: 0.0, note: 196, duration: 0.3 },   // ジャ（G - 1オクターブ下）
    { time: 0.3, note: 196, duration: 0.3 },   // ジャ（G）
    { time: 0.6, note: 196, duration: 0.3 },   // ジャ（G）
    { time: 1.0, note: 155.5, duration: 1.5 }  // ジャーン（Eb、長く）
  ]

  motif.forEach((note, index) => {
    // 倍音を重ねて厚みを出す（オーケストラのように）
    const harmonics = [
      { multiplier: 1, volume: 0.6, type: 'sawtooth' as OscillatorType },    // 基音（ノコギリ波で倍音豊か）
      { multiplier: 2, volume: 0.4, type: 'triangle' as OscillatorType },    // 2倍音
      { multiplier: 3, volume: 0.25, type: 'sine' as OscillatorType },       // 3倍音
      { multiplier: 4, volume: 0.15, type: 'sine' as OscillatorType },       // 4倍音
      { multiplier: 0.5, volume: 0.7, type: 'sine' as OscillatorType },      // サブベース
      { multiplier: 0.25, volume: 0.5, type: 'sine' as OscillatorType }      // 超低音
    ]

    harmonics.forEach((harmonic) => {
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()

      osc.type = harmonic.type
      osc.frequency.setValueAtTime(note.note * harmonic.multiplier, currentTime + note.time)

      // 最初の3音は短く強烈に、最後は長く絶望的に
      const baseVolume = index === 3 ? harmonic.volume * 0.9 : harmonic.volume * 0.85
      gain.gain.setValueAtTime(0, currentTime + note.time)
      gain.gain.linearRampToValueAtTime(baseVolume, currentTime + note.time + 0.01)

      if (index === 3) {
        // 最後の音は徐々に減衰して絶望感を演出
        gain.gain.exponentialRampToValueAtTime(0.01, currentTime + note.time + note.duration)
      } else {
        // 短い音は鋭く切る
        gain.gain.linearRampToValueAtTime(baseVolume, currentTime + note.time + note.duration - 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, currentTime + note.time + note.duration)
      }

      osc.connect(gain)
      gain.connect(audioContext.destination)

      osc.start(currentTime + note.time)
      osc.stop(currentTime + note.time + note.duration)
    })

    // 不協和音を少し追加して不穏さを増す
    if (index === 3) {
      const dissonantOsc = audioContext.createOscillator()
      const dissonantGain = audioContext.createGain()

      dissonantOsc.type = 'square'
      // わずかにずれた周波数で不協和音
      dissonantOsc.frequency.setValueAtTime(note.note * 1.03, currentTime + note.time)

      dissonantGain.gain.setValueAtTime(0, currentTime + note.time)
      dissonantGain.gain.linearRampToValueAtTime(0.15, currentTime + note.time + 0.1)
      dissonantGain.gain.exponentialRampToValueAtTime(0.01, currentTime + note.time + note.duration)

      dissonantOsc.connect(dissonantGain)
      dissonantGain.connect(audioContext.destination)

      dissonantOsc.start(currentTime + note.time)
      dissonantOsc.stop(currentTime + note.time + note.duration)
    }
  })
}

// 1分前アラーム（1:00）ピンポーン
export const play1MinAlarm = () => {
  const audioContext = new AudioContext()
  const currentTime = audioContext.currentTime

  // ピンポーンの2音（高→低）
  // E5 → C5（ミ → ド）がよく使われる組み合わせ
  const chime = [
    { time: 0.0, note: 659.25, duration: 0.8 },  // ピーン（E5）
    { time: 0.3, note: 523.25, duration: 1.0 }   // ポーン（C5）
  ]

  chime.forEach((tone) => {
    // メインの音（澄んだ鐘の音）
    const mainOsc = audioContext.createOscillator()
    const mainGain = audioContext.createGain()

    mainOsc.type = 'sine'
    mainOsc.frequency.setValueAtTime(tone.note, currentTime + tone.time)

    // 鐘のような響き（ゆっくり立ち上がって徐々に減衰）
    mainGain.gain.setValueAtTime(0, currentTime + tone.time)
    mainGain.gain.linearRampToValueAtTime(0.5, currentTime + tone.time + 0.05)
    mainGain.gain.exponentialRampToValueAtTime(0.01, currentTime + tone.time + tone.duration)

    mainOsc.connect(mainGain)
    mainGain.connect(audioContext.destination)

    mainOsc.start(currentTime + tone.time)
    mainOsc.stop(currentTime + tone.time + tone.duration)

    // 2倍音を追加（鐘の倍音）
    const harmonic2 = audioContext.createOscillator()
    const harmonic2Gain = audioContext.createGain()

    harmonic2.type = 'sine'
    harmonic2.frequency.setValueAtTime(tone.note * 2, currentTime + tone.time)

    harmonic2Gain.gain.setValueAtTime(0, currentTime + tone.time)
    harmonic2Gain.gain.linearRampToValueAtTime(0.2, currentTime + tone.time + 0.05)
    harmonic2Gain.gain.exponentialRampToValueAtTime(0.01, currentTime + tone.time + tone.duration)

    harmonic2.connect(harmonic2Gain)
    harmonic2Gain.connect(audioContext.destination)

    harmonic2.start(currentTime + tone.time)
    harmonic2.stop(currentTime + tone.time + tone.duration)

    // 3倍音を追加（さらに豊かな響き）
    const harmonic3 = audioContext.createOscillator()
    const harmonic3Gain = audioContext.createGain()

    harmonic3.type = 'sine'
    harmonic3.frequency.setValueAtTime(tone.note * 3, currentTime + tone.time)

    harmonic3Gain.gain.setValueAtTime(0, currentTime + tone.time)
    harmonic3Gain.gain.linearRampToValueAtTime(0.1, currentTime + tone.time + 0.05)
    harmonic3Gain.gain.exponentialRampToValueAtTime(0.01, currentTime + tone.time + tone.duration)

    harmonic3.connect(harmonic3Gain)
    harmonic3Gain.connect(audioContext.destination)

    harmonic3.start(currentTime + tone.time)
    harmonic3.stop(currentTime + tone.time + tone.duration)
  })
}

// 時間終了アラーム（0:00）ピピピピッ × 3回
export const playTimeUpAlarm = () => {
  const audioContext = new AudioContext()
  const currentTime = audioContext.currentTime

  const beepFrequency = 1200 // 高めの音
  const beepDuration = 0.06 // 短く速く
  const beepGap = 0.05 // 間隔を短く
  const repeatGap = 0.15 // 3回の繰り返しの間隔

  // 3回繰り返す
  for (let repeat = 0; repeat < 3; repeat++) {
    const repeatStartTime = currentTime + repeat * (4 * (beepDuration + beepGap) + repeatGap)

    // ピピピピッという4連続のビープ音
    for (let i = 0; i < 4; i++) {
      const startTime = repeatStartTime + i * (beepDuration + beepGap)
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = beepFrequency
      oscillator.type = 'square'

      // 各繰り返しの最後のビープだけ少し長くする
      const duration = i === 3 ? 0.12 : beepDuration
      const volume = i === 3 ? 0.5 : 0.4

      gainNode.gain.setValueAtTime(volume, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    }
  }
}
