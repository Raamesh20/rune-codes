export const SITE = {
  name: "Rune Codes",
  fullName: "Rune Codes Coding Academy",
  tagline: "Empowering young minds through code.",
  description:
    "Rune Codes Coding Academy empowers young minds to unlock their tech potential through fun, hands-on programming lessons in Scratch, Python and C++.",
  phoneDisplay: "014-926 1712",
  phoneHref: "tel:+60149261712",
  email: "runecodesofficial@gmail.com",
  whatsappNumber: "60149261712",
  instagramHandle: "@runecodes.official",
  instagramUrl: "https://www.instagram.com/runecodes.official/",
  linkedinName: "Rune Codes",
  facebookName: "Rune Codes",
  /** Set NEXT_PUBLIC_SITE_URL in production so canonical / OG / sitemap URLs are correct. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
} as const;

/** Sub-path when hosted under a folder (GitHub Pages project site). Use for plain public/ asset URLs. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const asset = (path: string) => `${BASE_PATH}${path}`;

export const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "programs", label: "Programs" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
] as const;

export const DEFAULT_WA_MESSAGE =
  "Hi Rune Codes! I'd like to know more about your coding programs for my child.";

export function whatsappLink(message: string = DEFAULT_WA_MESSAGE): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function programEnquiryLink(program: string, ages: string): string {
  return whatsappLink(
    `Hi Rune Codes! I'm interested in the ${program} program (${ages}). Could you share more about lessons, schedules and fees?`,
  );
}

export function mailtoLink(subject: string, body?: string): string {
  const params = new URLSearchParams();
  params.set("subject", subject);
  if (body) params.set("body", body);
  // URLSearchParams encodes spaces as "+", which some mail clients show literally.
  return `mailto:${SITE.email}?${params.toString().replace(/\+/g, "%20")}`;
}
