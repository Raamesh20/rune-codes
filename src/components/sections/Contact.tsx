"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Mail, Phone, Send, CheckCircle2 } from "lucide-react";
import { SITE, whatsappLink, mailtoLink } from "@/lib/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Mascot } from "@/components/mascot/Mascot";
import { WhatsAppIcon, InstagramIcon, LinkedInIcon, FacebookIcon } from "@/components/ui/BrandIcons";

const PROGRAM_OPTIONS = ["Scratch Programming (Ages 7+)", "Python (Ages 11+)", "C++ (Ages 12+)", "Not sure yet, please advise"];

type Fields = { name: string; phone: string; email: string; age: string; program: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: "", phone: "", email: "", age: "", program: "", message: "" };

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Please enter the parent or guardian's name.";
  const digits = f.phone.replace(/\D/g, "");
  if (!digits) e.phone = "Please enter a phone number.";
  else if (!/^[+\d\s()-]+$/.test(f.phone.trim()) || digits.length < 9 || digits.length > 15) e.phone = "Please enter a valid phone number (9 to 15 digits).";
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Please enter a valid email address, or leave it blank.";
  const age = Number(f.age);
  if (!f.age.trim()) e.age = "Please enter the student's age.";
  else if (!Number.isInteger(age) || age < 5 || age > 18) e.age = "Please enter an age between 5 and 18.";
  if (!f.program) e.program = "Please choose a program.";
  if (f.message.length > 600) e.message = "Please keep the message under 600 characters.";
  return e;
}

function buildMessage(f: Fields) {
  return [
    "Hi Rune Codes! I'd like to enquire about coding lessons.",
    "",
    `Parent/Guardian: ${f.name.trim()}`,
    `Phone: ${f.phone.trim()}`,
    f.email.trim() ? `Email: ${f.email.trim()}` : null,
    `Student age: ${f.age.trim()}`,
    `Interested program: ${f.program}`,
    f.message.trim() ? `Message: ${f.message.trim()}` : null,
  ].filter((l) => l !== null).join("\n");
}

const inputCls = "w-full rounded-xl border bg-ink/60 px-4 py-3 text-[0.95rem] text-snow placeholder:text-dim/70 outline-none transition focus:border-cyan/70 focus:ring-2 focus:ring-cyan/20";

