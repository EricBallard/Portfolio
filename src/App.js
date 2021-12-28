import { useRef, useState } from 'react'

// Children components
import LoadAnim from './components/LoadAnim'
import Cursor from './components/Cursor'
import Scene from './components/Scene'

// Parent Component
const App = () => {
  // Refrences
  const canvasRef = useRef(null)

  // Check for touch capability
  const [isTouchDevice] = useState(
    'ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
  )

  // Return JSX, populated with children components
  return (
    <div className='app' >
      {/* Custom cursor with, animated in CSS */}
      <Cursor {...{ isTouchDevice }} />

      {/* Create canvas and bind refrence */}
      <canvas ref={canvasRef} className='canvas' />

      {/* Render components and pass refrence to canvas */}

      {/* 2D canvas animation  */}
      <LoadAnim {...{ canvasRef }} />

      {/* Webgl 3D scene - Used to apply 'perspective transform'
        to animation by using 2D ctx as texture on a plane */}
      <Scene {...{ canvasRef, isTouchDevice }} />
    </div>
  )
}

// Expose
export default App
