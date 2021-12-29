import { useEffect } from 'react'

/**
 *
 * Animation is pure js broken down into 'stages' as follows;
 *
 * 1) Spinning dots
 * 2) Form into bar
 * 3) Load bar progress
 * 4) Form into window
 */

// Constants
const desiredFPS = 60,
  renderInterval = 1000 / desiredFPS

// Component
const IntroAnim = ({ canvasRef }) => {
  //ComponentDidMount
  useEffect(() => {
    // Cache current refrence and canvas context
    const canvas = canvasRef.current,
      ctx = canvas.getContext('2d')

    let cWidth = canvas.width,
      cHeight = canvas.height

    // Animation
    let animID = -1,
      // animStage = 1,
      lastRender = -1

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, cWidth, cHeight)

      // Draw top 'window bar'
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, 2048, 100)

      // 'Window title'
      ctx.fillStyle = 'black'
      ctx.font = '100px Verdana Bold'

      ctx.fillText('Terminal', 1024 - 180, 85)

      // 'Window controls'
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 15

      ctx.beginPath()

      // Draw horizontal line
      ctx.moveTo(1675, 50)
      ctx.lineTo(1750, 50)

      // Draw left half of X
      ctx.moveTo(1900, 25)
      ctx.lineTo(1950, 75)

      // Draw right half of X
      ctx.moveTo(1950, 25)
      ctx.lineTo(1900, 75)

      ctx.stroke()
    }

    // Render loop
    const render = () => {
      // Handles drawing graphic in a timely manner
      const now = Date.now()

      if (!lastRender || now - lastRender >= renderInterval) {
        lastRender = now
        animate()
      }

      // Animation loop
      animID = requestAnimationFrame(() => render())
    }

    render()

    // ComponentWillUnmount
    return () => cancelAnimationFrame(animID)

    // Dependencies
  }, [canvasRef])

  // Return JSX
  return null
}

// Expose
export default IntroAnim
