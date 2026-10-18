"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE_LUX } from "@/lib/gsap";

/**
 * Scroll-triggered reveal for every `[data-reveal]` element inside the returned ref.
 * Optional `data-reveal="left" | "right" | "scale"` changes the entrance direction,
 * and `data-reveal-delay="0.2"` adds a per-element delay.
 * Disabled automatically when the user prefers reduced motion.
 */
export function useGsapReveal<T extends HTMLElement = HTMLDivElement>() {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        els.forEach((el) => {
          const kind = el.dataset.reveal;
          const from: gsap.TweenVars = { opacity: 0, y: 40 };
          if (kind === "left") Object.assign(from, { x: -50, y: 0 });
          if (kind === "right") Object.assign(from, { x: 50, y: 0 });
          if (kind === "scale") Object.assign(from, { scale: 0.92, y: 20 });
          gsap.from(el, {
            ...from,
            duration: 1.1,
            ease: EASE_LUX,
            delay: Number(el.dataset.revealDelay ?? 0),
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return scope;
}
