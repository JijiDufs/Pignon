import type { ReactNode } from "react";
import { Clock, Globe, Heart, ImageOff, MapPin, MessageCircle, Phone, Search, Share2, Store, Users } from "lucide-react";
import { formatDate } from "@/lib/format";
import { before, seed, type AvantProps } from "./lib";

const ACCENT = "#0e8a82";
const MUTED = "#69717d";

/** Social page only: a brandless network page, cover never set, hours never filled in, last post long gone. */
export function Social({ business, content }: AvantProps) {
  const n = seed(business.id);
  const { address } = business;
  // The diagnosis states how old the last post is: the page and the report must tell the same story.
  const months = Number(business.site.findings.map((finding) => /il y a (\d+) mois/.exec(finding.label)?.[1]).find(Boolean) ?? 14);

  return (
    <div className="min-h-screen bg-[#eef0f3] text-[#1c2026]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="flex h-[52px] items-center gap-3 border-b border-[#d9dde3] bg-white px-3 sm:h-14 sm:px-5">
        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-[10px] text-white" style={{ background: ACCENT }}>
          <Users className="size-5" strokeWidth={2.4} />
        </span>
        <span className="hidden h-9 w-[260px] items-center gap-2 rounded-full bg-[#eef0f3] px-4 text-[14px] sm:flex" style={{ color: MUTED }}>
          <Search aria-hidden="true" className="size-4" />
          Rechercher
        </span>
        <span className="ml-auto text-[14px] font-bold" style={{ color: ACCENT }}>
          Se connecter
        </span>
        <span className="hidden rounded-md px-3.5 py-2 text-[14px] font-bold text-white sm:block" style={{ background: ACCENT }}>
          Créer un compte
        </span>
      </div>

      <header className="bg-white shadow-[0_1px_2px_rgba(28,32,38,0.12)]">
        <div className="mx-auto max-w-[940px]">
          <div className="flex h-[150px] flex-col items-center justify-center gap-2 bg-linear-to-b from-[#d6dae0] to-[#c2c8d0] text-[13px] text-[#7b828c] sm:h-[280px] sm:rounded-b-lg sm:text-[15px]">
            <ImageOff aria-hidden="true" className="size-9 sm:size-12" strokeWidth={1.4} />
            Aucune photo de couverture
          </div>

          <div className="px-4 pb-4 sm:flex sm:items-end sm:gap-6 sm:px-8">
            <span
              aria-hidden="true"
              className="-mt-[52px] flex size-[104px] shrink-0 items-center justify-center rounded-full border-[5px] border-white bg-[#a9b0ba] text-white sm:-mt-[70px] sm:size-[168px]"
            >
              <Store className="size-12 sm:size-20" strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1 pt-2 sm:pb-2">
              <h1 className="text-[26px] leading-tight font-bold sm:text-[32px]">{business.name}</h1>
              <p className="mt-1 text-[15px] sm:text-[16px]" style={{ color: MUTED }}>
                {content.sectorLabel} à {address.city}
              </p>
              <p className="mt-1 text-[15px] sm:text-[16px]">
                <b>{18 + (n % 61)}</b> mentions J&apos;aime
                <span className="mx-2 text-[#b3b9c2]">|</span>
                Dernière publication <b>il y a {months} mois</b>
              </p>
            </div>
            <div className="mt-3 flex gap-2 sm:mt-0 sm:pb-3">
              <Action solid>
                <Heart aria-hidden="true" className="size-4" /> J&apos;aime
              </Action>
              <Action>
                <MessageCircle aria-hidden="true" className="size-4" /> Message
              </Action>
            </div>
          </div>

          <ul className="flex gap-1 border-t border-[#e3e6ea] px-2 text-[15px] font-bold sm:px-6" style={{ color: MUTED }}>
            {["Publications", "À propos", "Photos", "Avis"].map((tab, index) => (
              <li
                key={tab}
                className="border-b-[3px] border-transparent px-3 py-3"
                style={index === 0 ? { color: ACCENT, borderColor: ACCENT } : undefined}
              >
                {tab}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <main className="mx-auto grid max-w-[940px] items-start gap-4 px-0 py-4 sm:grid-cols-[340px_1fr] sm:px-0">
        <div className="grid gap-4">
          <Card>
            <h2 className="text-[19px] font-bold">À propos</h2>
            <ul className="mt-3 grid gap-3 text-[15px]">
              <Info icon={<MapPin />}>
                {address.street}, {address.postalCode} {address.city}
              </Info>
              <Info icon={<Phone />}>{business.phone}</Info>
              <Info icon={<Clock />} missing>
                Horaires non renseignés
              </Info>
              <Info icon={<Globe />} missing>
                Site web non renseigné
              </Info>
            </ul>
          </Card>
          <Card>
            <h2 className="text-[19px] font-bold">Photos</h2>
            <p className="mt-2 text-[15px]" style={{ color: MUTED }}>
              Aucune photo pour le moment.
            </p>
          </Card>
        </div>

        <div className="grid gap-4">
          <h2 className="sr-only">Publications</h2>
          <Post name={business.name} date={before(months, n % 17)} likes={2 + (n % 6)}>
            Fermeture exceptionnelle ce samedi. Merci de votre compréhension.
          </Post>
          <Post name={business.name} date={before(months + 7 + (n % 9), n % 23)} likes={1 + (n % 4)}>
            Merci à tous pour votre fidélité, et bienvenue à nos nouveaux clients.
          </Post>
          <p className="py-2 text-center text-[14px]" style={{ color: MUTED }}>
            Aucune autre publication.
          </p>
        </div>
      </main>
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <section className="bg-white p-4 shadow-[0_1px_2px_rgba(28,32,38,0.14)] sm:rounded-lg">{children}</section>;
}

function Action({ solid = false, children }: { solid?: boolean; children: ReactNode }) {
  return (
    <span
      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md px-5 text-[15px] font-bold sm:flex-none"
      style={solid ? { background: ACCENT, color: "#fff" } : { background: "#e4e7eb" }}
    >
      {children}
    </span>
  );
}

function Info({ icon, missing = false, children }: { icon: ReactNode; missing?: boolean; children: ReactNode }) {
  return (
    <li className={`flex items-start gap-3 ${missing ? "italic" : ""}`} style={missing ? { color: "#8b929c" } : undefined}>
      <span aria-hidden="true" className="mt-px shrink-0 text-[#8b929c] [&>svg]:size-[18px]">
        {icon}
      </span>
      {children}
    </li>
  );
}

function Post({ name, date, likes, children }: { name: string; date: Date; likes: number; children: ReactNode }) {
  return (
    <article className="bg-white shadow-[0_1px_2px_rgba(28,32,38,0.14)] sm:rounded-lg">
      <div className="flex items-center gap-3 px-4 pt-4">
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#a9b0ba] text-white">
          <Store className="size-5" />
        </span>
        <p className="text-[15px] leading-tight">
          <b>{name}</b>
          <span className="mt-0.5 block text-[13px]" style={{ color: MUTED }}>
            {formatDate(date, true)}
          </span>
        </p>
      </div>
      <p className="px-4 pt-3 text-[16px] leading-normal">{children}</p>
      <p className="mt-3 flex items-center gap-1.5 px-4 text-[14px]" style={{ color: MUTED }}>
        <Heart aria-hidden="true" className="size-4 fill-current" style={{ color: ACCENT }} />
        {likes}
      </p>
      <ul className="mx-4 mt-3 flex border-t border-[#e3e6ea] py-1 text-[14px] font-bold" style={{ color: MUTED }}>
        <PostAction icon={<Heart />}>J&apos;aime</PostAction>
        <PostAction icon={<MessageCircle />}>Commenter</PostAction>
        <PostAction icon={<Share2 />}>Partager</PostAction>
      </ul>
    </article>
  );
}

function PostAction({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex flex-1 items-center justify-center gap-2 py-2 [&>svg]:size-4">
      {icon}
      {children}
    </li>
  );
}
