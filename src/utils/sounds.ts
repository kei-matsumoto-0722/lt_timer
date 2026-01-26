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

// 下降和音による敗北感・終了音
export const playExplosion = () => {
  const audioContext = new AudioContext()
  const currentTime = audioContext.currentTime

  // 下降する和音パターン（敗北感を演出）
  const chords = [
    { time: 0.0, notes: [330, 415, 523], duration: 0.6 },    // 高めの和音
    { time: 0.5, notes: [294, 370, 466], duration: 0.6 },    // 少し下がる
    { time: 1.0, notes: [262, 330, 392], duration: 0.6 },    // さらに下がる
    { time: 1.5, notes: [220, 277, 330], duration: 1.2 }     // 最後は長く低く
  ]

  chords.forEach((chord, chordIndex) => {
    chord.notes.forEach((frequency) => {
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()

      osc.type = 'triangle' // 柔らかい音
      osc.frequency.setValueAtTime(frequency, currentTime + chord.time)

      // 音量のエンベロープ
      const startVolume = chordIndex === chords.length - 1 ? 0.4 : 0.35
      gain.gain.setValueAtTime(0, currentTime + chord.time)
      gain.gain.linearRampToValueAtTime(startVolume, currentTime + chord.time + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, currentTime + chord.time + chord.duration)

      osc.connect(gain)
      gain.connect(audioContext.destination)

      osc.start(currentTime + chord.time)
      osc.stop(currentTime + chord.time + chord.duration)
    })
  })

  // 低音を追加して重厚感を出す
  chords.forEach((chord, chordIndex) => {
    const bassOsc = audioContext.createOscillator()
    const bassGain = audioContext.createGain()

    bassOsc.type = 'sine'
    bassOsc.frequency.setValueAtTime(chord.notes[0] * 0.5, currentTime + chord.time)

    const bassVolume = chordIndex === chords.length - 1 ? 0.5 : 0.4
    bassGain.gain.setValueAtTime(0, currentTime + chord.time)
    bassGain.gain.linearRampToValueAtTime(bassVolume, currentTime + chord.time + 0.05)
    bassGain.gain.exponentialRampToValueAtTime(0.01, currentTime + chord.time + chord.duration)

    bassOsc.connect(bassGain)
    bassGain.connect(audioContext.destination)

    bassOsc.start(currentTime + chord.time)
    bassOsc.stop(currentTime + chord.time + chord.duration)
  })
}

// 1分前アラーム（1:00）
export const play1MinAlarm = () => {
  playAlarm(880, 1.0, 0.5)
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
