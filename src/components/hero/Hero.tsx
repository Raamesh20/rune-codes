"use client";

import { useRef } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { whatsappLink } from "@/lib/site";
import { StageMount } from "@/components/three/StageMount";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { Terminal } from "./Terminal";


export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });
        tl.fromTo("[data-hero='pill']", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 })
          .fromTo("[data-hero='title']", { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.1)
          .from("[data-letter]", { yPercent: 115, rotateX: -70, opacity: 0, duration: 1.3, stagger: 0.045, transformOrigin: "50% 100%" }, 0.15)
          .fromTo("[data-hero='sub']", { opacity: 0, y: 26, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1 }, 0.6)
          .fromTo("[data-hero='copy']", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, 0.8)
          .fromTo("[data-hero='cta']", { opacity: 0, y: 18, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.1 }, 1.0)
          .fromTo("[data-hero='visual']", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.3)
          .fromTo("[data-hero='terminal']", { opacity: 0, y: 50, rotateX: 18 }, { opacity: 1, y: 0, rotateX: 0, duration: 1.4 }, 0.9)
          .fromTo("[data-hero='cue']", { opacity: 0 }, { opacity: 1, duration: 1 }, 1.6);


        // Scroll-linked parallax as the hero leaves.
        const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        gsap.to("[data-parallax='copy']", { yPercent: -18, opacity: 0.2, ease: "none", scrollTrigger: st });
        gsap.to("[data-parallax='visual']", { yPercent: -8, ease: "none", scrollTrigger: st });
        gsap.to("[data-parallax='terminal']", { yPercent: -30, ease: "none", scrollTrigger: st });
      });
      // Reduced motion: everything visible immediately.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-hero-anim]", { opacity: 1 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28 sm:pt-32 lg:pb-20">
      {/* Backdrop: CSS lighting is the fallback; WebGL scene fades in on top when available. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(66,133,255,0.22),transparent_60%),radial-gradient(ellipse_60%_50%_at_10%_80%,rgba(139,92,246,0.16),transparent_60%),radial-gradient(ellipse_50%_40%_at_90%_90%,rgba(39,216,255,0.10),transparent_60%)]" />
        <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_30%,transparent_75%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>

      <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-6">
        {/* Copy */}
        <div data-parallax="copy" className="relative z-20 lg:col-span-6">
          <p data-hero="pill" data-hero-anim className="inline-flex items-center gap-2.5 rounded-full border border-cyan/30 bg-cyan/[0.07] px-3.5 py-1.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.2em] text-cyan">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-cyan" />
            Now enrolling students
          </p>

          <h1 id="hero-title" className="mt-6 [perspective:800px]">
            <span data-hero="title" data-hero-anim className="block font-display text-[clamp(2.5rem,14.5vw,6.5rem)] lg:text-[clamp(4.6rem,7.6vw,8rem)] font-bold leading-[0.86] tracking-[-0.04em]">
              <span className="sr-only">RUNE CODES</span>
              <span aria-hidden className="inline-block whitespace-nowrap">
                {"RUNE".split("").map((c, i) => (
                  <span key={`a${i}`} data-letter className="inline-block">{c}</span>
                ))}
                <span className="inline-block w-[0.22em]" />
                {"CODES".split("").map((c, i) => (
                  <span key={`b${i}`} data-letter className="text-gradient inline-block">{c}</span>
                ))}
              </span>
            </span>
            <span data-hero="sub" data-hero-anim className="mt-3 block font-display text-[clamp(1.6rem,4.6vw,2.6rem)] lg:text-[clamp(2rem,3.2vw,3rem)] font-medium tracking-tight text-mist">
              Coding <span className="text-snow">Academy</span>
              <span className="ml-3 inline-block h-[0.12em] w-[clamp(2.5rem,8vw,6rem)] translate-y-[-0.3em] rounded-full bg-gradient-to-r from-blue via-cyan to-violet" />
            </span>
          </h1>

          <div className="mt-7 max-w-xl space-y-4 text-base leading-relaxed text-mist sm:text-lg">
            <p data-hero="copy" data-hero-anim>
              Empowering young minds to unlock their tech potential through fun, hands-on programming lessons.
            </p>
            <p data-hero="copy" data-hero-anim className="text-snow/90">
              We don&apos;t just teach code — we spark curiosity, build confidence, and turn ideas into real creations.
            </p>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a data-hero="cta" data-hero-anim href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-primary group">
              <WhatsAppIcon className="h-4 w-4" />
              Enquire via WhatsApp
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <a data-hero="cta" data-hero-anim href="#programs" className="btn btn-ghost">
              View programs
            </a>
          </div>

          <ul data-hero="copy" data-hero-anim className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.16em] text-dim">
            <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-cyan" />Scratch · Ages 7+</li>
            <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-blue" />Python · Ages 11+</li>
            <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-violet" />C++ · Ages 12+</li>
          </ul>
        </div>

        {/* Visual */}
        <div data-hero="visual" data-hero-anim className="relative z-10 mx-auto w-full max-w-lg lg:col-span-6 lg:h-[min(76vh,680px)] lg:max-w-none">
          <div data-parallax="visual" className="relative aspect-[4/5] w-full sm:aspect-square lg:absolute lg:-inset-x-[10%] lg:-inset-y-[7%] lg:aspect-auto lg:w-auto">
            <StageMount />
          </div>
          <div data-parallax="terminal" className="relative z-20 -mt-10 sm:-mt-16 lg:absolute lg:bottom-[2%] lg:left-0 lg:mt-0 lg:w-[min(54%,21rem)]">
            <div data-hero="terminal" data-hero-anim className="[perspective:900px]">
              <Terminal />
            </div>
          </div>
        </div>
      </div>

      <a data-hero="cue" data-hero-anim href="#about" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-dim hover:text-snow md:flex">
        Scroll to explore
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}
