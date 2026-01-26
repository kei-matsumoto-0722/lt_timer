import { useState } from 'react'
import './App.css'
import Timer from './components/Timer'
import { play1MinAlarm, playTimeUpAlarm, playExplosion } from './utils/sounds'

function App() {
  const [selectedTime, setSelectedTime] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const handleTimeSelect = (minutes: number) => {
    setSelectedTime(minutes)
    setIsRunning(true)
  }

  const handleReset = () => {
    setIsRunning(false)
    setSelectedTime(null)
  }

  return (
    <div className="app">
      {!isRunning ? (
        <div className="time-selector">
          <h1>LT Timer</h1>
          <div className="button-group">
            <button
              className="time-button"
              onClick={() => handleTimeSelect(2)}
            >
              2分
            </button>
            <button
              className="time-button"
              onClick={() => handleTimeSelect(5)}
            >
              5分
            </button>
          </div>
          <div className="sound-preview">
            <h3>音のプレビュー</h3>
            <div className="preview-buttons">
              <button
                className="preview-button"
                onClick={play1MinAlarm}
                title="残り1分アラーム"
              >
                1:00
              </button>
              <button
                className="preview-button"
                onClick={playTimeUpAlarm}
                title="時間終了アラーム（ピピピピッ）"
              >
                0:00
              </button>
              <button
                className="preview-button explosion"
                onClick={playExplosion}
                title="最終アラーム（ドカーン！）"
              >
                -0:30
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Timer
          totalMinutes={selectedTime!}
          onComplete={handleReset}
          onReset={handleReset}
        />
      )}
    </div>
  )
}

export default App
