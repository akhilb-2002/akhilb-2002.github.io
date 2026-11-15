'use client';

import { useEffect, useRef, useState } from "react";

/**
 * Renders a portrait stored as fitted 2D Gaussians (made by tools/gaussian-portrait)
 * instead of a photo. File format: "GSP1", uint32 count, float32 width, float32 height,
 * then per Gaussian 9 float32: x, y, cov_xx, cov_xy, cov_yy, r, g, b, opacity,
 * sorted back-to-front.
 *
 * It is drawn borderless: the canvas extends PAD px past the photo, so the raw
 * Gaussians along the edges show instead of being cut by a frame.
 *
 * It starts as a plain colour block (the same Gaussians, all in one colour). Clicking
 * fades the real colours in from the centre outwards until they form the portrait
 * (a second click reverses it). While it is a colour block, nearby Gaussians drift
 * away from the cursor; the revealed photo stays still so it stays sharp.
 */

interface GaussianPortraitProps {
  src: string;
  alt: string;
  className?: string;
}

const FLOATS = 9;
const BG = [0xe4 / 255, 0xe1 / 255, 0xd8 / 255]; // starting colour block
const PAD = 24; // fitted px drawn around the photo, so the edge can spill out loosely
const FEATHER = 20; // fitted px inside the photo where the soft edge fade begins
const ASSEMBLE_MS = 2600; // whole animation
const MAX_DELAY = 0.55; // latest start of a Gaussian, as a fraction of the animation
const FLIGHT = 1 - MAX_DELAY; // how long each Gaussian takes to fly in
const START_SCALE = 1; // Gaussians start as small dots and grow to full size
const HOVER_RADIUS = 18; // fitted-image px
const HOVER_PUSH = 6; // fitted-image px

// Like gsplat's eps2d: every Gaussian is widened by this variance in *screen* pixels
// and its opacity scaled to keep its total weight, so thin, hair-like Gaussians
// stay smooth instead of breaking into dashes when drawn smaller than they were fitted.
const AA_EPS = 0.3;

const f = (n: number) => n.toFixed(4);

