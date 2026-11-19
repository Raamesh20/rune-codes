"use client";

import { useSyncExternalStore } from "react";
import { ArrowUp } from "lucide-react";
import { NAV_LINKS, SITE, whatsappLink, mailtoLink } from "@/lib/site";
import { Logo } from "@/components/ui/Logo";
import { InstagramIcon, LinkedInIcon, FacebookIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";

const noop = () => () => {};

/** Current year computed on the client so it never goes stale in a cached build. */
function useYear() {
  return useSyncExternalStore(noop, () => new Date().getFullYear(), () => null);
}

export function Footer() {
  const year = useYear();
  return (
    <footer className="relative border-t border-white/10 pt-16">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
      <div className="container-x">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <Logo className="h-10 w-14" />
              <div>
                <p className="font-display font-bold tracking-[0.14em]">RUNE CODES</p>
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-dim">Coding Academy</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-mist">{SITE.tagline}</p>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm mt-6">
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp us<span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-dim">Quick links</p>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.id}><a href={`#${l.id}`} className="text-mist transition hover:text-snow">{l.label}</a></li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-dim">Contact</p>
            <ul className="mt-4 space-y-2.5 text-mist">
              <li><a href={SITE.phoneHref} className="hover:text-snow">{SITE.phoneDisplay}</a></li>
              <li><a href={mailtoLink("Hello Rune Codes")} className="break-all hover:text-snow">{SITE.email}</a></li>
            </ul>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Social media">
              <li>
                <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-mist hover:border-cyan/50 hover:text-snow">
                  <InstagramIcon className="h-4 w-4" /> {SITE.instagramHandle}<span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
              <li className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-mist"><LinkedInIcon className="h-4 w-4" /> LinkedIn: {SITE.linkedinName}</li>
              <li className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-mist"><FacebookIcon className="h-4 w-4" /> Facebook: {SITE.facebookName}</li>
            </ul>
          </div>
        </div>

        <p aria-hidden className="mt-16 select-none text-center font-display text-[clamp(3rem,15vw,12rem)] font-bold leading-none tracking-[-0.05em] text-transparent [-webkit-text-stroke:1px_rgba(148,163,184,0.18)]">
          RUNE CODES
        </p>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-sm text-dim sm:flex-row">
          <p>© {year ?? ""} {SITE.fullName.toUpperCase()}. All rights reserved.</p>
          <a href="#top" className="flex items-center gap-2 hover:text-snow">Back to top <ArrowUp className="h-4 w-4" /></a>
        </div>
      </div>
    </footer>
  );
}
