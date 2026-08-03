"use client";

import { useEffect, useRef } from "react";

/**
 * ADMIN SILK — the flowing gold/black liquid backdrop, retoned and de-risked.
 *
 * =============================================================================
 * 🔴 THE SHADER MATH IS THE 21st.dev "Silk" RECIPE. THE PALETTE, THE MOTION
 * POLICY AND THE HOST CODE ARE OURS.
 *
 * The client supplied a generated `ShaderBackground` and asked for its look "as
 * a subtle, tasteful accent — NOT loud, it must never fight the data or hurt
 * legibility". The domain-warp/fbm/palette pipeline below is the generator's.
 * Four things are not:
 *
 *   1. THE COLOURS. The recipe ships #FFC300-bright gold on near-black. Ours are
 *      the Synergy tokens: ink-deep #0F0D0A -> navy #0D1B2A -> gold #C9A84C ->
 *      gold-pale #EFE1B0. Same ramp shape, our palette, materially calmer.
 *   2. REDUCED MOTION. The recipe has no `prefers-reduced-motion` path at all —
 *      it animates forever. Ours draws ONE still frame and never loops.
 *   3. NO POINTER INTERACTION. `cursorEnabled` is off and the pointer listeners
 *      are not attached. On a full-page dashboard backdrop, cursor-reactive
 *      liquid is exactly the "loud" the brief forbids — and this codebase has
 *      already been burned once by hover-driven background motion (see
 *      SmokeyBackground: the canvas IS the background, so the idle state is
 *      hovered). Not repeating it.
 *   4. TIME SCALE. The recipe runs -0.537; ours runs -0.18, roughly a third of
 *      the speed, so it reads as drift rather than churn behind a table.
 *
 * =============================================================================
 * 🔴 NO DATA EVER SITS ON THIS LAYER, AND THAT IS THE WHOLE AA STRATEGY.
 *
 * Rather than solve contrast for text over a MOVING, multi-hued field — which
 * cannot be done honestly, because the worst pixel changes every frame — the
 * dashboard keeps every number, label and table cell on an OPAQUE card. This
 * canvas is visible only in the page gutters, behind the top bar's blur, and
 * under a heavy cream scrim (`.admin-silk-scrim`). The contrast obligation is
 * therefore discharged structurally: there is no composited text pixel to
 * measure, because no text is composited over it.
 *
 * The one thing that DOES sit near it — the top bar — is a `backdrop-blur`
 * surface at 0.86 cream, measured in globals.css.
 *
 * 🔴 IF A FUTURE PASS PUTS TEXT DIRECTLY ON THIS CANVAS, THE ABOVE STOPS BEING
 * TRUE and every ratio has to be re-derived against the field's brightest AND
 * darkest reachable pixel. Don't.
 *
 * =============================================================================
 * ⚠️ THE GENERATOR'S CLEANUP IS KEPT, INCLUDING ITS DEFERRED `loseContext()`.
 * That pattern (a WeakMap of pending release timers, cancelled if the same
 * canvas remounts) exists precisely to survive React StrictMode's double-mount —
 * which is the bug that made SmokeyBackground render white when it called
 * `loseContext()` synchronously in cleanup. The generator got this right; it is
 * preserved verbatim rather than "simplified".
 */