const VERT = `
attribute vec2 aCorner;
attribute vec2 aCenter;
attribute vec3 aCov;
attribute vec4 aColor;
attribute vec3 aStart; // scattered start position (xy) + delay (z)
uniform vec2 uViewport;
uniform float uScale;
uniform float uT;      // 0 = colour block, 1 = assembled
uniform float uLayer;  // 0 = plain-colour layer (fades out), 1 = real colours (fade in)
uniform vec3 uBG;
uniform vec3 uMouse;   // x, y in fitted px, z = strength 0..1
varying vec2 vOffset;
varying vec3 vConic;
varying vec4 vColor;
void main() {
  float p = clamp((uT - aStart.z) / ${f(FLIGHT)}, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - p, 3.0);
  float k = uLayer > 0.5 ? e : 1.0 - e;
  float s = uLayer > 0.5 ? mix(${f(START_SCALE)}, 1.0, e) : 1.0;

  vec3 covPx = aCov * s * s * uScale * uScale;  // in screen pixels
  float det0 = covPx.x * covPx.z - covPx.y * covPx.y;
  vec3 cov = covPx + vec3(${f(AA_EPS)}, 0.0, ${f(AA_EPS)});
  float det = cov.x * cov.z - cov.y * cov.y;
  float aa = sqrt(max(det0, 0.0) / det);
  vConic = vec3(cov.z, -cov.y, cov.x) / det;
  float mid = 0.5 * (cov.x + cov.z);
  float lambda = mid + sqrt(max(0.1, mid * mid - det));
  float radius = 3.0 * sqrt(lambda);

  vec2 center = mix(aStart.xy, aCenter, e);
  vec2 d = center - uMouse.xy;
  float fall = exp(-dot(d, d) / (2.0 * ${f(HOVER_RADIUS)} * ${f(HOVER_RADIUS)}));
  center += normalize(d + vec2(1e-4)) * ${f(HOVER_PUSH)} * fall * uMouse.z;

  vOffset = aCorner * radius;
  vColor = vec4(uLayer > 0.5 ? aColor.rgb : uBG, aColor.a * k * aa);
  vec2 px = (center + ${f(PAD)}) * uScale + vOffset;
  gl_Position = vec4(px / uViewport * 2.0 - 1.0, 0.0, 1.0);
  gl_Position.y = -gl_Position.y;
  if (k <= 0.0) gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // invisible in this layer: off screen
}`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vOffset;
varying vec3 vConic;
varying vec4 vColor;
void main() {
  float sigma = 0.5 * (vConic.x * vOffset.x * vOffset.x + vConic.z * vOffset.y * vOffset.y)
              + vConic.y * vOffset.x * vOffset.y;
  float alpha = min(0.999, vColor.a * exp(-sigma));
  if (sigma < 0.0 || alpha < 1.0 / 255.0) discard;
  gl_FragColor = vec4(vColor.rgb * alpha, alpha);
}`;

const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
// Seeded so the scatter pattern is the same on every visit.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Per Gaussian: start position (its own spot, so nothing flies in) and when it
// appears (centre first, then outwards).
function scatter(data: Float32Array, count: number, W: number, H: number) {
  const rand = mulberry32(7);
  const out = new Float32Array(count * 3);
  const maxR = Math.hypot(W / 2, H / 2);
  for (let i = 0; i < count; i++) {
    const x = data[i * FLOATS], y = data[i * FLOATS + 1];
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    const fromCentre = Math.hypot(x - W / 2, y - H / 2) / maxR;
    out[i * 3 + 2] = MAX_DELAY * Math.min(1, 0.6 * fromCentre + 0.4 * rand());
  }
  return out;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "shader error");
  }
  return shader;
}

type Renderer = (t: number, mx: number, my: number, hover: number) => void;

function webglRenderer(
  canvas: HTMLCanvasElement, data: Float32Array, start: Float32Array, count: number, W: number,
): Renderer {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
  if (!gl) throw new Error("no webgl");

  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "link error");
  }
  gl.useProgram(program);

  // 4 vertices per Gaussian: corner (2) + center (2) + cov (3) + color (4) + start (3)
  const STRIDE = 14;
  const verts = new Float32Array(count * 4 * STRIDE);
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (let i = 0; i < count; i++) {
    const g = data.subarray(i * FLOATS, i * FLOATS + FLOATS);
    const st = start.subarray(i * 3, i * 3 + 3);
    for (let c = 0; c < 4; c++) {
      const o = (i * 4 + c) * STRIDE;
      verts[o] = corners[c][0];
      verts[o + 1] = corners[c][1];
      verts.set(g, o + 2);
      verts.set(st, o + 11);
    }
  }
  // 16-bit indices are universally supported; draw in chunks of 16k Gaussians
  const PER_DRAW = 16383;
  const indices = new Uint16Array(Math.min(count, PER_DRAW) * 6);
  for (let i = 0; i < indices.length / 6; i++) {
    indices.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  const attrs: [string, number, number][] = [
    ["aCorner", 2, 0], ["aCenter", 2, 2], ["aCov", 3, 4], ["aColor", 4, 7], ["aStart", 3, 11],
  ];
  const bindAttrs = (firstGaussian: number) => {
    for (const [name, size, offset] of attrs) {
      const loc = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, STRIDE * 4, (firstGaussian * 4 * STRIDE + offset) * 4);
    }
  };

  const uViewport = gl.getUniformLocation(program, "uViewport");
  const uScale = gl.getUniformLocation(program, "uScale");
  const uT = gl.getUniformLocation(program, "uT");
  const uMouse = gl.getUniformLocation(program, "uMouse");
  const uLayer = gl.getUniformLocation(program, "uLayer");
  gl.uniform3f(gl.getUniformLocation(program, "uBG"), BG[0], BG[1], BG[2]);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied "over", back to front

  return (t, mx, my, hover) => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0); // transparent: the page shows around the Gaussians
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uViewport, canvas.width, canvas.height);
    gl.uniform1f(uScale, canvas.width / (W + 2 * PAD));
    gl.uniform1f(uT, t);
    gl.uniform3f(uMouse, mx, my, hover);
    for (const layer of [0, 1]) {
      if ((layer === 0 && t >= 1) || (layer === 1 && t <= 0)) continue;
      gl.uniform1f(uLayer, layer);
      for (let first = 0; first < count; first += PER_DRAW) {
        bindAttrs(first);
        gl.drawElements(gl.TRIANGLES, Math.min(PER_DRAW, count - first) * 6, gl.UNSIGNED_SHORT, 0);
      }
    }
  };
}

// Fallback without WebGL: each Gaussian is a unit radial gradient mapped onto its
// ellipse with the Cholesky factor of its covariance. Same animation maths as the shader.
function canvas2dRenderer(
  canvas: HTMLCanvasElement, data: Float32Array, start: Float32Array, count: number, W: number,
): Renderer {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d canvas");
  const STOPS = [0, 0.5, 1, 1.5, 2, 2.5, 3];
  const toRgb = (c: number[]) => c.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255)).join(",");
  const gradient = (rgb: string, opacity: number) => {
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 3);
    for (const r of STOPS) {
      const a = r === 3 ? 0 : Math.min(0.999, opacity * Math.exp(-0.5 * r * r));
      grad.addColorStop(r / 3, `rgba(${rgb},${a.toFixed(4)})`);
    }
    return grad;
  };
  const bgRgb = toRgb(BG);
  const layers = [0, 1].map((layer) => Array.from({ length: count }, (_, i) => {
    const g = data.subarray(i * FLOATS, i * FLOATS + FLOATS);
    return gradient(layer ? toRgb([g[5], g[6], g[7]]) : bgRgb, g[8]);
  }));
  const twoR2 = 2 * HOVER_RADIUS * HOVER_RADIUS;

  return (t, mx, my, hover) => {
    const sc = canvas.width / (W + 2 * PAD);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const layer of [0, 1]) for (let i = 0; i < count; i++) {
      const p = Math.min(1, Math.max(0, (t - start[i * 3 + 2]) / FLIGHT));
      const e = easeOutCubic(p);
      const k = layer ? e : 1 - e;
      if (k <= 0) continue;
      const s = layer ? START_SCALE + (1 - START_SCALE) * e : 1;
      const o = i * FLOATS;
      let x = start[i * 3] + (data[o] - start[i * 3]) * e;
      let y = start[i * 3 + 1] + (data[o + 1] - start[i * 3 + 1]) * e;
      if (hover > 0) {
        const dx = x - mx, dy = y - my;
        const len = Math.hypot(dx, dy) || 1;
        const push = HOVER_PUSH * Math.exp(-(dx * dx + dy * dy) / twoR2) * hover;
        x += (dx / len) * push;
        y += (dy / len) * push;
      }
      // covariance in screen pixels, widened for anti-aliasing (see AA_EPS)
      const k2 = s * s * sc * sc;
      const a0 = data[o + 2] * k2, b = data[o + 3] * k2, c0 = data[o + 4] * k2;
      const a = a0 + AA_EPS, c = c0 + AA_EPS;
      const aa = Math.sqrt(Math.max(a0 * c0 - b * b, 0) / (a * c - b * b));
      const l11 = Math.sqrt(a);
      const l21 = b / l11;
      const l22 = Math.sqrt(Math.max(c - l21 * l21, 1e-6));
      ctx.setTransform(l11, l21, 0, l22, (x + PAD) * sc, (y + PAD) * sc);
      ctx.globalAlpha = k * aa;
      ctx.fillStyle = layers[layer][i];
      ctx.fillRect(-3, -3, 6, 6);
    }
  };
}

export function GaussianPortrait({ src, alt, className }: GaussianPortraitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ W: 200, H: 280 });
  const [failed, setFailed] = useState(false);
  const [shown, setShown] = useState(false);
  const shownRef = useRef(false); // survives clicks made before the file loads
  const setShownRef = useRef<(shown: boolean) => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let raf = 0;
    const cleanups: (() => void)[] = [];

    (async () => {
      const buf = await fetch(src).then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.arrayBuffer();
      });
      if (cancelled) return;
      const view = new DataView(buf);
      const magic = String.fromCharCode(...new Uint8Array(buf, 0, 4));
      if (magic !== "GSP1") throw new Error("not a GSP1 file");
      const count = view.getUint32(4, true);
      const W = view.getFloat32(8, true);
      const H = view.getFloat32(12, true);
      const data = new Float32Array(buf.slice(16, 16 + count * FLOATS * 4));
      const start = scatter(data, count, W, H);
      setSize({ W, H });

      let render: Renderer;
      try {
        render = webglRenderer(canvas, data, start, count, W);
      } catch (err) {
        console.warn("GaussianPortrait: WebGL unavailable, using 2D canvas", err);
        render = canvas2dRenderer(canvas, data, start, count, W);
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const state = {
        t: shownRef.current ? 1 : 0,
        target: shownRef.current ? 1 : 0,
        last: -1,
        mouse: [W / 2, H / 2],
        hover: 0,
        hoverTarget: 0,
      };

      const draw = () => {
        const dpr = window.devicePixelRatio || 1;
        const w = Math.round(canvas.clientWidth * dpr);
        const h = Math.round(canvas.clientHeight * dpr);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        render(state.t, state.mouse[0], state.mouse[1], state.hover);
      };

      // animate only while something is changing
      const tick = (now: number) => {
        raf = 0;
        let busy = false;
        if (state.t !== state.target) {
          const dt = state.last < 0 ? 16 : now - state.last;
          const step = dt / ASSEMBLE_MS;
          state.t = state.target > state.t
            ? Math.min(state.target, state.t + step)
            : Math.max(state.target, state.t - step);
          busy = state.t !== state.target;
        }
        state.last = busy ? now : -1;
        const dh = state.hoverTarget - state.hover;
        if (Math.abs(dh) > 0.01) {
          state.hover += dh * 0.12;
          busy = true;
        } else {
          state.hover = state.hoverTarget;
        }
        draw();
        if (busy) raf = requestAnimationFrame(tick);
      };
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(tick);
      };

      draw();

      // click assembles the portrait (and scatters it again)
      setShownRef.current = (shown) => {
        state.target = shown ? 1 : 0;
        if (shown) state.hoverTarget = 0; // keep the revealed photo undistorted
        if (reduceMotion) state.t = state.target;
        kick();
      };
      cleanups.push(() => {
        setShownRef.current = () => {};
      });

      if (!reduceMotion) {
        const onMove = (e: PointerEvent) => {
          const r = canvas.getBoundingClientRect();
          state.mouse = [
            ((e.clientX - r.left) / r.width) * (W + 2 * PAD) - PAD,
            ((e.clientY - r.top) / r.height) * (H + 2 * PAD) - PAD,
          ];
          state.hoverTarget = state.target === 0 ? 1 : 0; // only the colour block reacts
          kick();
        };
        const onLeave = () => {
          state.hoverTarget = 0;
          kick();
        };
        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          canvas.removeEventListener("pointermove", onMove);
          canvas.removeEventListener("pointerleave", onLeave);
        });
      }

      const ro = new ResizeObserver(() => kick());
      ro.observe(canvas);
      cleanups.push(() => ro.disconnect());
    })().catch((err) => {
      console.error("GaussianPortrait: could not render", src, err);
      if (!cancelled) setFailed(true);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
    };
  }, [src]);

  // Wide soft edge: fades from FEATHER px inside the photo to nothing at the canvas
  // edge, eased so most of the fade happens near the photo and the untrained
  // Gaussians outside it only show as a faint haze.
  const edge = (dir: string, total: number) => {
    const pct = (px: number) => (px / (total + 2 * PAD)) * 100;
    const span = PAD + FEATHER;
    const alphas = [0, 0.03, 0.12, 0.3, 0.55, 0.8, 1];
    const near = alphas.map((a, i) => `rgba(0,0,0,${a}) ${pct((span * i) / (alphas.length - 1))}%`);
    const far = alphas
      .map((a, i) => `rgba(0,0,0,${a}) ${100 - pct((span * i) / (alphas.length - 1))}%`)
      .reverse();
    return `linear-gradient(${dir}, ${[...near, ...far].join(", ")})`;
  };
  const mask = `${edge("to right", size.W)}, ${edge("to bottom", size.H)}`;

  const toggle = () => {
    const next = !shownRef.current; // ref, so rapid clicks never act on a stale render
    shownRef.current = next;
    setShown(next);
    setShownRef.current(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={shown}
      aria-label={`${alt}: ${shown ? "click to hide" : "click to reveal"}`}
      title={shown ? "Click to hide" : "Click to reveal"}
      className={`group relative block w-full cursor-pointer p-0 border-0 bg-transparent ${className ?? ""}`}
      style={{ aspectRatio: `${size.W} / ${size.H}` }}
    >
      {/* larger than the button by PAD on every side, so the edges can spill out */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-failed={failed || undefined}
        style={{
          position: "absolute",
          left: `${(-PAD / size.W) * 100}%`,
          top: `${(-PAD / size.H) * 100}%`,
          width: `${((size.W + 2 * PAD) / size.W) * 100}%`,
          height: `${((size.H + 2 * PAD) / size.H) * 100}%`,
          display: "block",
          maskImage: mask,
          WebkitMaskImage: mask,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      <span
        className={`pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/90 backdrop-blur-sm transition-opacity duration-500 ${
          shown ? "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" : "opacity-100"
        }`}
      >
        {shown ? "Click to hide" : "Click to reveal"}
      </span>
    </button>
  );
}
