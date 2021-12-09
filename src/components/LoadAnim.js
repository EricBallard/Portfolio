import React, { useEffect, useRef } from 'react'
import '../styles/LoadAnim.css'

// Animation data
const desiredFPS = 60,
  renderInterval = 1000 / desiredFPS

let playAnimation = true,
  lastRender = undefined,
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

const draw = ctx => {
  // Clear canvas
  ctx.clearRect(0, 0, cWidth, cHeight)

  // Set draw color
  ctx.fillStyle = 'white'

  // Draw indicators
  for (let index = 0; index < 5; index++) {
    const i = indicators[index]

    // Save context
    ctx.save()

    // Draw
    ctx.beginPath()

    // X, y, radius, start angle, end angle
    ctx.arc(i.x, i.y, 15, 0, 2 * Math.PI)
    ctx.fill()
    ctx.closePath()

    // Restore context
    ctx.restore()

    if (i.freeze) continue

    // Dots must first "rise" up before circular motion
    if (!i.risen) {
      // Delay
      if (i.delay > 0) {
        i.delay--
        console.log(index + ' | delay: ' + i.delay)
        continue
      }

      // De/Ascend
      let desiredY = cHeight / 2 + 100

      if (i.invert) {
        i.y += 2

        if (i.y >= desiredY) i.risen = true
      } else {
        i.y -= 2

        if (i.y <= cHeight - desiredY) i.risen = true
      }
    } else {
      // Ciruclar motion
      i.x = xOffset + 100 * Math.cos(animSpeed * i.step)
      i.y = yOffset + 100 * Math.sin(animSpeed * i.step)

      if (i.backwards) i.step--
      else i.step++

      // 1 full lap
      if (index === 2 && i.step === 43) {
        indicators[1].freeze = true
        i.freeze = true
      }

      console.log(index + ' Step ' + i.step)

      if (index === 4 && i.step === -1) {
        indicators[3].freeze = true
        i.freeze = true
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
function LoadAnim() {
  // Create refrence to canvas, as defined in JSX
  const canvas = useRef(null)
  const ctx = useRef(null)

  // UseEffect hook, runs on componentDidMount and/or if dependency is updated
  useEffect(() => {
    if (canvas.current) {
      // Get graphics context
      ctx.current = canvas.current.getContext('2d')

      cWidth = canvas.current.width
      cHeight = canvas.current.height

      xOffset = cWidth / 2
      yOffset = cHeight / 2

      // Init indicators - X, Y, STEP, DELAY, INVERT, BACKTRACK
      indicators[0] = new Indicator(xOffset, yOffset, 0, false, false) // Center
      indicators[0].freeze = true

      indicators[1] = new Indicator(xOffset, yOffset, 63, 0, false, false)
      indicators[2] = new Indicator(xOffset, yOffset, 21, 0, true, false)

      indicators[3] = new Indicator(xOffset, yOffset, 63, 21, false, true)
      indicators[4] = new Indicator(xOffset, yOffset, 21, 21, true, true)

      // Start animation
      animate(ctx.current)
    }
  }, [canvas])

  // JSX
  return (
    // Define canvas with refrence
    <div>
      <canvas
        className='canvas'
        ref={canvas}
        width={window.innerWidth / 2}
        height={window.innerHeight / 2}
      />
    </div>
  )
}

export default LoadAnim
