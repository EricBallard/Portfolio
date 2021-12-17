import { useRef } from 'react'

// Children components
import LoadAnim from './components/LoadAnim'
import Scene from './components/Scene'

// Parent Component
const App = () => {
  // Refrences
  const canvasRef = useRef(null)

  // Return JSX, populated with children components
  return (
    <div className='app'>
      {/* Create canvas and bind refrence */}
      <canvas ref={canvasRef} className='canvas' />

      {/* Render components and pass refrence to canvas */}
      <LoadAnim {...{ canvasRef }} />
      <Scene {...{ canvasRef }} />
    </div>
  )
}

// Expose
export default App
