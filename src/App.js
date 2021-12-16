import { useRef } from 'react'

// Components
import LoadAnim from './components/LoadAnim'
import Scene from './components/Scene'

const App = () => {
  // Refrences
  const canvasRef = useRef(null)

  return (
    <div>
      {/* Create canvas and bind refrence */}
      <canvas ref={canvasRef} className='canvas' />

      {/* Render components and pass refrence to canvas */}
      <LoadAnim {...{ canvasRef }} />
      <Scene {...{ canvasRef }} />
    </div>
  )
}

export default App
