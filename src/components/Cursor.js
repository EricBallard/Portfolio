import { useEffect, useState } from 'react'

// Style
import '../styles/cursor.css'

// Custom event for managing scene tilt aka perspective transform
const tiltEvent = new CustomEvent('tilt-scene', {
  bubbles: true,
  cancelable: true,
  composed: false,
  detail: { value: 0 },
})

// Component
const Cursor = ({ isTouchDevice }) => {
  // Mouse states
  const [currentX, setX] = useState(window.innerWidth/ 2)
  const [currentY, setY] = useState(window.innerHeight / 2)

  const [isMoving, setMoving] = useState(false)
  const [hideCursor, setHide] = useState(true)

  // ComponentDidMount
  useEffect(() => {
    let timeoutID = undefined,
      cell = undefined

    const w = window.innerWidth,
      cellW = w / 9

    const handler = e => {
      e.preventDefault()

      // Cancel and pending timeout (sets moving mouse to false)
      if (timeoutID) clearTimeout(timeoutID)
      else setMoving(true)

      // Update position
      let x, y

      if (isTouchDevice) {
        const touch = e.touches[0]

        if (touch) {
          x = touch.clientX
          y = touch.clientY
        }
      } else {
        x = e.pageX
        y = e.pageY
      }

      setX(x)
      setY(y)

      // Show cursor (if needed - touch device only)
      if (hideCursor) setHide(false)

      // // Update scene tilt
      // const currentCell = Math.floor(x / cellW)

      // if (cell !== currentCell) {
      //   // Moved to new cell
      //   cell = currentCell

      //   // Dispatch event to relay to three component
      //   tiltEvent.detail.value = cell
      //   window.dispatchEvent(tiltEvent)
      // }

      // Schedule timeout - Set no longer moving cursor
      timeoutID = setTimeout(() => {
        timeoutID = undefined
        setMoving(false)

        // Schedule cursor to disappear (touch device only)
        if (isTouchDevice) timeoutID = setTimeout(() => setHide(true), 500)
      }, 500)
    }

    // Register listeners
    window.addEventListener(isTouchDevice ? 'touchmove' : 'mousemove', handler, { passive: false })

    // ComponentWillUnmount
    return () => {
      // Unregister listener
      window.addEventListener(isTouchDevice ? 'touchmove' : 'mousemove', handler)
    }

    // Dependencies
  }, [isTouchDevice, isMoving, hideCursor, setHide, setMoving, setX, setY])

  // Return JSX
  return (
    <div>
      {/* Rotating semi-circle + Trailing dot */}
      <div
        className={'cursor-trail' + (hideCursor ? ' hide' : isMoving ? ' moving' : '')}
        style={{ left: currentX - 7, top: currentY - 7, animation: 'rotate 5s infinite linear' }}
      />

      {/* Circle border */}
      <div
        className={'cursor' + (hideCursor ? ' hide' : isTouchDevice && isMoving ? ' moving' : '')}
        style={{ left: currentX, top: currentY }}
      >
        {/* Center dot */}
        <div className={'cursor-center' + (isMoving ? (isTouchDevice ? ' hide' : ' moving') : '')} />
      </div>
    </div>
  )
}

// Expose
export default Cursor
