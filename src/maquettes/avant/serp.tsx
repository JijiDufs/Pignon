import type { ReactNode } from "react";
import { Building2, ImageOff, Landmark, Search, X } from "lucide-react";
import { formatDate, formatNumber, formatRating } from "@/lib/format";
import { seed, slugify, type AvantProps } from "./lib";

const LINK = "#1a4fba";
const FAVICONS = ["#b3261e", "#1e6b52", "#6b3fa0"];

/** No website: what a customer gets when searching for the shop. Neighbours with a site first, then a bare directory entry. */
export function Serp({ business, content }: AvantProps) {
  const { name, address } = business;
  const city = address.city;
  const query = `${name} ${name.includes(city) ? "" : city}`.trim().toLowerCase();
  const words = `${name} ${city}`.split(/\s+/).filter((word) => word.length > 2);
  const trade = content.sectorLabel.toLowerCase();
  const rivals = business.competitors.filter((rival) => rival.hasSite);
  const n = seed(business.id);

  return (
    <div className="min-h-screen bg-white text-[#202124]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <h1 className="sr-only">Résultats de recherche pour {query}</h1>

      <header className="border-b border-[#dfe1e5]">
        <div className="flex items-center gap-3 px-4 pt-4 sm:gap-6 sm:px-7 sm:pt-6">
          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#3b4a5a] text-white sm:size-11">
            <Search className="size-5" strokeWidth={2.8} />
          </span>
          <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full border border-[#cfd3d9] pr-4 pl-5 text-[16px] shadow-[0_1px_5px_rgba(32,33,36,0.16)] sm:h-12 sm:max-w-[640px] sm:text-[17px]">
            <span className="min-w-0 flex-1 truncate">{query}</span>
            <X aria-hidden="true" className="size-5 shrink-0 text-[#70757a]" />
            <span aria-hidden="true" className="h-6 w-px bg-[#dfe1e5]" />
            <Search aria-hidden="true" className="size-5 shrink-0 text-[#3b4a5a]" />
          </div>
        </div>
        <ul className="mt-3 flex gap-6 overflow-hidden px-4 text-[14px] text-[#5f6368] sm:mt-4 sm:pl-[96px]">
          {["Tous", "Cartes", "Images", "Actualités", "Vidéos"].map((tab, index) => (
            <li
              key={tab}
              className={index === 0 ? "border-b-[3px] border-[#1a4fba] pb-2 font-bold text-[#1a4fba]" : "pb-2"}
            >
              {tab}
            </li>
          ))}
        </ul>
      </header>

      <main className="px-4 pt-3 pb-14 sm:pl-[96px]">
        <p className="text-[13px] text-[#70757a]">
          Environ {formatNumber(1200 + (n % 7400))} résultats (0,{21 + (n % 38)} seconde)
        </p>

        <ol className="mt-4 max-w-[660px] space-y-6 sm:space-y-7">
          {rivals.map((rival, index) => (
            <li key={rival.name}>
              <Result
                badge={<Badge color={FAVICONS[index % FAVICONS.length]}>{rival.name.replace(/^(l'|le |la |les |chez |au |aux )/i, "")[0]}</Badge>}
                source={rival.name}
                path={`https://www.${slugify(rival.name)}.fr`}
                title={`${rival.name} – ${content.sectorLabel} à ${city}`}
              >
                <p>
                  <Marked words={words}>
                    {`${rival.name}, ${trade} à ${city}. Retrouvez nos horaires, nos tarifs, nos photos et toutes nos actualités sur notre site.`}
                  </Marked>
                </p>
                <p className="mt-1 flex items-center gap-2 text-[13px] text-[#70757a]">
                  <Stars value={rival.rating} />
                  {formatRating(rival.rating)} ({rival.reviewCount} avis)
                </p>
                <p className="mt-1.5 flex gap-5" style={{ color: LINK }}>
                  <span>Horaires</span>
                  <span>Tarifs</span>
                  <span>Contact</span>
                </p>
              </Result>
            </li>
          ))}

          <li>
            <Result
              badge={
                <Badge color="#e8eaed">
                  <Building2 className="size-4 text-[#5f6368]" />
                </Badge>
              }
              source="Annuaire des commerces"
              path={`${city} › ${content.sectorLabel}`}
              title={`${name} – ${city} (${address.postalCode})`}
            >
              <div className="mt-2 flex overflow-hidden rounded-lg border border-[#dadce0] text-[15px] text-[#202124]">
                <dl className="min-w-0 flex-1 divide-y divide-[#e8eaed]">
                  <Row label="Adresse">
                    {address.street}, {address.postalCode} {city}
                  </Row>
                  <Row label="Téléphone">{business.phone}</Row>
                  <Row label="Site web">
                    <span className="text-[#80868b] italic">non renseigné</span>
                  </Row>
                </dl>
                <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-1.5 border-l border-[#e8eaed] bg-[#f1f3f4] text-center text-[12px] leading-tight text-[#80868b] sm:w-32">
                  <ImageOff aria-hidden="true" className="size-6" strokeWidth={1.6} />
                  Aucune photo
                </div>
              </div>
              <p className="mt-2 text-[13px] text-[#70757a]">
                Fiche créée automatiquement à partir du registre des entreprises. Vous êtes le gérant ? Complétez-la.
              </p>
            </Result>
          </li>

          <li>
            <Result
              badge={
                <Badge color="#e8eaed">
                  <Landmark className="size-4 text-[#5f6368]" />
                </Badge>
              }
              source="Registre des entreprises"
              path={`Établissements › ${address.postalCode} ${city}`}
              title={`${name.toUpperCase()} (${city}) – SIRET ${business.siret}`}
            >
              <p>
                <Marked words={words}>
                  {`Établissement immatriculé le ${formatDate(business.registeredAt, true)}. Activité : ${trade}. Effectif : ${business.staff}. Adresse : ${address.street}, ${address.postalCode} ${city}.`}
                </Marked>
              </p>
            </Result>
          </li>
        </ol>

        <section className="mt-10 max-w-[660px]">
          <h2 className="text-[18px]">Recherches associées</h2>
          <ul className="mt-3 grid gap-2.5 text-[15px] sm:grid-cols-2">
            {["horaires", "avis", "téléphone", "tarifs"].map((suffix) => (
              <li key={suffix} className="flex items-center gap-3 rounded-full bg-[#f1f3f4] px-4 py-2.5">
                <Search aria-hidden="true" className="size-4 shrink-0 text-[#70757a]" />
                <span className="truncate">
                  {name.toLowerCase()} <b>{suffix}</b>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function Badge({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white"
      style={{ background: color }}
    >
      {children}
    </span>
  );
}

interface ResultProps {
  badge: ReactNode;
  source: string;
  path: string;
  title: string;
  children: ReactNode;
}

function Result({ badge, source, path, title, children }: ResultProps) {
  return (
    <article>
      <div className="flex items-center gap-3">
        {badge}
        <div className="min-w-0 text-[13px] leading-[1.35]">
          <p className="truncate">{source}</p>
          <p className="truncate text-[#4d5156]">{path}</p>
        </div>
      </div>
      <h2 className="mt-1.5 text-[19px] leading-snug sm:text-[20px]" style={{ color: LINK }}>
        {title}
      </h2>
      <div className="mt-1 text-[14px] leading-[1.55] text-[#4d5156]">{children}</div>
    </article>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 px-3.5 py-2">
      <dt className="w-[86px] shrink-0 text-[#5f6368]">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

/** Search engines set the words of the query in bold inside each snippet. */
function Marked({ words, children }: { words: string[]; children: string }) {
  const escaped = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = escaped.length ? children.split(new RegExp(`(${escaped.join("|")})`, "gi")) : [children];
  return parts.map((part, index) => (index % 2 ? <b key={index}>{part}</b> : part));
}

function Stars({ value }: { value: number }) {
  return (
    <span aria-hidden="true" className="relative inline-block text-[15px] leading-none tracking-[1px] whitespace-nowrap text-[#dadce0]">
      ★★★★★
      <span className="absolute inset-y-0 left-0 overflow-hidden text-[#e8a013]" style={{ width: `${(value / 5) * 100}%` }}>
        ★★★★★
      </span>
    </span>
  );
}
