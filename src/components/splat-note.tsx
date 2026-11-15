import { useId } from "react";
import { Caveat } from "next/font/google";

/**
 * A hand-written annotation ("this is a gaussian splat!" + a curved arrow pointing
 * at the portrait). Each line of text is "written" left to right and then the arrow
 * is drawn, using CSS animations in globals.css (.splat-note). Desktop: to the right
 * of the portrait, arrow pointing left. Mobile: under it, arrow pointing up.
 */

const caveat = Caveat({ subsets: ["latin"], weight: ["600"] });

type State = "show" | "gone";

// one line of text, revealed by a clip rect that grows left to right
function Line({ id, x, y, size, delay, dur, tilt = 0, children }: {
  id: string; x: number; y: number; size: number; delay: number; dur: number; tilt?: number; children: string;
}) {
  // tilt: a slight hand-written slant of the whole line, in degrees
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <clipPath id={id}>
        <rect className="ink-wipe" x={x - 4} y={y - size} width={size * children.length * 0.62 + 8} height={size * 1.5}
          style={{ animationDelay: `${delay}s`, animationDuration: `${dur}s` }} />
      </clipPath>
      <text x={x} y={y} fontSize={size} clipPath={`url(#${id})`} fill="currentColor">{children}</text>
    </g>
  );
}

function Stroke({ d, delay, dur, width = 2.2 }: { d: string; delay: number; dur: number; width?: number }) {
  return (
    <path className="ink-draw" d={d} pathLength={1} fill="none" stroke="currentColor" strokeWidth={width}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ animationDelay: `${delay}s`, animationDuration: `${dur}s` }} />
  );
}

const START = 0.9; // let the portrait start appearing first

// slight pen-ink wobble on the drawn strokes
function Rough({ id }: { id: string }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="3" />
      <feDisplacementMap in="SourceGraphic" scale="1.8" />
    </filter>
  );
}

export function SplatNote({ state }: { state: State }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div className={`splat-note ${caveat.className}`} data-state={state} aria-hidden="true">
      {/* desktop: right of the photo, arrow curling back to it */}
      <svg className="hidden md:block absolute left-[calc(100%-14px)] top-[14%] w-[190px] overflow-visible"
        viewBox="0 0 190 130">
        <Rough id={`${uid}r1`} />
        <g filter={`url(#${uid}r1)`}>
          <Line id={`${uid}a`} x={36} y={30} size={25} delay={START} dur={0.55} tilt={-3}>This is a</Line>
          <Line id={`${uid}b`} x={22} y={57} size={25} delay={START + 0.6} dur={0.85} tilt={-1.5}>gaussian splat!</Line>
        </g>
        <g filter={`url(#${uid}r1)`}>
          {/* a little underline flourish under "splat!" */}
          <Stroke d="M 118 64 C 135 61, 152 62, 168 60" delay={START + 1.45} dur={0.3} width={1.6} />
          {/* wobbly, uneven sweep back to the photo, then a one-stroke arrowhead */}
          <Stroke d="M 51 65 C 50.5 70, 52 74, 50 79.5 C 48 85, 49.5 88, 45 93.5 C 40.5 98.5, 34 99, 28 101.5 C 22 104, 16 102.5, 9 103.8"
            delay={START + 1.55} dur={0.6} />
          <Stroke d="M 19 94.5 C 15 98, 11 101.5, 8.2 104 C 12.8 105.2, 16.8 107.8, 19.8 112.5"
            delay={START + 2.15} dur={0.25} />
        </g>
      </svg>

      {/* mobile: under the photo, arrow pointing up */}
      <svg className="md:hidden absolute left-0 top-[calc(100%+2px)] w-full overflow-visible" viewBox="0 0 120 125">
        <Rough id={`${uid}r2`} />
        <g filter={`url(#${uid}r2)`}>
          <Line id={`${uid}c`} x={14} y={78} size={21} delay={START} dur={0.45} tilt={-3}>This is a</Line>
          <Line id={`${uid}d`} x={14} y={99} size={21} delay={START + 0.5} dur={0.5} tilt={-1.5}>gaussian</Line>
          <Line id={`${uid}e`} x={14} y={120} size={21} delay={START + 1.05} dur={0.4} tilt={-2.5}>splat!</Line>
        </g>
        <g filter={`url(#${uid}r2)`}>
          <Stroke d="M 40 61 C 36.5 56, 34 50, 36.5 43 C 39 36, 42.5 33, 46 27 C 49.5 21, 52.5 16.5, 58 12"
            delay={START + 1.55} dur={0.55} />
          <Stroke d="M 46.5 15 C 50.5 13.8, 54.5 12.8, 58.2 11.8 C 57.2 15.8, 57.5 20, 58.5 24.5"
            delay={START + 2.1} dur={0.25} />
        </g>
      </svg>
    </div>
  );
}
