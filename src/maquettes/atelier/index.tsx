import "./atelier.css";
import { Clock, MapPin, Phone } from "lucide-react";
import { DemoForm, note, PHOTO_CAPTION, SECTIONS, SECTOR_ART, SERVICES_TITLE, telHref } from "../shared";
import type { MaquetteProps } from "../types";
import { splitPrice } from "./copy";
import { atelierDisplay, atelierText } from "./fonts";

const wrap = "mx-auto w-full max-w-[1180px] px-5 sm:px-8";
const field =
  "mt-1.5 block w-full border-2 border-[var(--atl-fonte)] bg-[var(--atl-suie)] px-3 py-2.5 text-[var(--atl-acier)]";

/** Atelier: the workshop wall. Charcoal, raw steel, safety orange, lettering like a painted sign. */
export default function Atelier({ business, content }: MaquetteProps) {
  const tel = telHref(content.phone);
  const tools = SECTOR_ART[business.sector];

  return (
    <div className={`atl ${atelierDisplay.variable} ${atelierText.variable}`}>
      <header className="sticky top-0 z-20 border-b-2 border-[var(--atl-fonte)] bg-[var(--atl-suie)]">
        <div className={`${wrap} flex h-[4.5rem] items-center gap-6`}>
          <a href="#haut" className="atl-cond min-w-0 truncate text-xl text-[var(--atl-acier)] sm:text-2xl">
            {content.businessName}
          </a>
          <nav aria-label="Sections" className="ml-auto hidden items-center gap-6 lg:flex">
            {SECTIONS.map((section) => (
              <a key={section.href} href={section.href} className="atl-cond text-[0.95rem] text-[var(--atl-beton-clair)] hover:text-[var(--atl-signal)]">
                {section.label}
              </a>
            ))}
          </nav>
          <a
            href={tel}
            className="atl-cond atl-chamfer ml-auto inline-flex h-11 shrink-0 items-center gap-2 bg-[var(--atl-signal)] px-4 text-base text-[var(--atl-charbon)] lg:ml-0"
          >
            <Phone aria-hidden="true" className="size-4" strokeWidth={2.6} />
            {content.phone}
          </a>
        </div>
      </header>

      <main id="haut">
        <section className={`${wrap} grid gap-10 py-14 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:py-20`}>
          <div>
            <p className="atl-cond text-lg text-[var(--atl-signal)]">
              {content.sectorLabel} à {content.city}
            </p>
            <h1 className="atl-display mt-4 text-[clamp(2.9rem,7.4vw,5.6rem)]">{content.tagline}</h1>
            <p className="mt-6 max-w-[46ch] text-lg text-[var(--atl-beton-clair)]">{content.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#infos" className="atl-cond atl-chamfer inline-flex h-14 items-center bg-[var(--atl-signal)] px-7 text-xl text-[var(--atl-charbon)]">
                {content.cta.primary}
              </a>
              <a href={tel} className="atl-cond inline-flex h-14 items-center border-2 border-[var(--atl-acier)] px-6 text-xl hover:bg-[var(--atl-acier)] hover:text-[var(--atl-charbon)]">
                {content.cta.secondary}
              </a>
            </div>
          </div>

          {/* The tool board: where the shop's own photo will hang. */}
          <figure className="atl-holes relative aspect-[5/4] border-4 border-[var(--atl-suie)] text-[var(--atl-charbon)]">
            <div className="absolute inset-x-0 top-[14%] flex justify-around px-[8%]">
              {tools.map((Tool, index) => (
                <span key={index} className="relative flex flex-col items-center">
                  <i className="size-3 rounded-full bg-[var(--atl-charbon)]" />
                  <span className="atl-tool mt-1 block" style={{ ["--atl-from" as string]: `${index % 2 ? 8 : -9}deg`, animationDelay: `${index * 140}ms` }}>
                    <Tool aria-hidden="true" strokeWidth={1.7} className="size-[clamp(4rem,11vw,7.5rem)]" />
                  </span>
                </span>
              ))}
            </div>
            <figcaption className="atl-cond absolute bottom-[4.2rem] left-5 bg-[var(--atl-charbon)] px-3 py-1.5 text-sm text-[var(--atl-acier)]">
              {PHOTO_CAPTION[business.sector]}
            </figcaption>
            <div aria-hidden="true" className="atl-hazard absolute inset-x-0 bottom-0 h-12" />
          </figure>
        </section>

        <div className="border-y-2 border-[var(--atl-fonte)] bg-[var(--atl-suie)]">
          <ul className={`${wrap} grid grid-cols-3 divide-x-2 divide-[var(--atl-fonte)]`}>
            {content.facts.map((fact) => (
              <li key={fact.label} className="px-3 py-6 text-center first:pl-0 last:pr-0">
                <span className="atl-display block text-[clamp(2rem,5.6vw,3.6rem)] text-[var(--atl-signal)]">{fact.value}</span>
                <span className="atl-cond mt-1 block text-[0.8rem] text-[var(--atl-beton-clair)] sm:text-base">{fact.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <section id="prestations" className="bg-[var(--atl-acier)] py-16 text-[var(--atl-charbon)] lg:py-24">
          <div className={wrap}>
            <h2 className="atl-display text-[clamp(2.2rem,5.4vw,4rem)]">{SERVICES_TITLE[business.sector]}</h2>
            <ul className="mt-10 border-t-4 border-[var(--atl-charbon)]">
              {content.services.map((service) => {
                const price = service.price ? splitPrice(service.price) : null;
                return (
                  <li key={service.name} className="flex flex-wrap items-baseline gap-x-8 gap-y-1 border-b-2 border-[var(--atl-zinc)] py-5">
                    <h3 className="atl-cond w-full text-2xl sm:w-72 sm:text-[1.7rem]">{service.name}</h3>
                    <p className="min-w-0 flex-1 basis-56 text-[var(--atl-beton-fonce)]">{service.description}</p>
                    {service.price && (
                      <p className="ml-auto text-right">
                        {price ? (
                          <>
                            {price.before && <span className="atl-cond mr-2 text-sm text-[var(--atl-beton-fonce)]">{price.before}</span>}
                            <strong className="atl-display text-[2.4rem]">{price.amount}</strong>
                            {price.after && <span className="atl-cond ml-2 text-sm text-[var(--atl-beton-fonce)]">{price.after}</span>}
                          </>
                        ) : (
                          <span className="atl-cond atl-hatch px-3 py-1.5 text-lg">{service.price}</span>
                        )}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section id="atouts" className={`${wrap} py-16 lg:py-24`}>
          <h2 className="atl-display text-[clamp(2.2rem,5.4vw,4rem)]">Ce qui nous distingue</h2>
          <ul className="mt-10 grid gap-8 md:grid-cols-3">
            {content.strengths.map((strength) => (
              <li key={strength.title} className="border-t-[6px] border-[var(--atl-signal)] pt-5">
                <h3 className="atl-cond text-2xl">{strength.title}</h3>
                <p className="mt-2 text-[var(--atl-beton-clair)]">{strength.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="a-propos" className="border-y-2 border-[var(--atl-fonte)] bg-[var(--atl-suie)] py-16 lg:py-24">
          <div className={`${wrap} grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center`}>
            <div>
              <h2 className="atl-display text-[clamp(2.2rem,5.4vw,4rem)]">{content.about.title}</h2>
              {content.about.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-5 max-w-[58ch] text-lg text-[var(--atl-beton-clair)]">
                  {paragraph}
                </p>
              ))}
            </div>
            <p className="atl-chamfer bg-[var(--atl-signal)] px-9 py-7 text-center text-[var(--atl-charbon)]" style={{ ["--atl-cut" as string]: "22px" }}>
              <span className="atl-cond block text-lg">Depuis</span>
              <span className="atl-display block text-[5.5rem]">{business.registeredAt.slice(0, 4)}</span>
              <span className="atl-cond block text-lg">à {content.city}</span>
            </p>
          </div>
        </section>

        <section id="avis" className="bg-[var(--atl-acier)] py-16 text-[var(--atl-charbon)] lg:py-24">
          <div className={wrap}>
            <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
              <p className="atl-display text-[clamp(4.5rem,13vw,9rem)]">{note(content.reviewSummary.rating)}</p>
              <p className="pb-3">
                <span className="atl-cond block text-2xl">sur 5</span>
                <span className="text-[var(--atl-beton-fonce)]">d&apos;après {content.reviewSummary.count} avis clients</span>
              </p>
            </div>
            <h2 className="atl-cond mt-8 text-xl">Exemples d&apos;avis</h2>
            <ul className="mt-4 grid gap-5 md:grid-cols-3">
              {content.sampleReviews.map((review) => (
                <li key={review.author} className="atl-chamfer bg-[var(--atl-papier)] p-6">
                  <p className="text-lg">« {review.text} »</p>
                  <p className="atl-cond mt-4 text-sm text-[var(--atl-beton-fonce)]">{review.author}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="infos" className={`${wrap} grid gap-12 py-16 lg:grid-cols-2 lg:py-24`}>
          <div>
            <h2 className="atl-display text-[clamp(2.2rem,5.4vw,4rem)]">Horaires et accès</h2>
            <table className="mt-8 w-full text-lg">
              <caption className="sr-only">Horaires d&apos;ouverture</caption>
              <tbody>
                {content.hours.map((day) => (
                  <tr key={day.day} className="border-b-2 border-[var(--atl-fonte)]">
                    <th scope="row" className="atl-cond py-3 text-left font-bold">{day.day}</th>
                    <td className={`py-3 text-right ${day.hours === "Fermé" ? "text-[var(--atl-beton)]" : ""}`}>{day.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-7 flex items-start gap-3 text-lg">
              <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-[var(--atl-signal)]" />
              {content.address}
            </p>
            <p className="mt-3 flex items-center gap-3 text-lg">
              <Clock aria-hidden="true" className="size-5 shrink-0 text-[var(--atl-signal)]" />
              Devis gratuit, sur place ou par téléphone
            </p>
          </div>
          <div>
            <h2 className="atl-display text-[clamp(2.2rem,5.4vw,4rem)]">{content.cta.primary}</h2>
            <DemoForm
              className="mt-8 flex flex-col gap-4 [&_span]:font-semibold"
              fieldClassName={field}
              buttonClassName="atl-cond atl-hatch mt-2 h-14 border-2 border-[var(--atl-fonte)] text-lg text-[var(--atl-beton-clair)]"
            />
          </div>
        </section>
      </main>

      <footer className="atl-hazard pt-3">
        <div className="bg-[var(--atl-suie)]">
          <div className={`${wrap} flex flex-wrap items-center justify-between gap-4 py-8`}>
            <p className="atl-cond text-2xl">{content.businessName}</p>
            <p className="text-[var(--atl-beton-clair)]">
              {content.address}, {content.phone}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
