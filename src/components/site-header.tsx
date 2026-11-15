'use client';

import { useState } from "react";
import Link from "next/link";
import { aboutMe } from "@/data/aboutme";
import { TerminalWindow } from "@/components/terminal-window";

interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

// Links shown in the top bar, left to right.
const navLinks: NavLink[] = [
  { label: "Projects", href: "/#portfolio" },
  ...(aboutMe.cvUrl ? [{ label: "CV", href: aboutMe.cvUrl, external: true }] : []),
  ...(aboutMe.personalUrl ? [{ label: "Travel", href: aboutMe.personalUrl }] : []),
  ...(aboutMe.blogUrl ? [{ label: "Blog", href: aboutMe.blogUrl, external: true }] : []),
];

export function SiteHeader() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-black/5 bg-[#f0efea]/70 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-screen-lg items-center justify-between gap-4 px-8">
          <Link
            href="/"
            className="font-serif text-lg tracking-wide text-zinc-900 whitespace-nowrap"
          >
            {aboutMe.name}
          </Link>

          <nav className="flex items-center gap-5 sm:gap-7 overflow-x-auto">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors duration-300 whitespace-nowrap"
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => setIsTerminalOpen(true)}
              className="px-3 py-1.5 bg-zinc-800 text-white text-xs font-mono rounded-md hover:bg-zinc-700 transition-colors"
            >
              DEV
            </button>
          </nav>
        </div>
      </header>

      {isTerminalOpen && <TerminalWindow onClose={() => setIsTerminalOpen(false)} />}
    </>
  );
}
