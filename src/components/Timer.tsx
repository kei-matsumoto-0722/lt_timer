import { useEffect, useRef, useState } from 'react'
import p5 from 'p5'
import { IoArrowBack } from 'react-icons/io5'
import { play1MinAlarm, playTimeUpAlarm, playExplosion } from '../utils/sounds'
import './Timer.css'

interface TimerProps {
  totalMinutes: number
  onComplete: () => void
  onReset: () => void
}

const Timer = ({ totalMinutes, onComplete, onReset }: TimerProps) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const p5Instance = useRef<p5 | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(totalMinutes * 60)
  const remainingSecondsRef = useRef(totalMinutes * 60)
  const [hasPlayedAlarm1, setHasPlayedAlarm1] = useState(false)
  const [hasPlayedAlarm2, setHasPlayedAlarm2] = useState(false)
  const [hasPlayedAlarm3, setHasPlayedAlarm3] = useState(false)

  // タイマーのロジック
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        const endTime = -30
        const newValue = prev <= endTime ? endTime : prev - 1
        remainingSecondsRef.current = newValue
        return newValue
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [totalMinutes])

  // ページタイトルに残り時間を表示
  useEffect(() => {
    const minutes = Math.floor(Math.abs(remainingSeconds) / 60)
    const seconds = Math.abs(remainingSeconds) % 60
    const sign = remainingSeconds < 0 ? '-' : ''
    const timeText = `${sign}${minutes}:${seconds.toString().padStart(2, '0')}`
    document.title = timeText

    return () => {
      document.title = 'lt_timer'
    }
  }, [remainingSeconds])

  // アラームチェック
  useEffect(() => {
    if (totalMinutes === 5) {
      // 4分経過（残り60秒）
      if (remainingSeconds === 60 && !hasPlayedAlarm1) {
        play1MinAlarm()
        setHasPlayedAlarm1(true)
      }
      // 5分経過（残り0秒）
      if (remainingSeconds === 0 && !hasPlayedAlarm2) {
        playTimeUpAlarm()
        setHasPlayedAlarm2(true)
      }
    } else if (totalMinutes === 2) {
      // 1分経過（残り60秒）
      if (remainingSeconds === 60 && !hasPlayedAlarm1) {
        play1MinAlarm()
        setHasPlayedAlarm1(true)
      }
      // 2分経過（残り0秒）
      if (remainingSeconds === 0 && !hasPlayedAlarm2) {
        playTimeUpAlarm()
        setHasPlayedAlarm2(true)
      }
    }

    // 終了チェック（-30秒で終了）
    if (remainingSeconds === -30 && !hasPlayedAlarm3) {
      playExplosion() // ドカーン！爆発音
      setHasPlayedAlarm3(true)
      setTimeout(() => {
        onComplete()
      }, 1000)
    }
  }, [remainingSeconds, totalMinutes, hasPlayedAlarm1, hasPlayedAlarm2, hasPlayedAlarm3, onComplete])

  // P5.jsアニメーション
  useEffect(() => {
    if (!canvasRef.current) return

    // 既存のインスタンスがあれば削除
    if (p5Instance.current) {
      p5Instance.current.remove()
    }

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(800, 800)
        p.frameRate(30)
      }

      p.draw = () => {
        p.background(20, 20, 30)

        const totalSeconds = totalMinutes * 60
        const currentRemaining = remainingSecondsRef.current

        // 0以上の場合は通常の進捗、0未満の場合は延長時間の進捗
        let progress: number
        if (currentRemaining >= 0) {
          progress = currentRemaining / totalSeconds
        } else {
          // -30秒から0秒の間で、0から1に進む
          progress = p.map(currentRemaining, -30, 0, 0, 1)
        }

        // 色の変化（緑→黄→赤）
        let fillColor: p5.Color
        if (currentRemaining < 0) {
          // マイナス時間は濃い赤で固定
          fillColor = p.color(255, 30, 30)
        } else if (progress > 0.5) {
          fillColor = p.color(
            p.map(progress, 1, 0.5, 100, 255),
            255,
            100
          )
        } else if (progress > 0.2) {
          fillColor = p.color(
            255,
            p.map(progress, 0.5, 0.2, 255, 150),
            100
          )
        } else {
          fillColor = p.color(
            255,
            p.map(progress, 0.2, 0, 100, 50),
            p.map(progress, 0.2, 0, 100, 50)
          )
        }

        // 回転する円アニメーション
        p.push()
        p.translate(p.width / 2, p.height / 2)

        // 背景円
        p.noFill()
        p.stroke(60, 60, 80)
        p.strokeWeight(20)
        p.circle(0, 0, 600)

        // 進捗円
        p.noFill()
        p.stroke(fillColor)
        p.strokeWeight(20)
        p.arc(0, 0, 600, 600, -p.HALF_PI, -p.HALF_PI + p.TWO_PI * progress)

        // 回転する装飾
        const rotationSpeed = p.frameCount * 0.02
        for (let i = 0; i < 12; i++) {
          const angle = (p.TWO_PI / 12) * i + rotationSpeed
          const x = p.cos(angle) * 320
          const y = p.sin(angle) * 320
          p.fill(fillColor)
          p.noStroke()
          p.circle(x, y, 15 * (1 + p.sin(p.frameCount * 0.1 + i) * 0.3))
        }

        // パルス効果
        const pulseSize = 250 + p.sin(p.frameCount * 0.1) * 20
        p.fill(fillColor)
        p.noStroke()
        for (let i = 0; i < 3; i++) {
          const alpha = p.map(i, 0, 3, 100, 20)
          const size = pulseSize + i * 30
          p.fill(p.red(fillColor), p.green(fillColor), p.blue(fillColor), alpha)
          p.circle(0, 0, size)
        }

        p.pop()

        // 残り時間表示
        const minutes = Math.floor(Math.abs(currentRemaining) / 60)
        const seconds = Math.abs(currentRemaining) % 60
        const sign = currentRemaining < 0 ? '-' : ''
        const timeText = `${sign}${minutes}:${seconds.toString().padStart(2, '0')}`

        p.fill(255)
        p.noStroke()
        p.textAlign(p.CENTER, p.CENTER)
        p.textSize(120)
        p.textStyle(p.BOLD)
        p.text(timeText, p.width / 2, p.height / 2)
      }
    }

    p5Instance.current = new p5(sketch, canvasRef.current)

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove()
        p5Instance.current = null
      }
    }
  }, [totalMinutes])

  return (
    <div className="timer-container">
      <button className="reset-button" onClick={onReset} title="選択画面に戻る">
        <IoArrowBack />
      </button>
      <div ref={canvasRef} className="canvas-container"></div>
    </div>
  )
}

export default Timer
