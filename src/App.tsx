import { useState, useEffect, useRef } from 'react'
import './App.css'
import Timer from './components/Timer'
import { play1MinAlarm, playTimeUpAlarm, playExplosion, initAudioContext, playShuffleComplete } from './utils/sounds'

function App() {
  const [selectedTime, setSelectedTime] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [presenterInput, setPresenterInput] = useState('')
  const [shuffledList, setShuffledList] = useState<string[]>([])
  const [currentPresenterIndex, setCurrentPresenterIndex] = useState(0)
  const [isShuffling, setIsShuffling] = useState(false)
  const [tempShuffledList, setTempShuffledList] = useState<string[]>([])
  const [isInputCollapsed, setIsInputCollapsed] = useState(false)
  const shuffleIntervalRef = useRef<number | null>(null)

  const handleTimeSelect = (minutes: number) => {
    // タイマー開始時にAudioContextを初期化
    initAudioContext()
    setSelectedTime(minutes)
    setIsRunning(true)
  }

  const handleReset = () => {
    setIsRunning(false)
    setSelectedTime(null)
  }

  const handleStartShuffle = () => {
    const names = presenterInput
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0)

    if (names.length === 0) {
      alert('発表者を入力してください')
      return
    }

    initAudioContext()
    setIsShuffling(true)
    setTempShuffledList(names)

    // 高速でシャッフルアニメーション
    shuffleIntervalRef.current = window.setInterval(() => {
      const shuffled = [...names].sort(() => Math.random() - 0.5)
      setTempShuffledList(shuffled)
    }, 100) // 100msごとにシャッフル
  }

  const handleStopShuffle = () => {
    if (shuffleIntervalRef.current) {
      clearInterval(shuffleIntervalRef.current)
      shuffleIntervalRef.current = null
    }
    setIsShuffling(false)

    // イカサマ: 最初に書いた人を最後に持ってくる
    const names = presenterInput
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0)

    if (names.length > 0) {
      const firstPerson = names[0]
      const shuffled = tempShuffledList.filter(name => name !== firstPerson)
      shuffled.push(firstPerson)
      setShuffledList(shuffled)
    } else {
      setShuffledList(tempShuffledList)
    }

    setCurrentPresenterIndex(0)
    setIsInputCollapsed(true)
    playShuffleComplete()
  }

  const handleResetShuffle = () => {
    if (window.confirm('シャッフル結果をリセットしますか？')) {
      setShuffledList([])
      setIsInputCollapsed(false)
      setCurrentPresenterIndex(0)
    }
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current)
      }
    }
  }, [])

  const handleNextPresenter = () => {
    if (currentPresenterIndex < shuffledList.length - 1) {
      setCurrentPresenterIndex(currentPresenterIndex + 1)
    }
  }

  const handlePrevPresenter = () => {
    if (currentPresenterIndex > 0) {
      setCurrentPresenterIndex(currentPresenterIndex - 1)
    }
  }

  return (
    <div className="app">
      {!isRunning ? (
        <div className="time-selector">
          <h1>LT Timer</h1>

          <div className="presenter-section">
            {!isInputCollapsed && (
              <>
                <h3>発表者シャッフル</h3>
                <textarea
                  className="presenter-input"
                  value={presenterInput}
                  onChange={(e) => setPresenterInput(e.target.value)}
                  placeholder="山田太郎&#10;佐藤花子&#10;鈴木一郎"
                  rows={5}
                />
                {!isShuffling ? (
                  <button
                    className="shuffle-button"
                    onClick={handleStartShuffle}
                    disabled={presenterInput.trim().length === 0}
                  >
                    シャッフル
                  </button>
                ) : (
                  <button
                    className="shuffle-button decide"
                    onClick={handleStopShuffle}
                  >
                    決定
                  </button>
                )}
              </>
            )}

            {(shuffledList.length > 0 || isShuffling) && (
              <div className="shuffle-result">
                <div className="shuffle-result-header">
                  <h4>{isShuffling ? 'シャッフル中...' : 'シャッフル結果'}</h4>
                  {isInputCollapsed && (
                    <button
                      className="reset-shuffle-button"
                      onClick={handleResetShuffle}
                      title="シャッフルをリセット"
                    >
                      ×
                    </button>
                  )}
                </div>
                <ol className="presenter-list">
                  {(isShuffling ? tempShuffledList : shuffledList).map((name, index) => (
                    <li
                      key={index}
                      className={!isShuffling && index === currentPresenterIndex ? 'current' : ''}
                    >
                      {name}
                    </li>
                  ))}
                </ol>
                {!isShuffling && (
                  <div className="presenter-controls">
                  <button
                    className="prev-presenter-button"
                    onClick={handlePrevPresenter}
                    disabled={currentPresenterIndex === 0}
                  >
                    ← 前の人へ
                  </button>
                  <span className="presenter-counter">
                    {currentPresenterIndex + 1} / {shuffledList.length}
                  </span>
                  <button
                    className="next-presenter-button"
                    onClick={handleNextPresenter}
                    disabled={currentPresenterIndex >= shuffledList.length - 1}
                  >
                    次の人へ →
                  </button>
                </div>
                )}
              </div>
            )}
          </div>

          <div className="divider">タイマー</div>

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
          shuffledList={shuffledList}
          currentPresenterIndex={currentPresenterIndex}
        />
      )}
    </div>
  )
}

export default App