const VERT = `attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 u_colors[8];
uniform vec4 u_scene;      // resolution.xy, time, colour count
uniform vec4 u_shape;      // scale, intensity, paramA, warp
uniform vec4 u_surface;    // detail, contrast, brightness, saturation
uniform vec4 u_finish;     // hue, vignette, blur, grain
uniform vec4 u_transform;  // seed, rotation, drift, OKLab toggle
uniform vec4 u_space;      // offset.xy, pointer.xy

#define u_resolution u_scene.xy
#define u_time u_scene.z
#define u_colorCount u_scene.w
#define u_scale u_shape.x
#define u_intensity u_shape.y
#define u_warp u_shape.w
#define u_detail u_surface.x
#define u_contrast u_surface.y
#define u_brightness u_surface.z
#define u_saturation u_surface.w
#define u_vignette u_finish.y
#define u_grain u_finish.w
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define u_seed u_transform.x
#else
#define u_seed mod(u_transform.x, 31.0)
#endif
#define u_drift u_transform.z
#define u_oklab u_transform.w
#define u_offset u_space.xy

float hash21(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}

vec3 srgbToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
vec3 linearToSrgb(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, c));
}
vec3 linToOklab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(max(l, 0.0), 1.0 / 3.0);
  m = pow(max(m, 0.0), 1.0 / 3.0);
  s = pow(max(s, 0.0), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
}
vec3 oklabToLin(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}
vec3 mixColour(vec3 a, vec3 b, float t) {
  if (u_oklab > 0.5) {
    vec3 la = linToOklab(srgbToLinear(a));
    vec3 lb = linToOklab(srgbToLinear(b));
    return clamp(linearToSrgb(oklabToLin(mix(la, lb, t))), 0.0, 1.0);
  }
  return mix(a, b, t);
}

vec3 palette(float x) {
  float n = max(u_colorCount - 1.0, 1.0);
  float f = clamp(x, 0.0, 1.0) * n;
  vec3 col = u_colors[0];
  for (int i = 0; i < 7; i++) {
    if (float(i) < n)
      col = mixColour(col, u_colors[i + 1],
        smoothstep(0.0, 1.0, clamp(f - float(i), 0.0, 1.0)));
  }
  return col;
}

vec3 shade(vec2 p, float t) {
  vec2 q = p * 1.6;
  float amp = 0.25 + u_intensity * 0.85;
  for (float i = 1.0; i < 5.0; i += 1.0) {
    q.x += amp / i * cos(i * 2.4 * q.y + t * 0.8 + u_seed);
    q.y += amp / i * cos(i * 1.7 * q.x + t * 0.6);
  }
  return palette(0.5 + 0.5 * sin(q.x + q.y));
}

void main() {
  vec2 screenUv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy)
    / min(u_resolution.x, u_resolution.y);

  p *= u_scale;
  p += u_offset;
  if (u_drift > 0.0001)
    p += u_drift * vec2(sin(u_time * 0.31), cos(u_time * 0.23));
  if (u_warp > 0.0) {
    p += u_warp * (vec2(
      fbm(p * u_detail + u_seed),
      fbm(p * u_detail + vec2(5.2, 1.3))) - 0.5);
  }

  vec3 col = shade(p, u_time);

  if (abs(u_contrast - 1.0) > 0.0001)
    col = (col - 0.5) * u_contrast + 0.5;
  if (abs(u_saturation - 1.0) > 0.0001) {
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, u_saturation);
  }
  if (abs(u_brightness) > 0.0001)
    col += u_brightness;
  if (u_vignette > 0.0001) {
    float vd = length(screenUv - 0.5) * 1.41421356;
    col *= 1.0 - u_vignette * smoothstep(0.35, 1.0, vd);
  }
  if (u_grain > 0.0001)
    col += (grainHash(
      gl_FragCoord.xy + vec2(u_seed * 17.0, u_seed * 31.0)) - 0.5) * u_grain;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

/**
 * 🔴 THE RECIPE'S NUMBERS, WITH FOUR DELIBERATE DEVIATIONS (see the header).
 * Colours are the Synergy tokens rather than the generator's brighter gold.
 */
const UNIFORMS = {
  colors: [
    [0.058824, 0.05098, 0.039216], // ink-deep  #0F0D0A
    [0.05098, 0.105882, 0.164706], // navy      #0D1B2A
    [0.788235, 0.658824, 0.298039], // gold     #C9A84C
    [0.937255, 0.882353, 0.690196], // gold-pale #EFE1B0
    [0.937255, 0.882353, 0.690196],
    [0.937255, 0.882353, 0.690196],
    [0.937255, 0.882353, 0.690196],
    [0.937255, 0.882353, 0.690196],
  ] as [number, number, number][],
  colorCount: 4,
  scale: 1.28,
  intensity: 0.47,
  warp: 0.0,
  detail: 2.4,
  contrast: 0.978,
  brightness: 0.0,
  saturation: 0.92,
  vignette: 0.0,
  grain: 0.0,
  seed: 707.0,
  offsetX: 0.0,
  offsetY: 0.0,
  drift: 0.0,
  oklab: 1.0,
  /** -0.18, not the recipe's -0.537 — drift, not churn, behind a data table. */
  timeScale: -0.18,
};

const pendingContextReleases = new WeakMap<HTMLCanvasElement, number>();

export default function AdminSilk({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // The generator's remount guard — see the header note. A pending release
    // from StrictMode's first cleanup is cancelled when the same canvas
    // remounts, so the context is never lost out from under the second mount.
    const pendingRelease = pendingContextReleases.get(canvas);
    if (pendingRelease !== undefined) window.clearTimeout(pendingRelease);
    pendingContextReleases.delete(canvas);

    const gl = canvas.getContext("webgl", {
      antialias: false,
      // Required so the single still frame survives compositing when the loop
      // is not running (reduced motion, hidden tab). Learned the hard way on
      // SmokeyBackground, where its absence rendered a blank background.
      preserveDrawingBuffer: true,
    });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram()!;
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uni = {
      colors: gl.getUniformLocation(program, "u_colors"),
      scene: gl.getUniformLocation(program, "u_scene"),
      shape: gl.getUniformLocation(program, "u_shape"),
      surface: gl.getUniformLocation(program, "u_surface"),
      finish: gl.getUniformLocation(program, "u_finish"),
      transform: gl.getUniformLocation(program, "u_transform"),
      space: gl.getUniformLocation(program, "u_space"),
    };
    gl.uniform3fv(uni.colors, new Float32Array(UNIFORMS.colors.flat()));
    gl.uniform4f(uni.shape, UNIFORMS.scale, UNIFORMS.intensity, 0.5, UNIFORMS.warp);
    gl.uniform4f(
      uni.surface,
      UNIFORMS.detail,
      UNIFORMS.contrast,
      UNIFORMS.brightness,
      UNIFORMS.saturation,
    );
    gl.uniform4f(uni.finish, 0, UNIFORMS.vignette, 0, UNIFORMS.grain);
    gl.uniform4f(
      uni.transform,
      UNIFORMS.seed,
      0,
      UNIFORMS.drift,
      UNIFORMS.oklab,
    );

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = performance.now();
    let raf = 0;
    let running = false;
    let disposed = false;
    let inView = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const raw = { w: rect.width * dpr, h: rect.height * dpr };
      // The generator's 2MP ceiling — keeps a full-screen backdrop off the
      // fill-rate cliff on integrated GPUs.
      const s = Math.min(1, Math.sqrt(2_000_000 / Math.max(1, raw.w * raw.h)));
      const w = Math.max(1, Math.round(raw.w * s));
      const h = Math.max(1, Math.round(raw.h * s));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      return { w, h };
    };

    const draw = (t: number) => {
      const { w, h } = resize();
      gl.uniform4f(uni.scene, w, h, t, UNIFORMS.colorCount);
      gl.uniform4f(uni.space, UNIFORMS.offsetX, UNIFORMS.offsetY, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      draw(((now - start) / 1000) * UNIFORMS.timeScale);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (running || disposed || reduce.matches || !inView || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // 🔴 ONE STILL FRAME ALWAYS. Under reduced motion this is the only frame
    // ever drawn — the backdrop still looks like itself, it simply does not move.
    draw(0);
    play();

    const onVisibility = () => (document.hidden ? pause() : play());
    const onPref = () => {
      pause();
      draw(0);
      play();
    };
    const onResize = () => {
      if (!running) draw(0);
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true;
      if (inView) play();
      else pause();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onPref);
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      pause();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onPref);
      window.removeEventListener("resize", onResize);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
      // Deferred release — see the header. Cancelled above if the same canvas
      // remounts, which is what makes this StrictMode-safe.
      const timer = window.setTimeout(() => {
        if (pendingContextReleases.get(canvas) !== timer) return;
        pendingContextReleases.delete(canvas);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        canvas.width = 1;
        canvas.height = 1;
      }, 0);
      pendingContextReleases.set(canvas, timer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
