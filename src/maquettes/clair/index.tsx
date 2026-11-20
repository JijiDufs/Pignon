import { Check, Clock, MapPin, Phone, Star } from "lucide-react";
import { DemoForm, note, PHOTO_CAPTION, SECTIONS, SECTOR_ART, SERVICES_TITLE, telHref } from "../shared";
import type { MaquetteProps } from "../types";
import { figtree } from "./fonts";

const wrap = "mx-auto w-full max-w-[1140px] px-5 sm:px-8";
const h2 = "text-[clamp(1.9rem,4vw,2.75rem)] leading-tight font-bold tracking-[-0.02em]";
const field = "mt-1.5 block w-full rounded-xl border border-[#14213D]/20 bg-white px-3.5 py-3";

/** Clair: everything you came for, found in three seconds. White, slate, one lagoon accent. */
export default function Clair({ business, content }: MaquetteProps) {
  const tel = telHref(content.phone);
  const [Mark] = SECTOR_ART[business.sector];
  const open = content.hours.filter((day) => day.hours !== "Fermé");

  return (
    <div
      className={`${figtree.variable} min-h-screen bg-white font-[family-name:var(--font-figtree)] text-[1.0625rem] leading-relaxed text-[#14213D] [&_:focus-visible]:outline-[3px] [&_:focus-visible]:outline-offset-2 [&_:focus-visible]:outline-[#0B7A7C] [&_[id]]:scroll-mt-24`}
    >
      <header className="sticky top-0 z-20 border-b border-[#14213D]/10 bg-white/95 backdrop-blur">
        <div className={`${wrap} flex h-[4.25rem] items-center gap-8`}>
          <a href="#haut" className="flex min-w-0 items-center gap-2.5 text-lg font-bold">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#0B7A7C] text-white">
              <Mark aria-hidden="true" className="size-5" />
            </span>
            <span className="truncate">{content.businessName}</span>
          </a>
          <nav aria-label="Sections" className="ml-auto hidden items-center gap-7 text-[0.95rem] font-medium text-[#14213D]/70 lg:flex">
            {SECTIONS.map((section) => (
              <a key={section.href} href={section.href} className="hover:text-[#0B7A7C]">
                {section.label}
              </a>
            ))}
          </nav>
          <a href={tel} className="ml-auto inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#14213D] px-5 font-semibold text-white lg:ml-0">
            <Phone aria-hidden="true" className="size-4" />
            <span className="max-sm:sr-only">{content.phone}</span>
            <span aria-hidden="true" className="sm:hidden">Appeler</span>
          </a>
        </div>
      </header>

      <main id="haut">
        <section className="bg-[#EAF4F4]">
          <div className={`${wrap} grid gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20`}>
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-[#0B7A7C]">
                <Star aria-hidden="true" className="size-4 fill-current" />
                {note(content.reviewSummary.rating)} sur 5, {content.reviewSummary.count} avis
              </p>
              <h1 className="mt-5 text-[clamp(2.4rem,5.6vw,4rem)] leading-[1.06] font-bold tracking-[-0.03em]">{content.tagline}</h1>
              <p className="mt-5 max-w-[50ch] text-lg text-[#14213D]/75">{content.intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#infos" className="inline-flex h-14 items-center rounded-full bg-[#0B7A7C] px-8 text-lg font-semibold text-white hover:bg-[#0B7375]">
                  {content.cta.primary}
                </a>
                <a href={tel} className="inline-flex h-14 items-center rounded-full border-2 border-[#14213D]/20 bg-white px-7 text-lg font-semibold hover:border-[#14213D]">
                  {content.cta.secondary}
                </a>
              </div>
            </div>

            {/* The practical card: the three answers people come for, before any scrolling. */}
            <ul className="rounded-3xl bg-white p-7 shadow-[0_24px_60px_-28px_#14213D55] sm:p-8">
              <li className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#EAF4F4] text-[#0B7A7C]"><Phone aria-hidden="true" className="size-5" /></span>
                <div>
                  <p className="text-sm text-[#14213D]/70">Téléphone</p>
                  <p className="text-2xl font-bold tracking-[-0.01em]"><a href={tel}>{content.phone}</a></p>
                </div>
              </li>
              <li className="mt-6 flex gap-4 border-t border-[#14213D]/10 pt-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#EAF4F4] text-[#0B7A7C]"><MapPin aria-hidden="true" className="size-5" /></span>
                <div>
                  <p className="text-sm text-[#14213D]/70">Adresse</p>
                  <p className="font-semibold">{content.address}</p>
                </div>
              </li>
              <li className="mt-6 flex gap-4 border-t border-[#14213D]/10 pt-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#EAF4F4] text-[#0B7A7C]"><Clock aria-hidden="true" className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#14213D]/70">Ouvert {open.length} jours sur 7</p>
                  <p className="font-semibold">{open[0] ? `${open[0].day} : ${open[0].hours}` : "Sur rendez-vous"}</p>
                  <p><a href="#infos" className="text-sm font-semibold text-[#0B7A7C] underline underline-offset-4">Tous les horaires</a></p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section id="prestations" className={`${wrap} py-16 lg:py-24`}>
          <h2 className={h2}>{SERVICES_TITLE[business.sector]}</h2>
          <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.services.map((service) => (
              <li key={service.name} className="flex flex-col rounded-2xl border border-[#14213D]/12 p-6">
                <h3 className="text-xl font-bold tracking-[-0.01em]">{service.name}</h3>
                <p className="mt-1.5 flex-1 text-[#14213D]/70">{service.description}</p>
                {service.price && <p className="mt-5 w-fit rounded-full bg-[#EAF4F4] px-3.5 py-1.5 font-semibold text-[#0B7375]">{service.price}</p>}
              </li>
            ))}
          </ul>
        </section>

        <section id="atouts" className="bg-[#14213D] py-16 text-white lg:py-24">
          <div className={`${wrap} grid gap-12 lg:grid-cols-[0.8fr_1.2fr]`}>
            <h2 className={h2}>Pourquoi nous choisir</h2>
            <ul className="flex flex-col gap-8">
              {content.strengths.map((strength) => (
                <li key={strength.title} className="flex gap-5">
                  <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-[#0B7A7C]"><Check aria-hidden="true" className="size-5" strokeWidth={3} /></span>
                  <div>
                    <h3 className="text-2xl font-bold tracking-[-0.01em]">{strength.title}</h3>
                    <p className="mt-1 text-white/70">{strength.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="a-propos" className={`${wrap} grid gap-12 py-16 lg:grid-cols-2 lg:items-center lg:py-24`}>
          <figure>
            <div className="grid aspect-[4/3] place-items-center rounded-3xl bg-[#EAF4F4] bg-[radial-gradient(#0B7A7C33_1.5px,transparent_1.5px)] bg-[size:22px_22px]">
              <Mark aria-hidden="true" className="size-28 text-[#0B7A7C]" strokeWidth={1.4} />
            </div>
            <figcaption className="mt-3 text-sm text-[#14213D]/70">{PHOTO_CAPTION[business.sector]}</figcaption>
          </figure>
          <div>
            <h2 className={h2}>{content.about.title}</h2>
            {content.about.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-5 text-lg text-[#14213D]/75">{paragraph}</p>
            ))}
            <ul className="mt-8 flex flex-wrap gap-x-12 gap-y-5">
              {content.facts.map((fact) => (
                <li key={fact.label}>
                  <span className="block text-4xl font-bold tracking-[-0.02em] text-[#0B7A7C]">{fact.value}</span>
                  <span className="block text-sm text-[#14213D]/70">{fact.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="avis" className="bg-[#EAF4F4] py-16 lg:py-24">
          <div className={wrap}>
            <h2 className={h2}>Exemples d&apos;avis</h2>
            <p className="mt-2 text-[#14213D]/70">Note moyenne de {note(content.reviewSummary.rating)} sur 5, d&apos;après {content.reviewSummary.count} avis clients.</p>
            <ul className="mt-9 grid gap-4 md:grid-cols-3">
              {content.sampleReviews.map((review) => (
                <li key={review.author} className="rounded-2xl bg-white p-6">
                  <p aria-hidden="true" className="flex gap-0.5 text-[#0B7A7C]">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-4 fill-current" />)}</p>
                  <p className="mt-3 text-lg">{review.text}</p>
                  <p className="mt-4 text-sm font-semibold text-[#14213D]/70">{review.author}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="infos" className={`${wrap} grid gap-12 py-16 lg:grid-cols-2 lg:py-24`}>
          <div>
            <h2 className={h2}>Horaires et accès</h2>
            <table className="mt-7 w-full">
              <caption className="sr-only">Horaires d&apos;ouverture</caption>
              <tbody>
                {content.hours.map((day) => (
                  <tr key={day.day} className="border-b border-[#14213D]/10">
                    <th scope="row" className="py-3 text-left font-semibold">{day.day}</th>
                    <td className={`py-3 text-right ${day.hours === "Fermé" ? "text-[#14213D]/70" : ""}`}>{day.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-6 flex gap-3"><MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-[#0B7A7C]" />{content.address}</p>
          </div>
          <div className="rounded-3xl bg-[#EAF4F4] p-7 sm:p-9">
            <h2 className="text-3xl font-bold tracking-[-0.02em]">{content.cta.primary}</h2>
            <DemoForm
              className="mt-6 flex flex-col gap-4 [&_span]:text-sm [&_span]:font-semibold"
              fieldClassName={field}
              buttonClassName="mt-1 h-14 rounded-full border-2 border-dashed border-[#14213D]/25 font-semibold text-[#14213D]/70"
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-[#14213D]/10 py-8">
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-3 text-[#14213D]/65`}>
          <p className="font-bold text-[#14213D]">{content.businessName}</p>
          <p>{content.address}, {content.phone}</p>
        </div>
      </footer>
    </div>
  );
}
