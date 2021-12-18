import { useEffect, useState } from 'react'

// Style
import '../styles/cursor.css'

// Component
const Cursor = () => {
  // Mouse states
  const [currentX, setX] = useState(0)
  const [currentY, setY] = useState(0)

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
      const x = e.pageX,
        y = e.pageY

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
    window.addEventListener('mousemove', handler, false)

    // ComponentWillUnmount
    return () => {
      // Unregister listener
      window.removeEventListener('mousemove', handler)
    }

    // Dependencies
  }, [setMoving, setX, setY])

  // Return JSX
  return (
    <div>
      {/* Cursor */}
      <div className='cursor' style={{ left: currentX, top: currentY }} />
      <div
        className={isMoving ? 'cursor-child-moving' : 'cursor-child'}
        style={{ left: currentX - 7, top: currentY - 7, animation: 'rotate 5s infinite linear' }}
      />
      <div
        className={isMoving ? 'cursor-trail-moving' : 'cursor-trail'}
        style={{ left: currentX, top: currentY }}
      />
    </div>
  )
}

// Expose
export default Cursor
