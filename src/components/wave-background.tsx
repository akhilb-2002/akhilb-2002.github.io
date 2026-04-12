"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const PALETTE: [number, number, number][] = [
  [64,  224, 208],  // turquoise
  [147, 112, 219],  // violet
  [255, 105, 160],  // rose
  [72,  209, 142],  // mint
  [100, 149, 237],  // azure
  [255, 165,  80],  // amber
];
const RINGS_PER_DROP = 4;
const STAGGER_FRAMES = 7;
const BASE_SPEED = 0.7;
const PEAK_ALPHA = 0.28;

interface Ring {
  dropId: number;
  cx: number; cy: number;
  r: number;
  maxR: number;
  speed: number;
  countdown: number;
  color: [number, number, number];
}

interface Spark {
  x: number; y: number;
  life: number; maxLife: number;
  color: [number, number, number];
}

let dropCounter = 0;

function makeRings(x: number, y: number, W: number, H: number, startR = 0): Ring[] {
  const dx = Math.max(x, W - x);
  const dy = Math.max(y, H - y);
  const maxR = Math.sqrt(dx * dx + dy * dy);
  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const dropId = dropCounter++;

  return Array.from({ length: RINGS_PER_DROP }, (_, i) => ({
    dropId,
    cx: x, cy: y,
    r: startR,
    maxR,
    speed: BASE_SPEED + i * 0.08,
    countdown: i * STAGGER_FRAMES,
    color,
  }));
}

// Returns the two intersection points of two circles, or null if they don't intersect.
function circleIntersections(
  x1: number, y1: number, r1: number,
  x2: number, y2: number, r2: number,
): [[number, number], [number, number]] | null {
  const dx = x2 - x1, dy = y2 - y1;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0) return null;

  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const mx = x1 + (a * dx) / d;
  const my = y1 + (a * dy) / d;

  return [
    [mx + (h * dy) / d, my - (h * dx) / d],
    [mx - (h * dy) / d, my + (h * dx) / d],
  ];
}

export function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const rings: Ring[] = [];
    const sparks: Spark[] = [];
    let frame = 0;

    const demos: [number, number][] = [
      [W * 0.18, H * 0.28],
      [W * 0.72, H * 0.62],
      [W * 0.48, H * 0.12],
      [W * 0.88, H * 0.45],
      [W * 0.33, H * 0.78],
    ];
    for (const [x, y] of demos) {
      rings.push(...makeRings(x, y, W, H, Math.random() * 70 + 15));
    }

    const spawnAt = (x: number, y: number) => rings.push(...makeRings(x, y, W, H));
    const onClick = (e: MouseEvent) => spawnAt(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) spawnAt(t.clientX, t.clientY);
    };
    window.addEventListener("click", onClick);
    window.addEventListener("touchstart", onTouch, { passive: true });

    function checkCollisions() {
      const active = rings.filter(r => r.countdown === 0);
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          const a = active[i], b = active[j];
          // Skip rings from the same droplet — they share a center and never truly cross
          if (a.dropId === b.dropId) continue;

          const pts = circleIntersections(a.cx, a.cy, a.r, b.cx, b.cy, b.r);
          if (!pts) continue;

          // Spawn a flash spark at each intersection point (capped, low probability)
          for (const [px, py] of pts) {
            if (px < 0 || px > W || py < 0 || py > H) continue;
            if (sparks.length < 120 && Math.random() < 0.25) {
              // Blend both ring colors for the spark
              const col: [number, number, number] = Math.random() < 0.5 ? a.color : b.color;
              sparks.push({ x: px, y: py, life: 0, maxLife: Math.floor(18 + Math.random() * 22), color: col });
            }
          }
        }
      }
    }

    const tick = gsap.ticker.add(() => {
      frame++;
      ctx.clearRect(0, 0, W, H);

      // Update + draw rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        if (ring.countdown > 0) { ring.countdown--; continue; }

        ring.r += ring.speed;
        const progress = ring.r / ring.maxR;
        if (progress >= 1) { rings.splice(i, 1); continue; }

        const alpha = PEAK_ALPHA * Math.pow(1 - progress, 1.5);
        const [r, g, b] = ring.color;
        ctx.beginPath();
        ctx.arc(ring.cx, ring.cy, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Check collisions every 2 frames
      if (frame % 2 === 0) checkCollisions();

      // Draw + age sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life++;
        if (s.life >= s.maxLife) { sparks.splice(i, 1); continue; }

        const t = s.life / s.maxLife;
        // Brief bright flash that quickly fades
        const alpha = (1 - t) * 0.75;
        const radius = 2.5 * (1 - t * 0.6);
        const [r, g, b] = s.color;

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.shadowColor = `rgba(${r},${g},${b},${alpha * 0.9})`;
        ctx.shadowBlur = 7;
        ctx.fill();
        ctx.restore();
      }
    });

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", onResize);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
