import "./neon.css";
import { DemoForm, note, PHOTO_CAPTION, SECTIONS, SECTOR_ART, SERVICES_TITLE, telHref } from "../shared";
import type { MaquetteProps } from "../types";
import { sora, unbounded } from "./fonts";

const wrap = "mx-auto w-full max-w-[1180px] px-5 sm:px-8";
const display = "font-[family-name:var(--font-unbounded)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em]";
const h2 = `${display} text-[clamp(1.9rem,4.6vw,3.4rem)]`;
const field = "mt-1.5 block w-full rounded-none border-2 border-[#B8A6FF]/50 bg-transparent px-3.5 py-3 text-white";

/** Néon: the sign you spot from the end of the street. Midnight, neon pink, lemon, lavender. */
export default function Neon({ business, content }: MaquetteProps) {
  const tel = telHref(content.phone);
  const [Mark, Second] = SECTOR_ART[business.sector];
  // The scrolling band lists what the shop does. Doubled so the loop never shows a gap.
  const band = [...content.services, ...content.services];

  return (
    <div
      className={`neo ${unbounded.variable} ${sora.variable} min-h-screen overflow-x-clip bg-[#140F2D] font-[family-name:var(--font-sora)] text-[1.0625rem] leading-relaxed text-white [&_:focus-visible]:outline-[3px] [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-[#E6FF4D] [&_[id]]:scroll-mt-24`}
    >
      <header className="sticky top-0 z-20 border-b border-[#B8A6FF]/25 bg-[#140F2D]/90 backdrop-blur">
        <div className={`${wrap} flex h-[4.5rem] items-center gap-8`}>
          <a href="#haut" className={`${display} min-w-0 truncate text-base text-[#FF3EA5] sm:text-lg`}>
            {content.businessName}
          </a>
          <nav aria-label="Sections" className="ml-auto hidden items-center gap-7 text-sm font-semibold text-[#B8A6FF] lg:flex">
            {SECTIONS.map((section) => (
              <a key={section.href} href={section.href} className="hover:text-[#E6FF4D]">
                {section.label}
              </a>
            ))}
          </nav>
          <a href={tel} className="ml-auto inline-flex h-11 shrink-0 items-center rounded-full bg-[#E6FF4D] px-5 font-bold text-[#140F2D] lg:ml-0">
            {content.phone}
          </a>
        </div>
      </header>

      <main id="haut">
        <section className={`${wrap} relative py-16 lg:py-24`}>
          <p className="inline-block -rotate-2 rounded-full border-2 border-[#E6FF4D] px-4 py-1.5 text-sm font-bold text-[#E6FF4D]">
            {content.sectorLabel} à {content.city}
          </p>
          <h1 className={`${display} neo-glow mt-7 max-w-[15ch] text-[clamp(2.5rem,7.6vw,6rem)] text-[#FF3EA5]`}>{content.tagline}</h1>
          <div className="mt-9 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="max-w-[48ch] text-lg text-[#D9D1FF]">{content.intro}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#infos" className="inline-flex h-14 items-center rounded-full bg-[#FF3EA5] px-8 text-lg font-bold text-[#140F2D] hover:bg-[#FF6ABB]">
                  {content.cta.primary}
                </a>
                <a href={tel} className="inline-flex h-14 items-center rounded-full border-2 border-[#B8A6FF] px-7 text-lg font-bold text-[#B8A6FF] hover:border-white hover:text-white">
                  {content.cta.secondary}
                </a>
              </div>
            </div>
            {/* The sign itself: a neon tube around the trade's emblem. */}
            <figure className="justify-self-start lg:justify-self-end">
              <div className="neo-tube grid size-[13.5rem] rotate-3 place-items-center rounded-[2.2rem] sm:size-[15rem]">
                <Mark aria-hidden="true" className="size-28 text-[#FF3EA5] drop-shadow-[0_0_16px_#FF3EA5]" strokeWidth={1.5} />
              </div>
              <figcaption className="mt-5 text-sm text-[#B8A6FF]">{PHOTO_CAPTION[business.sector]}</figcaption>
            </figure>
          </div>
        </section>

        <div aria-hidden="true" className="-rotate-1 overflow-hidden border-y-2 border-[#140F2D] bg-[#E6FF4D] py-3.5 text-[#140F2D]">
          <div className="neo-defile flex w-max">
            {band.map((service, index) => (
              <span key={index} className={`${display} flex items-center gap-8 pr-8 text-xl whitespace-nowrap`}>
                {service.name}
                <i className="size-2.5 rotate-45 bg-[#FF3EA5]" />
              </span>
            ))}
          </div>
        </div>

        <section id="prestations" className={`${wrap} py-16 lg:py-24`}>
          <h2 className={h2}>{SERVICES_TITLE[business.sector]}</h2>
          <ul className="mt-10">
            {content.services.map((service) => (
              <li key={service.name} className="group grid gap-x-8 gap-y-1 border-t-2 border-[#B8A6FF]/30 py-6 last:border-b-2 md:grid-cols-[1fr_1.1fr_auto] md:items-baseline">
                <h3 className={`${display} text-[1.35rem] group-hover:text-[#FF3EA5]`}>{service.name}</h3>
                <p className="text-[#D9D1FF]">{service.description}</p>
                {service.price && <p className="font-bold text-[#E6FF4D] md:text-right">{service.price}</p>}
              </li>
            ))}
          </ul>
        </section>

        <section id="atouts" className="bg-[#FF3EA5] py-16 text-[#140F2D] lg:py-24">
          <div className={wrap}>
            <h2 className={h2}>Pourquoi venir ici</h2>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {content.strengths.map((strength, index) => (
                <li key={strength.title} className={`rounded-[1.8rem] bg-[#140F2D] p-7 text-white ${index === 1 ? "md:translate-y-6" : ""}`}>
                  <h3 className={`${display} text-xl text-[#E6FF4D]`}>{strength.title}</h3>
                  <p className="mt-3 text-[#D9D1FF]">{strength.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="a-propos" className={`${wrap} grid gap-12 py-20 lg:grid-cols-[auto_1fr] lg:items-center lg:py-28`}>
          <p className={`${display} neo-outline text-[clamp(5rem,16vw,11rem)]`}>{business.registeredAt.slice(0, 4)}</p>
          <div>
            <h2 className={h2}>{content.about.title}</h2>
            {content.about.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-5 max-w-[56ch] text-lg text-[#D9D1FF]">{paragraph}</p>
            ))}
            <Second aria-hidden="true" className="mt-7 size-12 text-[#B8A6FF]" strokeWidth={1.5} />
          </div>
        </section>

        <section id="avis" className="border-y-2 border-[#B8A6FF]/30 py-16 lg:py-24">
          <div className={wrap}>
            <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
              <p className={`${display} neo-glow text-[clamp(4.5rem,13vw,9rem)] text-[#FF3EA5]`}>{note(content.reviewSummary.rating)}</p>
              <p className="pb-3 text-[#D9D1FF]">
                <span className={`${display} block text-xl text-white`}>sur 5</span>
                d&apos;après {content.reviewSummary.count} avis clients
              </p>
            </div>
            <h2 className="mt-9 font-bold text-[#E6FF4D]">Exemples d&apos;avis</h2>
            <ul className="mt-4 grid gap-5 md:grid-cols-3">
              {content.sampleReviews.map((review) => (
                <li key={review.author} className="rounded-[1.8rem] border-2 border-[#B8A6FF]/40 p-7">
                  <p className="text-lg">« {review.text} »</p>
                  <p className="mt-4 text-sm font-bold text-[#B8A6FF]">{review.author}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="infos" className={`${wrap} grid gap-12 py-16 lg:grid-cols-2 lg:py-24`}>
          <div>
            <h2 className={h2}>Horaires et accès</h2>
            <table className="mt-8 w-full">
              <caption className="sr-only">Horaires d&apos;ouverture</caption>
              <tbody>
                {content.hours.map((day) => (
                  <tr key={day.day} className="border-b border-[#B8A6FF]/25">
                    <th scope="row" className="py-3 text-left font-bold text-[#B8A6FF]">{day.day}</th>
                    <td className={`py-3 text-right font-semibold ${day.hours === "Fermé" ? "text-white/60" : "text-[#E6FF4D]"}`}>{day.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-7 text-lg text-[#D9D1FF]">{content.address}</p>
          </div>
          <div>
            <h2 className={h2}>{content.cta.primary}</h2>
            <DemoForm
              className="mt-8 flex flex-col gap-4 [&_span]:font-semibold [&_span]:text-[#B8A6FF]"
              fieldClassName={field}
              buttonClassName="mt-1 h-14 rounded-full border-2 border-dashed border-[#B8A6FF]/50 font-bold text-[#B8A6FF]"
            />
          </div>
        </section>
      </main>

      <footer className="bg-[#0D0920] py-10">
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-4`}>
          <p className={`${display} text-xl text-[#FF3EA5]`}>{content.businessName}</p>
          <p className="text-[#B8A6FF]">{content.address}, {content.phone}</p>
        </div>
      </footer>
    </div>
  );
}
