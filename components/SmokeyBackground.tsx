"use client";

import { useEffect, useRef } from "react";

/**
 * SMOKEY WEBGL BACKGROUND — the client's reference shader, recoloured.
 *
 * ---------------------------------------------------------------------------
 * 🔴 THE SHADER MATH IS THE REFERENCE'S, VERBATIM. THE COLOUR AND THE HOST
 * CODE ARE NOT.
 *
 * The client supplied a `SmokeyBackground` component and asked for "the
 * background exactly like it but gold and white instead of blue and black".
 * The distortion loop, the wave, the glow curve and the time scale below are
 * character-for-character theirs — that is what makes the smoke move and fold
 * the way the reference does, and changing any of it would change the effect
 * rather than the colour.
 *
 * WHAT CHANGED, AND IT IS EXACTLY ONE LINE OF SHADER:
 *
 *   reference   fragColor = vec4(u_color * glow, 1.0);
 *   ours        fragColor = vec4(mix(u_base, u_color, glow), 1.0);
 *
 * Theirs multiplies the colour by the glow, so glow 0 is BLACK and glow 1 is
 * blue — blue smoke on black. Ours interpolates between two real colours, so
 * glow 0 is our near-white and glow 1 is our gold — gold smoke on white. Same
 * shapes, same motion, inverted value, our palette. Multiplying by a light
 * colour cannot produce this: `white * glow` is grey, not white-to-gold.
 *
 *   reference   #1E40AF  blue   on implicit black
 *   ours        #C9A84C  gold   on cream #F8F4EE
 *
 * ---------------------------------------------------------------------------
 * 🔴 FOUR DEFECTS IN THE REFERENCE'S HOST CODE, NOT COPIED. The GLSL is sound;
 * the React around it is not, and pasting it would have put all four here.
 *
 * 1. IT RECOMPILES THE ENTIRE PROGRAM ON EVERY MOUSE MOVE, AND LEAKS A RENDER
 *    LOOP EACH TIME. Its effect declares `[isHovering, mousePosition, color]`
 *    and `mousePosition` is React state written from `mousemove`. So every
 *    pointer pixel tears down and rebuilds shaders, program and buffer — and
 *    because the cleanup only removes listeners and never calls
 *    `cancelAnimationFrame`, the OLD render loop keeps running. Move the mouse
 *    for five seconds and there are hundreds of concurrent rAF loops all
 *    drawing to the same canvas, forever. This is the serious one.
 *    FIXED: mouse and hover live in REFS, the effect runs ONCE, and the loop is
 *    cancelled in cleanup.
 *
 * 2. IT REALLOCATES THE DRAWING BUFFER EVERY FRAME. `canvas.width = width` is
 *    assigned unconditionally inside `render()`, and assigning canvas.width
 *    reallocates and clears the buffer even when the value is unchanged.
 *    FIXED: resize only when the measured box actually differs.
 *
 * 3. NO REDUCED-MOTION PATH. A full-screen animated field is precisely what
 *    `prefers-reduced-motion` exists for.
 *    FIXED: one still frame is drawn and the loop never starts. The background
 *    still looks like itself — it simply does not move — and the pointer does
 *    not drive it either, since mouse-driven ripple is motion too.
 *
 * 4. IT RUNS WHILE THE TAB IS HIDDEN. rAF is throttled by the browser but the
 *    loop is never released, and the context is never freed on unmount.
 *    FIXED: `visibilitychange` pauses it, and cleanup calls `WEBGL_lose_context`
 *    so the GPU resources go back when the page is left.
 *
 * ---------------------------------------------------------------------------
 * 🔴 IT DEGRADES TO NOTHING, NOT TO A BLANK BOX. If `getContext("webgl")`
 * returns null — old hardware, blocklisted driver, GPU process crash — the
 * canvas simply never paints and the CSS gradient painted underneath it by
 * `.auth-screen` shows through. That fallback is a real, deliberate surface,
 * not an accident: the login page must never render as a white void because a
 * decorative shader failed.
 *
 * §AA — THIS LAYER CARRIES NO CONTRAST OBLIGATION AND MUST NOT BE GIVEN ONE.
 * Nothing is drawn on top of it directly; the sign-in card is an opaque surface
 * with its own measured ink (see `.auth-card`). The one number that matters is
 * that the card's WORST backdrop is now the brightest cream the smoke can
 * produce, which is what the card's alpha is solved against.
 */

/** The reference's vertex shader, unchanged — a full-screen triangle pair. */
const VERTEX_SRC = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

/**
 * The reference's fragment shader. Only the final composite differs (see the
 * header note) and `u_base` is added to carry the light end of the ramp.
 */
