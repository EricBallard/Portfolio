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

function Indicator(x, y, step, delay, invert, backwards) {
  this.freeze = false
  this.risen = false
  this.x = x
  this.y = y
  this.step = step
  this.delay = delay
  this.invert = invert
  this.backwards = backwards
}

CanvasRenderingContext2D.prototype.roundRect = function (color, leftX, leftY, rightX, rightY, radius, inset) {
  this.strokeStyle = color
  this.fillStyle = color

  // Draw
  this.beginPath()

  // Draw center
  this.moveTo(leftX, leftY)
  this.lineTo(rightX, rightY)
  this.stroke()

  // Use cirlces to draw rounded edges
  this.arc(leftX + (inset ? radius : 0), leftY, radius, 0, 2 * Math.PI)
  this.fill()

  this.arc(rightX - (inset ? radius : 0), rightY, radius, 0, 2 * Math.PI)
  this.fill()

  this.closePath()
}

// Component
const LoadAnim = ({ canvasRef, setLoading }) => {
  // UseEffect hook, runs on componentDidMount and/or if dependency is updated
  useEffect(() => {
    // Animation data
    let animStage = 1,
      lastRender = -1,
      // Used for stage 2/3
      loadDelay = 0,
      loadProg = 0

    let indicators = []

    // Cache current refrence and canvas context
    const canvas = canvasRef.current,
      ctx = canvas.getContext('2d')

    // This canvas is to be used as a texture, we'll preset it as 2k for a high quality amongst all devices
    canvas.width = 2048
    canvas.height = 2048

    // Canvas dimensions and offsets for centered circular motion
    let cWidth = canvas.width,
      cHeight = canvas.height,
      xOffset = cWidth / 2,
      yOffset = cHeight / 2

    // Init indicators - X, Y, STEP, DELAY, INVERT, BACKTRACK
    indicators[0] = new Indicator(xOffset, yOffset, 0, false, false) // Center
    indicators[0].freeze = true

    indicators[1] = new Indicator(xOffset, yOffset, 63, 0, false, false)
    indicators[2] = new Indicator(xOffset, yOffset, 21, 0, true, false)

    indicators[3] = new Indicator(xOffset, yOffset, 63, 0, false, true)
    indicators[4] = new Indicator(xOffset, yOffset, 21, 0, true, true)

    const animate = () => {
      if (animStage === 5) return

      // Clear canvas
      ctx.fillStyle = '#454545'
      ctx.fillRect(0, 0, cWidth, cHeight)

      // Set draw color
      ctx.lineWidth = 120
      ctx.fillStyle = 'white'
      ctx.strokeStyle = 'white'

      let right = indicators[3],
        left = indicators[4]

      switch (animStage) {
        case 4:
          loadProg += 100
          ctx.lineWidth = loadProg
          ctx.roundRect('black', left.x - loadProg / Math.PI, left.y, right.x + loadProg / Math.PI, right.y, 60, true)

          if (loadProg >= 3000) {
            setLoading(false)
            animStage++
          }
          return
        case 3:
          // Bar
          ctx.roundRect('white', left.x, left.y, right.x, right.y, 60)

          if (loadDelay < 60) loadDelay += 10
          else loadProg += 20

          let loadLeft = left.x - (60 - loadDelay),
            loadRight = loadDelay === 60 ? loadLeft + loadProg : loadLeft

          // Stop at end
          if (loadRight >= right.x) {
            loadRight = right.x
            loadProg = 0
            animStage++
          }

          // Progress
          ctx.roundRect('black', loadLeft, left.y, loadRight, right.y, loadDelay)
          return
        default:
          break
      }

      // Stage 1+2
      for (let index = 0; index < 5; index++) {
        const i = indicators[index]

        if (i === null) continue

        // STAGE 2 - Draw loading bar
        if (index >= 3 && animStage >= 2) {
          // Honor freeze in place or progress in step
          if (!i.freeze) i.step += 30

          // Center bar
          if (index === 3) {
            let center = indicators[0]
            loadProg += 10

            ctx.roundRect('white', center.x - loadProg, center.y, indicators[0].x + loadProg, indicators[0].y, 60)

            // Stop at end
            if (center.x - loadProg <= indicators[4].x) {
              loadProg = 0
              animStage++
            }
          }

          // Draw line with progresing width as step
          ctx.save()
          ctx.beginPath()

          // Outer border
          let borderY = i.y + (i.backwards ? -55 : 55)
          ctx.moveTo(i.x, borderY)
          ctx.stroke()

          ctx.lineWidth = 10
          ctx.lineTo(i.x + (i.backwards ? -i.step : i.step), borderY)

          let targetDif = i.backwards ? i.x - indicators[4].x : indicators[3].x - i.x

          // Stop at adjacent dot x
          if (i.step >= targetDif) {
            i.step = targetDif
            i.freeze = true
          }

          ctx.stroke()
          ctx.restore()
          continue
        }

        // STAGE 1 - Draw rotating dots

        // Save context
        ctx.save()

        // Draw
        ctx.beginPath()

        // X, y, radius, start angle, end angle
        ctx.arc(i.x, i.y, 60, 0, 2 * Math.PI)
        ctx.fill()
        ctx.closePath()

        // Restore context
        ctx.restore()

        if (i.freeze) continue

        // Dots must first "rise" up/down before circular motion
        if (!i.risen) {
          // Delay
          if (i.delay > 0) {
            i.delay--
            console.log(index + ' | delay: ' + i.delay)
            continue
          }

          // De/Ascend
          let desiredY = cHeight / 2 + 400

          if (i.invert) {
            i.y += 10

            if (i.y >= desiredY) i.risen = true
          } else {
            i.y -= 10

            if (i.y <= cHeight - desiredY) i.risen = true
          }
        } else {
          // Ciruclar motion
          i.x = xOffset + 400 * Math.cos(0.075 * i.step)
          i.y = yOffset + 400 * Math.sin(0.075 * i.step)

          if (i.backwards) i.step--
          else i.step++

          // Done
          if (index === 2 && i.step === 43) {
            //Freeze and set end finite position
            indicators[1].freeze = true
            indicators[1].x = xOffset + 400
            indicators[1].y = yOffset

            i.freeze = true
            i.x = xOffset - 400
            i.y = yOffset
          }

          if (index === 4 && i.step === -1) {
            const left = indicators[1],
              right = indicators[2]

            // Set to null so we're not drawing 2 extra cirlces every frame
            // Additionally we'll re-purpose these to be lines

            indicators[3] = new Indicator(left.x, left.y, 0, 0, true, true)
            indicators[4] = new Indicator(right.x, right.y, 0, 0, false, false)
            animStage++
          }
        }
      }
    }

    let animationID = undefined

    const render = () => {
      // Handles drawing graphic in a timely manner
      const now = Date.now()

      if (!lastRender || now - lastRender >= renderInterval) {
        lastRender = now
        animate()
      }

      // Animation loop
      animationID = requestAnimationFrame(() => render())
    }

    // Start animation
    render()

    // ComponentWillUnmount
    return () => cancelAnimationFrame(animationID)
    // Dependencies
  }, [canvasRef, setLoading])

  // JSX
  return null
}

export default LoadAnim
