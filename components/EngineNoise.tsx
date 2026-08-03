"use client";

import { useEffect, useRef } from "react";

/**
 * ANIMATED FILM GRAIN — a canvas noise field, on the client's instruction.
 *
 * ---------------------------------------------------------------------------
 * 🔴 REBUILT 2026-08-02 ON TWO INSTRUCTIONS: "decrease the noise, I want it too
 * little" and "the noise is not 4k, I want it smooth and perfect".
 *
 * WHAT WAS WRONG. The previous build drew a 512x512 canvas and let CSS stretch
 * it over the section with `image-rendering: pixelated`. On a ~1400x800 section
 * at 2x DPR that is 2800x1600 device pixels being filled from 512x512 samples —
 * ONE NOISE SAMPLE COVERING ~5.5 DEVICE PIXELS, painted as a hard square. That
 * is not film grain, it is a mosaic. The reference snippet has the identical
 * defect (1024 upscaled to 100vw/100vh); it is simply less obvious there.
 *
 * 🔴 THE FIX IS 1:1 WITH THE DEVICE PIXEL, NOT A BIGGER UPSCALE. Grain reads as
 * grain when one noise sample is one physical pixel. So the canvas backing store
 * is now sized to the element's box MULTIPLIED BY devicePixelRatio, and nothing
 * is upscaled at all — `image-rendering` is back to auto because there is no
 * resample left to control. On a 2x display that is genuinely per-device-pixel
 * grain; the finest a screen can show.
 *
 * ---------------------------------------------------------------------------
 * §COST — WHY GOING 1:1 IS NOT 17x MORE EXPENSIVE
 *
 * Filling 2800x1600 with Math.random() per pixel would be 4.5M randoms a frame,
 * ~54M/second at 12fps. That is worse than the reference's own ~31M and would
 * not ship.
 *
 * So the noise is generated into a SMALL TILE at device resolution (256x256 =
 * 65,536 samples) and the section is filled with that tile as a repeating
 * CanvasPattern. The tile is device-pixel-accurate, so the grain the user sees
 * is 1:1 and fine; the fill is a blit, which is the GPU/memcpy path rather than
 * the per-pixel JS path.
 *
 *   per frame:  65,536 random calls  +  one pattern fill
 *   per second: ~786,000 randoms at 12fps
 *
 * against the previous build's ~3.1M and the reference's ~31M. It is FOUR TIMES
 * CHEAPER THAN THE THING IT REPLACES WHILE BEING ~5x FINER.
 *
 * 🔴 THE TILE SEAM IS ANSWERED BY MOVING IT, NOT BY ENLARGING IT. A repeating
 * 256px tile of white noise has no visible structure to repeat — but a FIXED
 * repeat can still read as a faint standing pattern. The pattern origin is
 * translated by a fresh random offset every frame, so any seam is somewhere
 * different each time and never accumulates into a perceptible grid.
 *
 * ---------------------------------------------------------------------------
 * §ALPHA 6, DOWN FROM 16 — the instruction was "too little", and 16/255 was the
 * reference snippet's value carried over unexamined. 6/255 is 2.4% opacity: the
 * grain sits under the copy as surface texture rather than as an effect. This is
 * also a CONTRAST GAIN, not a cost — every AA figure recorded for this section
 * was measured against a WHITE noise pixel as the worst case, and that worst
 * case just got 2.7x weaker. The numbers on `.engine-surface` in globals.css all
 * still hold, with more headroom than they were solved for.
 *
 * KEPT FROM THE PREVIOUS BUILD, all four absent from the reference:
 *   - time-throttled to ~12fps (refresh-rate independent, unlike `frame % 2`)
 *   - IntersectionObserver stops the loop when the section is off-screen
 *   - reduced motion draws ONE still frame and never loops (the grain is part
 *     of the surface, so removing it would change what the section looks like)
 *   - bounded to the parent by `absolute inset-0`, never 100vw/100vh
 */
export default function EngineNoise({
  className,
  /** 0–255. 6 is ~2.4% — deliberately faint. */
  alpha = 6,
  /** Redraws per second. Film grain reads more filmic under-cranked. */
  fps = 12,
}: {
  className?: string;
  alpha?: number;
  fps?: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    /** Tile edge in DEVICE pixels. 65,536 samples per frame. */
    const TILE = 256;
    const FRAME_MS = 1000 / fps;
    /** 2 is the ceiling: beyond it the grain is finer than the eye resolves
     *  and the fill area grows quadratically for nothing. */
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // The noise source. Device-resolution, so one sample is one physical pixel.
    const tile = document.createElement("canvas");
    tile.width = TILE;
    tile.height = TILE;
    const tctx = tile.getContext("2d", { alpha: true });
    if (!tctx) return;

    // Allocated ONCE and rewritten in place — no per-frame garbage.
    const image = tctx.createImageData(TILE, TILE);
    const data = image.data;

    const draw = () => {
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = alpha;
      }
      tctx.putImageData(image, 0, 0);

      const w = canvas.width;
      const h = canvas.height;
      if (!w || !h) return;

      const pattern = ctx.createPattern(tile, "repeat");
      if (!pattern) return;

      // A fresh origin each frame, so the tile seam never stands still.
      const ox = Math.floor(Math.random() * TILE);
      const oy = Math.floor(Math.random() * TILE);

      // `copy` replaces the whole surface — no clearRect, and no compounding
      // of translucent layers frame over frame.
      ctx.globalCompositeOperation = "copy";
      ctx.setTransform(1, 0, 0, 1, ox, oy);
      ctx.fillStyle = pattern;
      ctx.fillRect(-ox, -oy, w, h);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    /** Backing store follows the element's real box at device resolution. */
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      draw(); // a resize clears the canvas, so repaint immediately
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let last = 0;
    let running = false;

    const loop = (t: number) => {
      if (t - last >= FRAME_MS) {
        draw();
        last = t;
      }
      raf = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduce.matches) return;
      running = true;
      raf = window.requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      window.cancelAnimationFrame(raf);
    };

    // One still frame always, so the texture exists before the loop starts and
    // remains if the loop never starts (reduced motion, or off-screen at load).
    resize();

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(resize);
      ro.observe(canvas);
    }
    window.addEventListener("resize", resize);

    // Only animate while the section is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => (entry?.isIntersecting ? start() : stop()),
      { rootMargin: "120px" },
    );
    io.observe(canvas);

    // If the user flips the OS setting mid-session, honour it immediately.
    const onPrefChange = () => (reduce.matches ? stop() : start());
    reduce.addEventListener("change", onPrefChange);

    return () => {
      io.disconnect();
      ro?.disconnect();
      window.removeEventListener("resize", resize);
      reduce.removeEventListener("change", onPrefChange);
      stop();
    };
  }, [alpha, fps]);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
