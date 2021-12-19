import { useEffect, useState } from 'react'

// Style
import '../styles/cursor.css'

// Component
const Cursor = ({ isTouchDevice }) => {
  // Mouse states
  const [currentX, setX] = useState(-20)
  const [currentY, setY] = useState(-20)

  const [isMoving, setMoving] = useState(false)

  // ComponentDidMount
  useEffect(() => {
    // Perspective transform handler
    let timeoutID = undefined

    const handler = e => {
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

      // Update scene tilt
      // const halfWidth = window.innerWidth / 2,
      //   tilt = (x > halfWidth ? x - halfWidth : x) / halfWidth

      // if (x < halfWidth) {
      //   // Tilt left (inversed)
      //   plane.rotation.y = 1 - tilt
      // } else {
      //   // Tilt right
      //   plane.rotation.y = tilt - tilt * 2
      // }

      // Schedule timeout - Set no longer moving mouse
      timeoutID = setTimeout(() => {
        timeoutID = undefined
        setMoving(false)
      }, 100)
    }

    // Register listener
    window.addEventListener(isTouchDevice ? 'touchmove' : 'mousemove', handler, false)

    // ComponentWillUnmount
    return () => {
      // Unregister listener
      window.removeEventListener(isTouchDevice ? 'touchmove' : 'mousemove', handler)
    }

    // Dependencies
  }, [isTouchDevice, setMoving, setX, setY])

  // Return JSX
  return (
    <div>
      {/* Cursor */}
      <div
        className={'cursor' + (isTouchDevice && isMoving ? ' moving' : '')}
        style={{ left: currentX, top: currentY }}
      />

      {/* Rotating semi-circle + Trailing dot */}
      <div
        className={'cursor-trail' + (isMoving && !isTouchDevice ? ' moving' : '')}
        style={{ left: currentX - 7, top: currentY - 7, animation: 'rotate 5s infinite linear' }}
      />

      {/* Center dot */}
      <div className={'cursor-center' + (isMoving ? ' moving' : '')} style={{ left: currentX, top: currentY }} />
    </div>
  )
}

// Expose
export default Cursor
