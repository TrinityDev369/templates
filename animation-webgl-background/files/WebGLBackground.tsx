"use client";

import {
  useRef,
  useEffect,
  useCallback,
  type CSSProperties,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WebGLBackgroundProps {
  /** Gradient colors as hex strings. Passed to the shader as vec3 uniforms.
   *  @default ['#6366f1', '#8b5cf6', '#ec4899'] */
  colors?: string[];
  /** Animation speed multiplier. @default 0.5 */
  speed?: number;
  /** Effect intensity multiplier. @default 1.0 */
  intensity?: number;
  /** Whether the shader responds to mouse movement. @default true */
  interactive?: boolean;
  /** Additional CSS class applied to the canvas element. */
  className?: string;
  /** Additional inline styles applied to the canvas element. */
  style?: CSSProperties;
}

/* ------------------------------------------------------------------ */
/*  Shader sources                                                     */
/* ------------------------------------------------------------------ */

const VERTEX_SOURCE = /* glsl */ `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

/**
 * Fragment shader that produces a smooth, flowing plasma / gradient effect.
 *
 * Uniforms:
 *   u_time       - elapsed seconds (float)
 *   u_resolution - canvas pixel size (vec2)
 *   u_mouse      - normalised mouse position 0..1 (vec2)
 *   u_color0     - first gradient colour (vec3, 0-1 range)
 *   u_color1     - second gradient colour
 *   u_color2     - third gradient colour
 *   u_speed      - speed multiplier (float)
 *   u_intensity  - intensity multiplier (float)
 *
 * The effect combines multiple octaves of sine-based pseudo-noise to
 * create an organic, continuously evolving gradient field.  Mouse
 * position gently warps the field centre when interactive.
 */
const FRAGMENT_SOURCE = /* glsl */ `
  precision mediump float;

  uniform float u_time;
  uniform vec2  u_resolution;
  uniform vec2  u_mouse;
  uniform vec3  u_color0;
  uniform vec3  u_color1;
  uniform vec3  u_color2;
  uniform float u_speed;
  uniform float u_intensity;

  /* ---- simple pseudo-random / hash -------------------------------- */
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  /* ---- smooth value noise ----------------------------------------- */
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);     /* smoothstep curve */

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  /* ---- fractal brownian motion (3 octaves) ------------------------ */
  float fbm(vec2 p) {
    float value = 0.0;
    float amp   = 0.5;
    for (int i = 0; i < 3; i++) {
      value += amp * noise(p);
      p     *= 2.0;
      amp   *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time * u_speed;

    /* Warp UV based on mouse when interactive (u_mouse defaults to 0.5,0.5) */
    vec2 mouseOffset = (u_mouse - 0.5) * 0.3 * u_intensity;
    vec2 p = uv + mouseOffset;

    /* Build layered noise field */
    float n1 = fbm(p * 3.0 + vec2(t * 0.4,  t * 0.3));
    float n2 = fbm(p * 2.0 + vec2(-t * 0.3, t * 0.5) + n1 * 0.5);
    float n3 = fbm(p * 4.0 + vec2(t * 0.2, -t * 0.4) + n2 * 0.3);

    /* Combine into smooth gradient weights */
    float w0 = sin(n1 * 3.14159 + t * 0.5) * 0.5 + 0.5;
    float w1 = sin(n2 * 3.14159 + t * 0.7 + 1.0) * 0.5 + 0.5;
    float w2 = sin(n3 * 3.14159 + t * 0.6 + 2.0) * 0.5 + 0.5;

    /* Normalise weights */
    float total = w0 + w1 + w2 + 0.001;
    w0 /= total;
    w1 /= total;
    w2 /= total;

    /* Mix colours */
    vec3 color = u_color0 * w0 + u_color1 * w1 + u_color2 * w2;

    /* Add subtle brightness variation via the noise */
    float brightness = 0.85 + 0.15 * fbm(p * 1.5 + t * 0.2);
    color *= brightness * u_intensity;

    /* Soft vignette */
    float vignette = 1.0 - 0.3 * length(uv - 0.5);
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Parse a hex colour string (#RGB or #RRGGBB) into [r, g, b] in 0-1 range. */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const n = parseInt(h, 16);
  return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

/** Compile a shader; returns null and logs on failure. */
function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("WebGLBackground: shader compile error", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Create and link a program from vertex + fragment sources. */
function createProgram(
  gl: WebGLRenderingContext,
  vertSrc: string,
  fragSrc: string,
): WebGLProgram | null {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vert || !frag) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("WebGLBackground: program link error", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  /* Shaders are linked into the program — originals can be freed. */
  gl.deleteShader(vert);
  gl.deleteShader(frag);

  return program;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function WebGLBackground({
  colors = ["#6366f1", "#8b5cf6", "#ec4899"],
  speed = 0.5,
  intensity = 1.0,
  interactive = true,
  className,
  style,
}: WebGLBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const contextLostRef = useRef(false);

  /* Keep mutable refs for props used inside the render loop so that
     the animation loop always reads the latest values without
     requiring a teardown / re-setup cycle.                            */
  const colorsRef = useRef(colors);
  const speedRef = useRef(speed);
  const intensityRef = useRef(intensity);
  const interactiveRef = useRef(interactive);

  colorsRef.current = colors;
  speedRef.current = speed;
  intensityRef.current = intensity;
  interactiveRef.current = interactive;

  /* ---- mouse tracking -------------------------------------------- */

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    mouseRef.current = {
      x: e.clientX / window.innerWidth,
      y: 1.0 - e.clientY / window.innerHeight, /* flip Y for GL coords */
    };
  }, []);

  /* ---- WebGL setup + animation loop ------------------------------ */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* --- context loss handlers ------------------------------------ */

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      contextLostRef.current = true;
      cancelAnimationFrame(rafRef.current);
    };

    const handleContextRestored = () => {
      contextLostRef.current = false;
      /* Re-initialise below will be handled by the next effect run
         (React strict mode) or we could re-call init here.  For
         simplicity we just reload.                                   */
      setup();
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);

    /* --- GL init -------------------------------------------------- */

    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let posBuffer: WebGLBuffer | null = null;

    /* Uniform locations (populated after program creation). */
    let loc_time: WebGLUniformLocation | null = null;
    let loc_resolution: WebGLUniformLocation | null = null;
    let loc_mouse: WebGLUniformLocation | null = null;
    let loc_color0: WebGLUniformLocation | null = null;
    let loc_color1: WebGLUniformLocation | null = null;
    let loc_color2: WebGLUniformLocation | null = null;
    let loc_speed: WebGLUniformLocation | null = null;
    let loc_intensity: WebGLUniformLocation | null = null;

    function resize() {
      if (!canvas || !gl) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function setup() {
      if (!canvas) return;

      gl = canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
      });

      if (!gl) {
        console.warn("WebGLBackground: WebGL not supported");
        return;
      }

      program = createProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE);
      if (!program) return;

      gl.useProgram(program);

      /* Full-screen quad (two triangles covering clip space). */
      posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          -1, -1,
           1, -1,
          -1,  1,
          -1,  1,
           1, -1,
           1,  1,
        ]),
        gl.STATIC_DRAW,
      );

      const aPosition = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      /* Cache uniform locations. */
      loc_time = gl.getUniformLocation(program, "u_time");
      loc_resolution = gl.getUniformLocation(program, "u_resolution");
      loc_mouse = gl.getUniformLocation(program, "u_mouse");
      loc_color0 = gl.getUniformLocation(program, "u_color0");
      loc_color1 = gl.getUniformLocation(program, "u_color1");
      loc_color2 = gl.getUniformLocation(program, "u_color2");
      loc_speed = gl.getUniformLocation(program, "u_speed");
      loc_intensity = gl.getUniformLocation(program, "u_intensity");

      resize();
      startLoop();
    }

    /* --- animation loop ------------------------------------------- */

    const startTime = performance.now();

    function render() {
      if (!gl || !program || contextLostRef.current) return;

      const elapsed = (performance.now() - startTime) / 1000;

      /* Resolve current colours (pad / clamp to exactly 3). */
      const c = colorsRef.current;
      const rgb0 = hexToRgb(c[0] ?? "#6366f1");
      const rgb1 = hexToRgb(c[1] ?? "#8b5cf6");
      const rgb2 = hexToRgb(c[2] ?? "#ec4899");

      /* Set uniforms. */
      gl.uniform1f(loc_time, elapsed);
      gl.uniform2f(loc_resolution, gl.canvas.width, gl.canvas.height);

      const mx = interactiveRef.current ? mouseRef.current.x : 0.5;
      const my = interactiveRef.current ? mouseRef.current.y : 0.5;
      gl.uniform2f(loc_mouse, mx, my);

      gl.uniform3f(loc_color0, rgb0[0], rgb0[1], rgb0[2]);
      gl.uniform3f(loc_color1, rgb1[0], rgb1[1], rgb1[2]);
      gl.uniform3f(loc_color2, rgb2[0], rgb2[1], rgb2[2]);

      gl.uniform1f(loc_speed, speedRef.current);
      gl.uniform1f(loc_intensity, intensityRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafRef.current = requestAnimationFrame(render);
    }

    function startLoop() {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(render);
    }

    /* --- resize observer ------------------------------------------ */

    const resizeObserver = new ResizeObserver(() => {
      if (!contextLostRef.current) resize();
    });
    resizeObserver.observe(canvas);

    /* --- mouse listener ------------------------------------------- */

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    /* --- kick off ------------------------------------------------- */

    setup();

    /* --- cleanup -------------------------------------------------- */

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);

      if (gl) {
        if (posBuffer) gl.deleteBuffer(posBuffer);
        if (program) gl.deleteProgram(program);
        /* Losing the context explicitly frees all remaining GL resources. */
        const ext = gl.getExtension("WEBGL_lose_context");
        if (ext) ext.loseContext();
      }
    };
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps -- intentional: refs track prop changes */

  /* ---- render ---------------------------------------------------- */

  const baseStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
    pointerEvents: "none",
    ...style,
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={baseStyle}
      aria-hidden="true"
    />
  );
}

export default WebGLBackground;
