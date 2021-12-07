import React, { useEffect, useRef } from 'react'
import '../styles/LoadAnim.css'

// Animation data
const desiredFPS = 60,
  renderInterval = 1000 / desiredFPS

let playAnimation = true,
  lastRender = undefined

let cWidth = undefined,
  cHeight = undefined

function Indicator(x, y) {
  this.x = x
  this.y = y
  this.angle = 0
  this.angle2 = 0
  this.velocity = 0
}


let angle = 0

let indicators = []

var step = 0


const draw = ctx => {
  // Clear canvas
  ctx.clearRect(0, 0, cWidth, cHeight)

  // Set draw color
  ctx.fillStyle = 'white'

  // Draw indicators
  indicators.forEach(i => {
    // Save context
    ctx.save()

    ctx.beginPath()
    // X, y, radius, start angle, end angle
    ctx.arc(cWidth / 2, cHeight / 2, radius, 0, 2 * Math.PI)
    ctx.fill()
    ctx.closePath()


    // Draw
    ctx.beginPath()
    // X, y, radius, start angle, end angle
    ctx.arc(i.x, i.y, radius, 0, 2 * Math.PI)
    ctx.fill()
    ctx.closePath()

    // Restore context
    ctx.restore()
      // increase the angle of rotation
      i.x = (cWidth / 2) + 50 * Math.cos(0.075 * step)
      i.y = (cHeight / 2) + 50 * Math.sin(0.075 * step)
      ++step;

  })

  console.log('rendered indicators!')
}

const animate = ctx => {
  // Handles drawing graphic in a timely manner
  const now =  Date.now()

  if (!lastRender || now - lastRender >= renderInterval) {
    lastRender = now
    draw(ctx)
  }

  // Animation loop
  requestAnimationFrame(() => animate(ctx))
}

// Constants
const radius = 15

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

      // Init indicators
      for (let i = 0; i < 1; i++) {
        indicators[i] = new Indicator(cWidth / 2, cHeight / 2)
        indicators[i] = new Indicator(cWidth / 2, cHeight / 2)
      }

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
