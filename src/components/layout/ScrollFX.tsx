"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger, MOTION_OK } from "@/lib/gsap";

/**
 * Page-wide scroll polish (no DOM output):
 *  - each section's content eases up slightly as it enters (scrubbed, so it follows the scroll smoothly),
 *  - decorative glows marked `data-depth` drift at different speeds for parallax depth,
 *  - trigger positions are recalculated once fonts and images have loaded, to avoid jumps.
 */
export function ScrollFX() {
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.utils.toArray<HTMLElement>("main > section:not(#top) > .container-x").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 56 },
          { y: 0, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "top 50%", scrub: 0.9 } },
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((el) => {
        const d = parseFloat(el.dataset.depth ?? "0.4");
        gsap.fromTo(
          el,
          { yPercent: -25 * d },
          { yPercent: 25 * d, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") window.setTimeout(refresh, 300);
    else window.addEventListener("load", refresh, { once: true });
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      mm.revert();
      window.removeEventListener("load", refresh);
    };
  }, []);

  return null;
}
