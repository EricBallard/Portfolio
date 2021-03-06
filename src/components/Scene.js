import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// Functional Component
const Scene = ({ canvasRef, isTouchDevice }) => {
  // Refrences
  const mountRef = useRef(null)
  // const loadingRef = useRef(null)

  // States
  // Animate smoothly between rotations
  const [targetRotation, setTarget] = useState(0)

  // Capture dependency update without re-mounting scene comp
  // useEffect(() => (loadingRef.current = isLoading), [isLoading])

  // ComponentDidMount
  useEffect(() => {
    // Set scene and perspective
    var scene = new THREE.Scene()
    scene.background = new THREE.Color('#454545')

    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    // Webgl renderer
    var renderer = new THREE.WebGLRenderer({ antialias: false })
    renderer.setSize(window.innerWidth, window.innerHeight)

    // Cache refrence to DOM and append renderer element
    const mount = mountRef.current,
      element = renderer.domElement

    mount.appendChild(element)

    // Define geometry
    var geometry = new THREE.PlaneGeometry(5, 5)

    // Texture loader
    const ctx = canvasRef.current.getContext('2d')

    const texture = new THREE.CanvasTexture(ctx.canvas)
    const material = new THREE.MeshBasicMaterial({ map: texture })

    const plane = new THREE.Mesh(geometry, material)

    // Add to scene, position camera
    scene.add(plane)
    camera.position.z = 5

    // Window resize handler
    const resize = () => {
      const w = window.innerWidth,
        h = window.innerHeight

      // Update scene with window dimensions
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    // Scene tilt handler
    const tilt = e => {
      // Update position
      let x

      if (isTouchDevice) {
        let touch = e.touches[0]
        if (!touch) return

        x = touch.clientX
      } else {
        x = e.pageX
      }

      // Cacluate
      const halfWidth = window.innerWidth / 2,
        tilt = (x > halfWidth ? x - halfWidth : x) / halfWidth

      // Validate
      if (isNaN(tilt) || tilt > 1 || tilt < -1) return

      //Apply
      if (x < halfWidth) {
        // Tilt left (inversed)
        plane.rotation.y = 1 - tilt
      } else {
        // Tilt right
        plane.rotation.y = tilt - tilt * 2
      }
    }

    // Register listeners
    window.addEventListener('resize', resize)
    window.addEventListener(isTouchDevice ? 'touchmove' : 'mousemove', tilt, { passive: true })

    // Animate
    let animationID = -1

    const animate = function () {
      texture.needsUpdate = true

      // (Subtly) Move camera closer to plane

      //TODO (attach obj to side and zomm in/out until it is visible)
      //if (camera.position.z > 4.5) {
      //  camera.translateZ(-0.005)
      //}

      // Update scene
      renderer.render(scene, camera)

      // Loop
      animationID = requestAnimationFrame(animate)
    }

    animate()

    // ComponentWillUnmount
    return () => {
      // Clean up
      window.removeEventListener('resize', resize)
      window.removeEventListener(isTouchDevice ? 'touchmove' : 'mousemove', tilt, { passive: true })

      cancelAnimationFrame(animationID)
      mount.removeChild(renderer.domElement)
    }
  }, [canvasRef, targetRotation, setTarget, isTouchDevice])

  // Return JSX
  return (
    /* Mount for webgl element */
    <div ref={mountRef} />
  )
}

// Expose
export default Scene
