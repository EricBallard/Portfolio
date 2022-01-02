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

  ctx.fillStyle = 'white'
  ctx.fillText('~: ' + (text ? text : '') + (showCursor ? '|' : ''), 256, 256)

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
      typeTime = undefined,
      reverseTyping = false,
      doneTyping = false,
      shouldType = false,
      typeData = []

    // Animation stages
    const animate = () => {
      switch (animStage) {
        case 4:
          // Clear canvas
          ctx.fillStyle = 'black'
          ctx.fillRect(0, barHeight + 256, cWidth, cHeight - barHeight - 256)

          ctx.fillStyle = 'white'
          ctx.fillText('ericballard', 256, 512)
          ctx.fillText('~: ' + (showCursor ? '|' : ''), 256, 768)
          return
        case 3:
          // Clear canvas
          ctx.fillStyle = 'black'
          ctx.fillRect(0, barHeight, cWidth, cHeight - barHeight)

          // Type a
          if (typeText(ctx, typeProg, typeData, showCursor, shouldType)) {
            animStage++
          } else if (shouldType) {
            shouldType = false

            // Progress typing - check if finished
            if (typeProg++ === typeData.length) {
              blinks = 0
            }
          }
          return
        case 2:
          // Clear canvas
          ctx.fillStyle = 'black'
          ctx.fillRect(0, barHeight, cWidth, cHeight - barHeight)

          // Finished typing desired word
          if (typeText(ctx, typeProg, typeData, showCursor, shouldType)) {
            if (doneTyping) {
              // Let cursor blink and than init backspace
              if (blinks > 4) {
                reverseTyping = true
                typeProg--
              }
            } else {
              // Reset blink counter
              doneTyping = true
              blinks = 0
            }
            // In progress of typing
          } else if (shouldType) {
            shouldType = false

            // Reverse type progress (backspace) - check if finished, prog anim
            if (reverseTyping) {
              if (typeProg-- === 0) {
                typeData = 'whoami'.split('')
                typeProg = 0
                animStage++
              }
              // Progress typing - check if finished
            } else if (typeProg++ === typeData.length) {
              blinks = 0
            }
          }
          return
        case 1:
          // Clear canvas
          ctx.fillStyle = 'black'
          ctx.fillRect(0, barHeight, cWidth, cHeight - barHeight)

          ctx.fillStyle = 'white'
          ctx.fillText('~: ' + (showCursor ? '|' : ''), 256, 256)

          // Allow cursor to blink, init typing data
          if (blinks > 4) {
            typeProg = 0
            animStage++
            typeData = 'Hello World'.split('')
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
          showCursor = !showCursor
          cursorTime = now

          blinks++
        }

        // Type
        if (!typeTime) {
          typeTime = now
        } else if (now - typeTime > Math.floor(Math.random() * 200) + 200) {
          shouldType = true
          typeTime = now
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