export function Contact() {
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = (k: keyof Fields) => (v: string) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate(f);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const url = whatsappLink(buildMessage(f));
    setSentUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const field = (k: keyof Fields) => ({
    id: `f-${k}`,
    name: k,
    value: f[k],
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `f-${k}-err` : undefined,
    className: `${inputCls} ${errors[k] ? "border-err/70" : "border-white/10"}`,
  });

  const err = (k: keyof Fields) => (errors[k] ? <p id={`f-${k}-err`} className="mt-1.5 text-xs text-err">{errors[k]}</p> : null);

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden section-y">
      <div aria-hidden data-depth="0.5" className="pointer-events-none absolute -left-40 bottom-0 -z-10 h-[34rem] w-[34rem] rounded-full bg-blue/10 blur-[140px]" />
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <SectionHeading id="contact-title" label="Contact us" title="Get in Touch With Us" subtitle="Ready to start your child's coding journey? We're here to help!" />

            <div className="mt-8 flex items-end gap-4">
              <div className="relative aspect-[2/3] w-32 shrink-0 sm:w-40">
                <Mascot pose="wave" decorative bubbleSide="right" message={null} sizes="160px" />
              </div>
              <div className="pb-4">
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp group">
                  <WhatsAppIcon className="h-4 w-4" /> Chat with us on WhatsApp
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
                <p className="mt-3 text-sm text-mist">We typically respond within a few hours.</p>
              </div>
            </div>

            <ul className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10 bg-navy/60">
              <li>
                <a href={SITE.phoneHref} className="flex items-center gap-4 p-4 transition hover:bg-white/[0.03]">
                  <Phone className="h-5 w-5 text-cyan" /><span><span className="block text-xs text-dim">Phone</span>{SITE.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a href={mailtoLink("Coding lessons enquiry")} className="flex items-center gap-4 p-4 transition hover:bg-white/[0.03]">
                  <Mail className="h-5 w-5 text-cyan" /><span className="min-w-0"><span className="block text-xs text-dim">Email</span><span className="break-all">{SITE.email}</span></span>
                </a>
              </li>
              <li>
                <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 transition hover:bg-white/[0.03]">
                  <InstagramIcon className="h-5 w-5 text-cyan" /><span><span className="block text-xs text-dim">Instagram</span>{SITE.instagramHandle}</span>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-dim" /><span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
              <li className="grid grid-cols-2 divide-x divide-white/10">
                <span className="flex items-center gap-3 p-4"><LinkedInIcon className="h-5 w-5 text-cyan" /><span><span className="block text-xs text-dim">LinkedIn</span>{SITE.linkedinName}</span></span>
                <span className="flex items-center gap-3 p-4"><FacebookIcon className="h-5 w-5 text-cyan" /><span><span className="block text-xs text-dim">Facebook</span>{SITE.facebookName}</span></span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="depth relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,#111a33,#0a1020)] p-6 sm:p-10">
              <div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet/20 blur-3xl" />
              <h3 className="relative font-display text-2xl font-semibold tracking-tight">Quick enquiry</h3>
              <p className="relative mt-2 text-sm text-mist">
                Fill this in and we&apos;ll prepare a WhatsApp message for you. Nothing is stored on this website; you review and send the message yourself.
              </p>

              <form ref={formRef} onSubmit={onSubmit} noValidate className="relative mt-8 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="f-name" className="mb-1.5 block text-sm font-medium">Parent or Guardian Name <span className="text-err" aria-hidden>*</span></label>
                  <input {...field("name")} autoComplete="name" required onChange={(e) => set("name")(e.target.value)} placeholder="Your full name" />
                  {err("name")}
                </div>
                <div>
                  <label htmlFor="f-phone" className="mb-1.5 block text-sm font-medium">Phone <span className="text-err" aria-hidden>*</span></label>
                  <input {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" required onChange={(e) => set("phone")(e.target.value)} placeholder="e.g. 012-345 6789" />
                  {err("phone")}
                </div>
                <div>
                  <label htmlFor="f-email" className="mb-1.5 block text-sm font-medium">Email <span className="text-dim">(optional)</span></label>
                  <input {...field("email")} type="email" inputMode="email" autoComplete="email" onChange={(e) => set("email")(e.target.value)} placeholder="you@example.com" />
                  {err("email")}
                </div>
                <div>
                  <label htmlFor="f-age" className="mb-1.5 block text-sm font-medium">Student Age <span className="text-err" aria-hidden>*</span></label>
                  <input {...field("age")} type="number" inputMode="numeric" min={5} max={18} required onChange={(e) => set("age")(e.target.value)} placeholder="e.g. 10" />
                  {err("age")}
                </div>
                <div>
                  <label htmlFor="f-program" className="mb-1.5 block text-sm font-medium">Interested Program <span className="text-err" aria-hidden>*</span></label>
                  <select {...field("program")} required onChange={(e) => set("program")(e.target.value)} className={`${field("program").className} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22><path d=%22M1 1l5 5 5-5%22 stroke=%22%23a3b0c6%22 stroke-width=%221.6%22 fill=%22none%22/></svg>')] bg-[position:right_1rem_center] bg-no-repeat pr-10`}>
                    <option value="" disabled>Choose a program</option>
                    {PROGRAM_OPTIONS.map((p) => <option key={p} value={p} className="bg-navy">{p}</option>)}
                  </select>
                  {err("program")}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="f-message" className="mb-1.5 block text-sm font-medium">Message <span className="text-dim">(optional)</span></label>
                  <textarea {...field("message")} rows={4} maxLength={600} onChange={(e) => set("message")(e.target.value)} placeholder="Anything we should know? Preferred lesson times, prior experience…" />
                  {err("message")}
                </div>
                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                  <button type="submit" className="btn btn-whatsapp">
                    <Send className="h-4 w-4" /> Send via WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const e = validate(f);
                      setErrors(e);
                      const first = Object.keys(e)[0];
                      if (first) { formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return; }
                      window.location.href = mailtoLink("Coding lessons enquiry", buildMessage(f));
                    }}
                    className="btn btn-ghost"
                  >
                    <Mail className="h-4 w-4" /> Email instead
                  </button>
                </div>
              </form>

              <div aria-live="polite">
                {sentUrl && (
                  <p className="relative mt-6 flex gap-3 rounded-2xl border border-ok/40 bg-ok/10 p-4 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                    <span>
                      WhatsApp should have opened with your message ready. Just press send. Didn&apos;t open?{" "}
                      <a href={sentUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-cyan underline underline-offset-4">Open WhatsApp manually</a>.
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