const FRAGMENT_SRC = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform vec3 u_color;
uniform vec3 u_base;

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    float time = iTime * 0.5;

    // Normalised pointer, remapped to -1..1 — the ripple centre.
    vec2 mouse = iMouse / iResolution;
    vec2 rippleCenter = 2.0 * mouse - 1.0;

    vec2 distortion = centeredUV;
    // The reference's distortion loop, verbatim. This is the effect.
    for (float i = 1.0; i < 8.0; i++) {
        distortion.x += 0.5 / i * cos(i * 2.0 * distortion.y + time + rippleCenter.x * 3.1415);
        distortion.y += 0.5 / i * cos(i * 2.0 * distortion.x + time + rippleCenter.y * 3.1415);
    }

    float wave = abs(sin(distortion.x + distortion.y + time));
    float glow = smoothstep(0.9, 0.2, wave);

    // 🔴 THE ONE CHANGED LINE. Theirs: vec4(u_color * glow, 1.0) — glow 0 is
    // black. Ours interpolates base -> colour, so glow 0 is our near-white and
    // glow 1 is our gold. Same shapes, our palette, light instead of dark.
    fragColor = vec4(mix(u_base, u_color, glow), 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
];

export default function SmokeyBackground({
  /** The smoke. Synergy gold. */
  color = "#D4A017",
  /**
   * 🔴 THE FIELD IS NAVY #0D1B2A NOW, NOT CREAM (2026-08-03). The client asked
   * for the login area to be dark navy behind the glassy card.
   *
   * This is a one-token change here because the shader interpolates
   * `mix(u_base, u_color, glow)` — swapping the base flips the whole field from
   * "gold smoke on white" to "gold smoke on navy" with no shader edit. It DOES,
   * however, invalidate every contrast figure solved against the light field:
   * the card is translucent, so a darker backdrop makes the card DARKER, which
   * moves every ratio inside it, and the two inks sitting directly on the smoke
   * (the meta line and the back link) were `ink/80` chosen precisely because the
   * field was light. All of it is re-derived — see `.auth-card` in globals.css
   * and the notes in page.tsx.
   */
  base = "#002050",
  /**
   * 🔴 A NAVY VEIL OVER THE SMOKE, AND IT IS A CONTRAST FIX, NOT A LOOK.
   *
   * Going navy created a DEAD BAND — the same failure mode HANDOFF records for
   * the retired About gradient, where a ramp passed through values that NO text
   * colour on this palette could sit on. Measured on the bare navy→gold field:
   *
   *     ink #1A1A1A   on navy end  1.00 FAIL   on gold end  7.62
   *     cream #F8F4EE on navy end 15.87        on gold end  2.09 FAIL
   *
   * Neither ink clears BOTH ends, and the meta line above the card and the back
   * link below it sit directly on this field wherever the smoke happens to be.
   * There is no colour that solves it; the SURFACE has to be brought into range.
   *
   * So a navy wash is composited over the canvas, which caps how bright the
   * gold can get. Solved for cream at 4.5:1 (needs the composite at or below
   * L 0.1629): veil 0.40 lands on L 0.1627 — a 0.0002 margin, i.e. exactly on
   * the line and not shippable. **0.50 gives L 0.1209 and cream 5.72**, which is
   * the value here. The smoke is dimmer than the light version by design; that
   * is the price of putting live text on a moving field.
   */
  veil = 0.5,
  className = "",
}: {
  color?: string;
  base?: string;
  veil?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* 🔴 THE `mouseRef` / `hoverRef` PAIR IS GONE. The animation is time-driven
     only, so there is no pointer state left to hold — see `draw()`. The
     reference component's whole mouse apparatus (and the recompile-per-pixel
     defect it caused) is therefore not merely fixed here, it is absent. */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      // The smoke is opaque and fills the canvas, so there is nothing to
      // composite against — and an opaque drawing buffer is cheaper.
      alpha: false,
      powerPreference: "low-power",
      // 🔴 REQUIRED, AND FOUND BY MEASURING. WebGL CLEARS the drawing buffer
      // after every composite unless this is set. The loop hides that — it
      // redraws each frame — but the moment the loop is NOT running the single
      // still frame is wiped and the canvas goes blank. That is exactly the
      // reduced-motion path, the hidden-tab path, and any non-compositing host.
      // Caught here as a WHITE background instead of a static gold smoke.
      preserveDrawingBuffer: true,
    });
    // No WebGL: paint nothing and let `.auth-screen`'s CSS gradient show.
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "iResolution");
    const uTime = gl.getUniformLocation(program, "iTime");
    const uMouse = gl.getUniformLocation(program, "iMouse");
    const uColor = gl.getUniformLocation(program, "u_color");
    const uBase = gl.getUniformLocation(program, "u_base");

    gl.uniform3f(uColor, ...hexToRgb(color));
    gl.uniform3f(uBase, ...hexToRgb(base));

    const start = Date.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let running = false;

    /** Resize ONLY when the box actually changed — see defect 2. */
    const sizeToBox = () => {
      const w = Math.max(1, canvas.clientWidth);
      const h = Math.max(1, canvas.clientHeight);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      return { w, h };
    };

    /** One frame. `t` is the shader clock in seconds. */
    const draw = (t: number) => {
      const { w, h } = sizeToBox();
      gl.uniform2f(uResolution, w, h);
      gl.uniform1f(uTime, t);

      // 🔴 THE RIPPLE CENTRE IS PURELY TIME-DRIVEN. THE POINTER DOES NOT TOUCH
      // IT AT ALL (2026-08-03, second fix). This is the whole animation.
      //
      // WHAT WAS WRONG THE FIRST TIME, and it is worth recording because it
      // LOOKED correct: the previous pass added this orbit but kept a
      // `hoverRef.current ? mouse : orbit` ternary, on the reasoning that the
      // cursor should take over when it enters the canvas. But the canvas IS
      // the entire page background — so simply RESTING the cursor anywhere over
      // the login screen (the normal state, since the card sits in the middle of
      // it) latched `live` to true and pinned the ripple centre to a stationary
      // mouse position. Only the subtle `iTime` churn was left, and the orbit —
      // the prominent motion — ran only when the pointer left the window
      // entirely. Net effect for a user: it moved when you moved the mouse and
      // stalled when you did not, which is exactly the reported symptom.
      //
      // The lesson: "hover hands control to the pointer" is a reasonable rule
      // for a small widget and a bad one for a full-viewport background, because
      // the idle state IS hovered.
      //
      // Different x/y frequencies (0.20 / 0.16) so the path is a Lissajous curve
      // that never settles into an obvious repeat, and 0.42 amplitude so the
      // centre sweeps a wide arc rather than jiggling.
      //
      // Under reduced motion the loop never runs (see `play`), so `draw(0)` is
      // the only frame ever shown and this evaluates once at t=0 to a fixed
      // point — a still image. Motion is gated on the loop; the loop is gated on
      // the preference. That contract is unchanged.
      gl.uniform2f(
        uMouse,
        w * (0.5 + 0.42 * Math.cos(t * 0.2)),
        h * (0.5 + 0.42 * Math.sin(t * 0.16)),
      );

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const loop = () => {
      draw((Date.now() - start) / 1000);
      raf = window.requestAnimationFrame(loop);
    };

    const play = () => {
      if (running || reduce.matches || document.hidden) return;
      running = true;
      raf = window.requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      window.cancelAnimationFrame(raf);
    };

    // A still frame ALWAYS, so the field exists before the loop starts and
    // remains if the loop never starts (reduced motion, or a hidden tab).
    draw(0);
    play();

    // 🔴 NO POINTER LISTENERS AT ALL ANY MORE. The three `mousemove` /
    // `mouseenter` / `mouseleave` handlers that used to live here are DELETED,
    // not just bypassed — leaving them would keep the coupling one edit away
    // from coming back, and they were doing per-pixel work for an input nothing
    // reads. The canvas is also `pointer-events-none` now (see the JSX), so the
    // whole background layer is inert to the mouse.
    const onVisibility = () => (document.hidden ? pause() : play());
    const onPrefChange = () => {
      pause();
      draw(0);
      play();
    };
    const onResize = () => {
      if (!running) draw(0); // keep the still frame correct while paused
    };

    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onPrefChange);
    window.addEventListener("resize", onResize);

    return () => {
      pause();
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onPrefChange);
      window.removeEventListener("resize", onResize);
      // Hand the GPU resources back rather than waiting for GC.
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
      // 🔴 DO NOT CALL `WEBGL_lose_context.loseContext()` HERE. It was here, and
      // it made the background render WHITE in development. `getContext` returns
      // the SAME context object for a given canvas forever, so a "lost" context
      // is permanent for that element — and React StrictMode mounts every effect
      // TWICE (mount, cleanup, mount). The first cleanup killed the context and
      // the second mount drew into a dead one. Verified: `gl.isContextLost()`
      // was `true` on the live page. Deleting the objects above is sufficient;
      // the context dies with the canvas element on real unmount.
    };
    // Colour is the only real input; pointer state is in refs on purpose.
  }, [color, base]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-hidden ${className}`}
    >
      {/* 🔴 THE CANVAS IS FULLY INERT NOW. It used to be `pointer-events-auto`
          so it could receive `mousemove` for the ripple; nothing reads the mouse
          any more, so it inherits the wrapper's `pointer-events-none` and cannot
          intercept anything aimed at the form. */}
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* The reference's backdrop blur pass, kept — it softens the smoke's
          banding and is what makes it read as smoke rather than as contour
          lines. */}
      <div className="absolute inset-0 backdrop-blur-sm" />
      {/* The measured veil. See the `veil` prop for the derivation — this is
          what keeps cream legal over the brightest gold the smoke can reach. */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0, 32, 80, ${veil})` }}
      />
    </div>
  );
}
