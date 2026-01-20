import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const MAX_COLORS = 8;
const hexToRGB = hex => {
  const c = hex.replace('#', '').padEnd(6, '0');
  return [parseInt(c.slice(0, 2), 16) / 255, parseInt(c.slice(2, 4), 16) / 255, parseInt(c.slice(4, 6), 16) / 255];
};

const prepStops = stops => {
  const base = (stops?.length ? stops : ['#5227FF', '#B19EEF']).slice(0, MAX_COLORS);
  while (base.length < MAX_COLORS) base.push(base[base.length - 1]);
  return { arr: base.map(hexToRGB), count: Math.max(2, stops?.length ?? 2) };
};

export default function GradientBlinds({
  gradientColors = ['#5227FF', '#B19EEF'],
  angle = 25,
  noise = 0.2,
  blindCount = 3, // VALOR MUY BAJO PARA LÍNEAS GIGANTES
  spotlightRadius = 0.5,
  spotlightOpacity = 1.0,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // ELIMINAR MÁRGENES DEL BODY POR SI ACASO
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";

    const renderer = new Renderer({ alpha: true, antialias: true });
    const gl = renderer.gl;
    
    // Ajuste de estilo para evitar el marco blanco
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.top = '-1px';  // Sangrado de 1px para seguridad
    gl.canvas.style.left = '-1px';
    gl.canvas.style.width = 'calc(100% + 2px)';
    gl.canvas.style.height = 'calc(100% + 2px)';
    gl.canvas.style.display = 'block';
    container.appendChild(gl.canvas);

    const vertex = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragment = `
      precision mediump float;
      uniform vec3 iResolution;
      uniform vec2 iMouse;
      uniform float iTime;
      uniform float uAngle;
      uniform float uNoise;
      uniform float uBlindCount;
      uniform float uSpotlightRadius;
      uniform float uSpotlightOpacity;
      uniform vec3 uColor0;
      uniform vec3 uColor1;
      varying vec2 vUv;

      float rand(vec2 co){ return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453); }
      vec2 rotate2D(vec2 p, float a){
        float c = cos(a); float s = sin(a);
        return mat2(c, -s, s, c) * p;
      }

      void main() {
        vec2 uv = vUv;
        float aspect = iResolution.x / iResolution.y;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= aspect;
        p = rotate2D(p, radians(uAngle));
        
        // El factor 0.2 hace que las líneas sean mucho más anchas
        float lines = fract(p.x * uBlindCount * 0.2);
        
        vec3 base = mix(uColor0, uColor1, uv.y);
        float d = distance(vUv, iMouse / iResolution.xy);
        float spot = smoothstep(uSpotlightRadius, 0.0, d) * uSpotlightOpacity;
        
        vec3 color = base + vec3(spot);
        color -= (1.0 - lines) * 0.4; // Sombras más marcadas
        color += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const { arr } = prepStops(gradientColors);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: [window.innerWidth, window.innerHeight, 1] },
        iMouse: { value: [window.innerWidth / 2, window.innerHeight / 2] },
        iTime: { value: 0 },
        uAngle: { value: angle },
        uNoise: { value: noise },
        uBlindCount: { value: blindCount },
        uSpotlightRadius: { value: spotlightRadius },
        uSpotlightOpacity: { value: spotlightOpacity },
        uColor0: { value: arr[0] },
        uColor1: { value: arr[1] }
      }
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      program.uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];
    };

    window.addEventListener('resize', resize);
    resize();

    const move = e => {
      program.uniforms.iMouse.value = [e.clientX, window.innerHeight - e.clientY];
    };
    window.addEventListener('pointermove', move);

    let raf;
    const loop = t => {
      program.uniforms.iTime.value = t * 0.001;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      if (gl.canvas.parentElement) container.removeChild(gl.canvas);
    };
  }, [angle, blindCount, gradientColors, noise, spotlightOpacity, spotlightRadius]);

  return (
    <div
      ref={ref}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: -1, margin: 0, padding: 0, background: 'black' }}
    />
  );
}