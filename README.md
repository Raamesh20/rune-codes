# Rune Codes Coding Academy: Website

Official one-page website for Rune Codes Coding Academy.

## Stack
Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Motion for React · Three.js / React Three Fiber / Drei · Lucide icons.

## Scripts
```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build && npm run start
```

## Configuration
Set the production URL so canonical, Open Graph, `sitemap.xml` and `robots.txt` use the real domain:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

Contact details, WhatsApp number and social handles live in `src/lib/site.ts`.
LinkedIn and Facebook are shown as names only, because no profile URLs were supplied. Add them to `site.ts` when available.

## Structure
```
src/
  app/                 layout, page, sitemap, robots, icons
  assets/              rune-mascot.png (background removed from the official artwork)
  components/
    hero/              Hero, typing Terminal
    mascot/            Mascot (2D animated: entrance, float, breathe, tilt, hop, reactions)
    three/             HeroScene (WebGL) + SceneMount (lazy, WebGL/reduced-motion fallbacks)
    sections/          About, Purpose, Programs (+ demos), Approach, Playground, Testimonials, Contact
    layout/            Nav, Footer
    ui/                shared UI (SectionHeading, CodeBlock, Stepper, Logo, BrandIcons)
  lib/                 site config, gsap setup, highlighter, confetti
```

## Notes
- The enquiry form doesn't store or send data. It builds a WhatsApp message (or an email draft) that the visitor reviews and sends themselves.
- The Python demos use predefined examples. Their output is calculated in the browser and is not a live interpreter.
- The mascot is the original artwork with the background removed. Its animation is 2D (transforms only), and its appearance is unchanged.
