import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * CHROMA KEY SHADER
 * 
  var material = new ShaderMaterial({
      uniforms: {
        tex: {
          value: texture,
        },
        keyColor: {
          value: new THREE.Color('blue'),
        },
        texWidth: {
          value: 1024,
        },
        texHeight: {
          value: 1024,
        },
        similarity: {
          value: 0.4,
        },
        smoothness: {
          value: 0.08,
        },
        spill: {
          value: 0.1,
        },
      },
      vertexShader: 
      `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
      `,
      fragmentShader: 
      `
      uniform sampler2D tex;
        uniform float texWidth;
        uniform float texHeight;

        uniform vec3 keyColor;
        uniform float similarity;
        uniform float smoothness;
        uniform float spill;
				
				varying vec2 vUv;

        // From https://github.com/libretro/glsl-shaders/blob/master/nnedi3/shaders/rgb-to-yuv.glsl
        vec2 RGBtoUV(vec3 rgb) {
          return vec2(
            rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5    + 0.5,
            rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081  + 0.5
          );
        }

        vec4 ProcessChromaKey(vec2 texCoord) {
          vec4 rgba = texture2D(tex, texCoord);
          float chromaDist = distance(RGBtoUV(texture2D(tex, texCoord).rgb), RGBtoUV(keyColor));

          float baseMask = chromaDist - similarity;
          float fullMask = pow(clamp(baseMask / smoothness, 0., 1.), 1.5);
          rgba.a = fullMask;

          float spillVal = pow(clamp(baseMask / spill, 0., 1.), 1.5);
          float desat = clamp(rgba.r * 0.2126 + rgba.g * 0.7152 + rgba.b * 0.0722, 0., 1.);
          rgba.rgb = mix(vec3(desat, desat, desat), rgba.rgb, spillVal);

          return rgba;
        }

        void main(void) {
          vec2 texCoord = vUv;
          gl_FragColor = ProcessChromaKey(texCoord);
        }
      `,
  
      transparent: true
    })

 */

// Functional Component
const Scene = ({ canvasRef }) => {
  const mountRef = useRef(null)

  // Cursor states
  const [cursorX, setCX] = useState(0)
  const [cursorY, setCY] = useState(0)

  useEffect(() => {
    // Set scene and perspective
    var scene = new THREE.Scene()
    scene.background = new THREE.Color('#454545')

    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )

    // Webgl renderer
    var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)

    // Cache refrence to DOM and append renderer element
    const mount = mountRef.current,
      element = renderer.domElement

    mount.appendChild(element)

    // Define geometry
    var geometry = new THREE.PlaneGeometry(5, 5, 5)

    // Texture loader
    const ctx = canvasRef.current.getContext('2d')

    const texture = new THREE.CanvasTexture(ctx.canvas)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    })

    var plane = new THREE.Mesh(geometry, material)

    // Add to scene, position camera
    scene.add(plane)
    camera.position.z = 5

    //TODO - un register listeners + animation frame??
    // Perspective transform handler
    window.addEventListener(
      'mousemove',
      e => {
        const x = e.pageX,
          y = e.pageY

        // Update cursor position
        setCX(x)
        setCY(y)

        // Update scene tilt
        const halfWidth = window.innerWidth / 2,
          tilt = (x > halfWidth ? x - halfWidth : x) / halfWidth

        if (x < halfWidth) {
          // Tilt left (inversed)
          plane.rotation.y = 1 - tilt
        } else {
          // Tilt right
          plane.rotation.y = tilt - tilt * 2
        }
      },
      false
    )

    // Window resize handler
    const resize = () => {
      const w = window.innerWidth,
        h = window.innerHeight

      // Update scene with window dimensions
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    // Register listeners
    window.addEventListener('resize', resize, false)

    // Animate
    let animationID = -1

    const animate = function () {
      // Update Canvas
      texture.needsUpdate = true

      // Update scene
      renderer.render(scene, camera)

      // Loop
      animationID = requestAnimationFrame(animate)
    }

    animate()

    // ComponentWillUnmount
    return () => {
      // Clean up
      cancelAnimationFrame(animationID)
      mount.removeChild(renderer.domElement)
      window.removeEventListener('resize', resize)
    }
  }, [canvasRef, setCX, setCY])

  // Return JSX
  return (
    /* Mount for webgl element */
    <div ref={mountRef}>
      {/* Cursor */}
      <div className='cursor' style={{ left: cursorX, top: cursorY }} />
      <div className='cursor-tail' style={{ left: cursorX, top: cursorY }} />
    </div>
  )
}

// Expose
export default Scene
