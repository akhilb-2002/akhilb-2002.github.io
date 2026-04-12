"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { Mail } from "lucide-react";
import gsap from "gsap";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const SPECIAL = new Set(["@", ".", "+", "_", "-"]);

interface ScrambleEmailProps {
  email: string;
}

export function ScrambleEmail({ email }: ScrambleEmailProps) {
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [revealed, setRevealed] = useState(false);
  const animating = useRef(false);

  useEffect(() => {
    spanRefs.current.forEach((span, i) => {
      if (!span) return;
      const c = email[i];
      span.textContent = SPECIAL.has(c)
        ? c
        : CHARS[Math.floor(Math.random() * CHARS.length)];
    });
  }, [email]);

  const handleClick = useCallback(() => {
    if (revealed) {
      window.location.href = `mailto:${email}`;
      return;
    }
    if (animating.current) return;
    animating.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        setRevealed(true);
        animating.current = false;
      },
    });

    email.split("").forEach((char, i) => {
      const span = spanRefs.current[i];
      if (!span) return;

      if (SPECIAL.has(char)) {
        span.textContent = char;
        return;
      }

      tl.to(
        {},
        {
          duration: 0.07,
          repeat: 5,
          ease: "none",
          onRepeat: () => {
            span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
          },
          onComplete: () => {
            span.textContent = char;
          },
        },
        i * 0.04
      );
    });
  }, [email, revealed]);

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
      title={revealed ? `Send email to ${email}` : "Click to reveal email"}
    >
      <Mail size={14} />
      <span>
        {email.split("").map((_, i) => (
          <span key={i} ref={(el) => { spanRefs.current[i] = el; }} />
        ))}
      </span>
    </button>
  );
}