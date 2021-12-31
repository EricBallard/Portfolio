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

// Show Toolbar
const showToolbar = (ctx, height) => {
  // Draw top 'window bar'
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, 2048, height)

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
  return height > 99
}

// Print Text
const typeText = (ctx, prog, data, showCursor) => {
  let text

  for (let i = 0; i < prog; i++) {
    let char = data[i]
    text = !text ? char : text + char
  }

  if (!text) return

  ctx.fillStyle = 'white'
  ctx.fillText('~: ' + text + (showCursor ? '|' : ''), 256, 256)

  return prog === data.length
}

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
      animStage = 0,
      lastRender = -1,
      barHeight = 0

    // Terminal cursor
    let blinks = 0,
      showCursor = true,
      cursorTime = undefined

    let typeProg = undefined,
      shouldType = false,
      typeData = []

    // Animation stages
    const animate = () => {
      switch (animStage) {
        case 3:
          return
        case 2:
          // Clear canvas
          ctx.fillStyle = 'black'
          ctx.fillRect(0, barHeight, cWidth, cHeight - barHeight)

          // Type
          if (typeText(ctx, typeProg, typeData, showCursor, shouldType)) animStage++
          else if (shouldType) typeProg++
          return
        case 1:
          // Clear canvas
          ctx.fillStyle = 'black'
          ctx.fillRect(0, barHeight, cWidth, cHeight - barHeight)

          ctx.fillStyle = 'white'
          ctx.fillText('~: ' + (showCursor ? '|' : ''), 256, 256)

          if (blinks > 4) {
            animStage++
            typeProg = 0
            typeData = 'Hello World!'.split('')
          }
          return
        default:
          // Clear canvas
          ctx.fillStyle = 'black'
          ctx.fillRect(0, 0, cWidth, cHeight)

          // Draw 'window controls'
          if (showToolbar(ctx, barHeight)) animStage++
          else barHeight += 5
          break
      }
    }

    // Render loop
    const render = () => {
      // Handles drawing graphic in a timely manner
      const now = Date.now()

      if (!lastRender || now - lastRender >= renderInterval) {
        // Blink cursor
        if (!cursorTime || now - cursorTime > 500) {
          shouldType = Math.random() < 0.1
          showCursor = !showCursor
          cursorTime = now
          blinks++
        }

        lastRender = now
        animate(now)
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
