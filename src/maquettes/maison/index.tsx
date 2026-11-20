import { DemoForm, note, telHref } from "../shared";
import type { MaquetteProps } from "../types";
import { Emblem } from "./emblems";
import { fraunces, karla } from "./fonts";
import { navLinks, VOCAB } from "./vocab";

const wrap = "mx-auto w-full max-w-[1120px] px-5 sm:px-8";
const serif = "font-[family-name:var(--font-fraunces)]";
const field = "mt-1.5 block w-full rounded-md border border-[#1F3B2D]/30 bg-[#FBF8F1] px-3 py-2.5";

/** A small painted flourish between two thin rules, like on old shopfront glass. */
function Ornament({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`flex items-center justify-center gap-3 text-[#8E2F3A] ${className}`}>
      <i className="h-px w-14 bg-current opacity-50" />
      <svg viewBox="0 0 24 12" className="h-3 w-6" fill="currentColor">
        <path d="M12 0l3 6-3 6-3-6Zm-9 4 2 2-2 2-2-2Zm18 0 2 2-2 2-2-2Z" />
      </svg>
      <i className="h-px w-14 bg-current opacity-50" />
    </span>
  );
}

/** Maison: a shopfront repainted every spring. Linen, fir green, butter yellow, morello red. */
export default function Maison({ business, content }: MaquetteProps) {
  const vocab = VOCAB[business.sector];
  const tel = telHref(content.phone);
  const year = business.registeredAt.slice(0, 4);

  return (
    <div
      className={`${fraunces.variable} ${karla.variable} min-h-screen bg-[#F3EEE3] font-[family-name:var(--font-karla)] text-[1.0625rem] leading-relaxed text-[#1F3B2D] [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-[#8E2F3A] [&_[id]]:scroll-mt-24`}
    >
      <p className="bg-[#1F3B2D] px-4 py-2 text-center text-sm text-[#F3EEE3]">
        {content.address}
        <span className="mx-2 text-[#F2C14E]">✦</span>
        <a href={tel} className="font-bold underline decoration-[#F2C14E] underline-offset-4">
          {content.phone}
        </a>
      </p>

      <header className={`${wrap} pt-9 text-center`}>
        <Emblem sector={business.sector} className="mx-auto size-16 text-[#8E2F3A]" />
        <a href="#haut" className={`${serif} mt-2 block text-[clamp(1.9rem,5vw,3rem)] leading-tight font-semibold italic`}>
          {content.businessName}
        </a>
        <p className="mt-1 text-sm tracking-[0.18em] text-[#4F6B5A] uppercase">
          {content.sectorLabel} à {content.city}
        </p>
        <nav aria-label="Sections" className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 border-y border-[#1F3B2D]/25 py-3">
          {navLinks(vocab).map((link) => (
            <a key={link.href} href={link.href} className="font-bold hover:text-[#8E2F3A]">
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <main id="haut">
        <section className={`${wrap} grid items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20`}>
          <div>
            <h1 className={`${serif} text-[clamp(2.5rem,6vw,4.4rem)] leading-[1.04] font-semibold tracking-[-0.01em]`}>{content.tagline}</h1>
            <p className="mt-6 max-w-[48ch] text-lg text-[#3E5548]">{content.intro}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <a href="#infos" className="inline-flex h-14 items-center rounded-full bg-[#8E2F3A] px-8 text-lg font-bold text-[#FBF8F1] hover:bg-[#75242F]">
                {content.cta.primary}
              </a>
              <a href={tel} className="text-lg font-bold underline decoration-[#F2C14E] decoration-[3px] underline-offset-[6px]">
                {content.cta.secondary}
              </a>
            </div>
          </div>

          {/* The shop window: an arch waiting for the owner's own photo. */}
          <figure className="mx-auto w-full max-w-[400px]">
            <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-t-full border-2 border-[#1F3B2D] bg-[#F2C14E]">
              <div className="absolute inset-3 rounded-t-full border border-[#1F3B2D]/45" />
              <Emblem sector={business.sector} className="size-[62%] text-[#1F3B2D]" strokeWidth={1.3} />
              <div className="absolute inset-x-0 bottom-0 h-[13%] border-t-2 border-[#1F3B2D] bg-[#1F3B2D] bg-[repeating-linear-gradient(90deg,#F3EEE3_0_22px,#8E2F3A_22px_44px)]" />
            </div>
            <figcaption className={`${serif} mt-3 text-center text-[#4F6B5A] italic`}>{vocab.photo}</figcaption>
          </figure>
        </section>

        <ul className={`${wrap} grid gap-6 border-y border-[#1F3B2D]/25 py-8 text-center sm:grid-cols-3`}>
          {content.facts.map((fact) => (
            <li key={fact.label}>
              <span className={`${serif} block text-5xl font-semibold text-[#8E2F3A]`}>{fact.value}</span>
              <span className="mt-1 block text-[#4F6B5A]">{fact.label}</span>
            </li>
          ))}
        </ul>

        <section id="carte" className={`${wrap} py-16 lg:py-24`}>
          <Ornament />
          <h2 className={`${serif} mt-4 text-center text-[clamp(2.2rem,5vw,3.4rem)] font-semibold italic`}>{vocab.services}</h2>
          <ul className="mt-10 grid gap-x-16 gap-y-8 md:grid-cols-2">
            {content.services.map((service) => (
              <li key={service.name}>
                <div className="flex items-baseline gap-3">
                  <h3 className={`${serif} text-[1.45rem] font-semibold`}>{service.name}</h3>
                  {/* Dotted leader, as on a menu card */}
                  <span aria-hidden="true" className="min-w-6 flex-1 translate-y-[-5px] border-b-2 border-dotted border-[#1F3B2D]/45" />
                  {service.price && <p className="shrink-0 text-right font-bold text-[#8E2F3A]">{service.price}</p>}
                </div>
                <p className="mt-1 text-[#4F6B5A] italic">{service.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="maison" className="bg-[#1F3B2D] py-16 text-[#F3EEE3] lg:py-24">
          <div className={`${wrap} grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center`}>
            <div>
              <h2 className={`${serif} text-[clamp(2.2rem,5vw,3.4rem)] leading-tight font-semibold`}>{content.about.title}</h2>
              {content.about.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-5 max-w-[56ch] text-lg text-[#D9E2D5]">
                  {paragraph}
                </p>
              ))}
            </div>
            {/* An enamel plaque, like the ones screwed next to shop doors. */}
            <p className="mx-auto w-full max-w-[280px] rounded-[2rem] border-[3px] border-[#F2C14E] p-2 text-center">
              <span className="block rounded-[1.5rem] border border-[#F2C14E]/60 px-6 py-8">
                <span className="block text-sm tracking-[0.2em] uppercase">Maison fondée en</span>
                <span className={`${serif} block text-7xl font-semibold text-[#F2C14E]`}>{year}</span>
                <span className={`${serif} block italic`}>à {content.city}</span>
              </span>
            </p>
          </div>
          <ul className={`${wrap} mt-14 grid gap-10 border-t border-[#F3EEE3]/25 pt-12 md:grid-cols-3`}>
            {content.strengths.map((strength) => (
              <li key={strength.title}>
                <h3 className={`${serif} text-2xl font-semibold text-[#F2C14E] italic`}>{strength.title}</h3>
                <p className="mt-2 text-[#D9E2D5]">{strength.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="avis" className={`${wrap} py-16 text-center lg:py-24`}>
          <Ornament />
          <p className={`${serif} mt-5 text-[clamp(4rem,11vw,7rem)] leading-none font-semibold text-[#8E2F3A]`}>{note(content.reviewSummary.rating)}</p>
          <p className="mt-2 text-[#4F6B5A]">sur 5, d&apos;après {content.reviewSummary.count} avis clients</p>
          <h2 className="mt-10 text-sm tracking-[0.18em] uppercase">Exemples d&apos;avis</h2>
          <ul className="mt-5 grid gap-6 text-left md:grid-cols-3">
            {content.sampleReviews.map((review) => (
              <li key={review.author} className="rounded-2xl bg-[#FBF8F1] p-7 shadow-[0_1px_0_#1F3B2D22]">
                <span aria-hidden="true" className={`${serif} block h-8 text-6xl leading-none text-[#F2C14E]`}>“</span>
                <p className={`${serif} text-xl italic`}>{review.text}</p>
                <p className="mt-4 font-bold text-[#4F6B5A]">{review.author}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="infos" className={`${wrap} grid gap-10 pb-20 lg:grid-cols-2`}>
          {/* The slate by the door */}
          <div className="rounded-3xl border-[6px] border-[#B08A52] bg-[#22302A] p-7 text-[#F3EEE3] sm:p-9">
            <h2 className={`${serif} text-4xl font-semibold italic`}>Horaires</h2>
            <table className="mt-5 w-full">
              <caption className="sr-only">Horaires d&apos;ouverture</caption>
              <tbody>
                {content.hours.map((day) => (
                  <tr key={day.day} className="border-b border-dashed border-[#F3EEE3]/25">
                    <th scope="row" className="py-2.5 text-left font-bold">{day.day}</th>
                    <td className={`py-2.5 text-right ${day.hours === "Fermé" ? "text-[#F3EEE3]/70 italic" : ""}`}>{day.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-6 text-[#D9E2D5]">{content.address}</p>
          </div>
          <div>
            <h2 className={`${serif} text-4xl font-semibold italic`}>{content.cta.primary}</h2>
            <p className="mt-3 text-[#4F6B5A]">
              Le plus simple reste de passer nous voir, ou d&apos;appeler le{" "}
              <a href={tel} className="font-bold text-[#8E2F3A] underline underline-offset-4">
                {content.phone}
              </a>
              .
            </p>
            <DemoForm
              className="mt-6 flex flex-col gap-4 [&_span]:font-bold"
              fieldClassName={field}
              buttonClassName="mt-1 h-13 rounded-full border-2 border-dashed border-[#1F3B2D]/40 py-3 font-bold text-[#4F6B5A]"
            />
          </div>
        </section>
      </main>

      <footer className="border-t-[10px] border-[#8E2F3A] bg-[#1F3B2D] py-9 text-center text-[#D9E2D5]">
        <p className={`${serif} text-2xl font-semibold text-[#F3EEE3] italic`}>{content.businessName}</p>
        <p className="mt-1.5">{content.address}</p>
      </footer>
    </div>
  );
}
