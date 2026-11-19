"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { NAV_LINKS, whatsappLink, SITE } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { Logo } from "@/components/ui/Logo";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const lastY = useRef(0);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // Glass state + hide-on-scroll-down / reveal-on-scroll-up.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 480 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 480) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in view.
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.id);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Mobile menu: lock scroll, close on Escape, keep focus inside.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = panel.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); menuBtn.current?.focus(); }
      if (e.key === "Tab" && panel.current) {
        const f = Array.from(panel.current.querySelectorAll<HTMLElement>("a,button"));
        if (!f.length) return;
        const [a, b] = [f[0], f[f.length - 1]];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
        else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${hidden && !open ? "-translate-y-[120%]" : "translate-y-0"}`}
    >
      <div className="container-x pt-3 sm:pt-4">
        <nav
          aria-label="Primary"
          className={`flex items-center justify-between gap-4 rounded-full py-2 pl-4 pr-2 transition-all duration-500 ${scrolled || open ? "glass shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]" : "border border-transparent bg-transparent"}`}
        >
          <a href="#top" className="flex items-center gap-2.5 rounded-full" aria-label={`${SITE.name}, back to top`}>
            <Logo className="h-8 w-11" />
            <span className="whitespace-nowrap font-display text-[0.95rem] font-bold tracking-[0.18em]">RUNE CODES</span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  aria-current={active === l.id ? "true" : undefined}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors ${active === l.id ? "text-snow" : "text-mist hover:text-snow"}`}
                >
                  {active === l.id && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/[0.07] ring-1 ring-white/10" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                  )}
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm hidden sm:inline-flex"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <button
              ref={menuBtn}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu-backdrop"
            aria-hidden
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 -z-10 h-[100dvh] bg-ink/85 backdrop-blur-sm lg:hidden"
          />
        )}
        {open && (
          <motion.div
            key="menu-panel"
            id="mobile-menu"
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="container-x mt-2 lg:hidden"
          >
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-navy p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
              <ul>
                {NAV_LINKS.map((l, i) => (
                  <motion.li
                    key={l.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <a
                      href={`#${l.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-4 py-4 font-display text-2xl font-semibold hover:bg-white/5"
                    >
                      <span><span className="mr-3 font-mono text-xs text-cyan">0{i + 1}</span>{l.label}</span>
                      <ArrowUpRight className="h-5 w-5 text-mist" />
                    </a>
                  </motion.li>
                ))}
              </ul>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="btn btn-whatsapp mt-2 w-full"
              >
                <WhatsAppIcon className="h-4 w-4" /> Enquire via WhatsApp
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
