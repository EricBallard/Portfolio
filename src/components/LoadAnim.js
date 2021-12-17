import { useEffect } from 'react'

// Animation data
const desiredFPS = 60,
  renderInterval = 1000 / desiredFPS

let animStage = 1,
  lastRender = -1,
  animSpeed = 0.075

let indicators = []

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

// Canvas dimensions and offsets for centered circular motion
let cWidth = undefined,
  cHeight = undefined,
  xOffset = undefined,
  yOffset = undefined

CanvasRenderingContext2D.prototype.roundRect = function (
  x,
  y,
  width,
  height,
  radius,
  fill,
  stroke
) {
  if (typeof stroke == 'undefined') {
    stroke = true
  }
  if (typeof radius === 'undefined') {
    radius = 5
  }
  this.beginPath()
  this.moveTo(x + radius, y)
  this.lineTo(x + width - radius, y)
  this.quadraticCurveTo(x + width, y, x + width, y + radius)
  this.lineTo(x + width, y + height - radius)
  this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  this.lineTo(x + radius, y + height)
  this.quadraticCurveTo(x, y + height, x, y + height - radius)
  this.lineTo(x, y + radius)
  this.quadraticCurveTo(x, y, x + radius, y)
  this.closePath()
  if (stroke) {
    this.stroke()
  }
  if (fill) {
    this.fill()
  }
}

const draw = ctx => {
  // Clear canvas
  ctx.fillStyle = '#454545'
  ctx.fillRect(0, 0, cWidth, cHeight)

  /** DEBUG */
  // ctx.strokeStyle = 'green'
  // ctx.lineWidth = 10;
  // ctx.strokeRect(2, 0, cWidth, cHeight)

  // Set draw color
  ctx.fillStyle = 'white'

  // STAGE 2 - Draw loading bar
  if (animStage === 2) {
    ctx.roundRect(xOffset - 100, yOffset - 15, 200, 30, true, true)
  }

  // STAGE 1 - Draw dots aka indicators
  for (let index = 0; index < 5; index++) {
    const i = indicators[index]

    if (i === null) continue

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
      i.x = xOffset + 400 * Math.cos(animSpeed * i.step)
      i.y = yOffset + 400 * Math.sin(animSpeed * i.step)

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
        // Set to null so we're not drawing 2 extra cirlces every frame
        indicators[3] = null
        indicators[4] = null
        animStage++
      }
    }
  }
}

const animate = ctx => {
  // Handles drawing graphic in a timely manner
  const now = Date.now()

  if (!lastRender || now - lastRender >= renderInterval) {
    lastRender = now
    draw(ctx)
  }

  // Animation loop
  requestAnimationFrame(() => animate(ctx))
}

// Component
const LoadAnim = ({ canvasRef }) => {
  // UseEffect hook, runs on componentDidMount and/or if dependency is updated
  useEffect(() => {
    // Cache current refrence and canvas context
    const canvas = canvasRef.current,
      ctx = canvas.getContext('2d')

    // Size to window dimensions
    canvas.width = 2048 //window.innerWidth
    canvas.height = 2048 //window.innerHeight

    cWidth = canvas.width
    cHeight = canvas.height

    xOffset = cWidth / 2
    yOffset = cHeight / 2

    // Init indicators - X, Y, STEP, DELAY, INVERT, BACKTRACK
    indicators[0] = new Indicator(xOffset, yOffset, 0, false, false) // Center
    indicators[0].freeze = true

    indicators[1] = new Indicator(xOffset, yOffset, 63, 0, false, false)
    indicators[2] = new Indicator(xOffset, yOffset, 21, 0, true, false)

    indicators[3] = new Indicator(xOffset, yOffset, 63, 0, false, true)
    indicators[4] = new Indicator(xOffset, yOffset, 21, 0, true, true)

    // Start animation
    animate(ctx)
  })

  // JSX
  return null
}

export default LoadAnim
