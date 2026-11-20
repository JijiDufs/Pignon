"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Field, emailError } from "@/components/auth/field";
import { Page, PageHeader } from "@/components/pignon/page";
import { LockChip, PlanGate } from "@/components/pignon/plan-gate";
import { SectorIcon } from "@/components/pignon/sector-icon";
import { Curseur } from "@/components/pricing/curseur";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CITIES, getZoneStats, SECTORS } from "@/lib/data";
import { formatDistance, plural } from "@/lib/format";
import type { FeatureId } from "@/lib/plans";
import { useAppStore, useCan, usePlan } from "@/lib/store";
import type { SectorId } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profil", label: "Profil" },
  { id: "zone", label: "Zone" },
  { id: "notifications", label: "Notifications" },
  { id: "equipe", label: "Équipe", feature: "team-seats" },
  { id: "marque", label: "Ta marque", feature: "white-label" },
  { id: "demo", label: "Démo" },
] satisfies { id: string; label: string; feature?: FeatureId }[];

export function ReglagesScreen() {
  return (
    <Page width="narrow">
      <PageHeader title="Réglages" description="Ton profil, ta zone et ce qui te prévient." />
      <Tabs defaultValue="profil">
        <div className="relative -mx-4 overflow-x-auto px-4 scrollbar-fin sm:mx-0 sm:px-0">
          <TabsList className="h-10 bg-nuit-700 p-1">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2 px-3.5 data-active:bg-nuit-800">
                {tab.label}
                {tab.feature && <LockChip feature={tab.feature} />}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="profil" className="mt-8 text-base">
          <Profil />
        </TabsContent>
        <TabsContent value="zone" className="mt-8 text-base">
          <Zone />
        </TabsContent>
        <TabsContent value="notifications" className="mt-8 text-base">
          <Notifications />
        </TabsContent>
        <TabsContent value="equipe" className="mt-8 text-base">
          <PlanGate feature="team-seats">
            <Equipe />
          </PlanGate>
        </TabsContent>
        <TabsContent value="marque" className="mt-8 text-base">
          <PlanGate feature="white-label">
            <Marque />
          </PlanGate>
        </TabsContent>
        <TabsContent value="demo" className="mt-8 text-base">
          <Demo />
        </TabsContent>
      </Tabs>
    </Page>
  );
}

function Profil() {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const [draft, setDraft] = useState(user);
  const [sent, setSent] = useState(false);
  const mailError = sent ? emailError(draft.email) : undefined;
  const nameError = sent && !draft.firstName.trim() ? "Indique ton prénom : on s'en sert dans tes scripts d'appel." : undefined;
  const set = (key: keyof typeof draft) => (event: React.ChangeEvent<HTMLInputElement>) => setDraft((current) => ({ ...current, [key]: event.target.value }));

  return (
    <form
      noValidate
      className="grid max-w-xl gap-5 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
        if (!draft.firstName.trim() || emailError(draft.email)) return;
        setUser({ firstName: draft.firstName.trim(), lastName: draft.lastName.trim(), email: draft.email.trim(), company: draft.company.trim() });
        toast.success("Profil enregistré");
      }}
    >
      <Field label="Prénom" autoComplete="given-name" value={draft.firstName} onChange={set("firstName")} error={nameError} />
      <Field label="Nom" autoComplete="family-name" value={draft.lastName} onChange={set("lastName")} />
      <div className="sm:col-span-2">
        <Field label="E-mail" type="email" autoComplete="email" value={draft.email} onChange={set("email")} error={mailError} />
      </div>
      <div className="sm:col-span-2">
        <Field label="Société" autoComplete="organization" value={draft.company} onChange={set("company")} hint="Elle signe tes SMS et tes maquettes." />
      </div>
      <Button type="submit" size="lg" className="w-fit">
        Enregistrer le profil
      </Button>
    </form>
  );
}

function Zone() {
  const cityField = useId();
  const zone = useAppStore((state) => state.zone);
  const setZone = useAppStore((state) => state.setZone);
  const plan = usePlan();
  const [cityId, setCityId] = useState(zone.cityId);
  const [radiusKm, setRadiusKm] = useState(zone.radiusKm);
  const [sectors, setSectors] = useState<SectorId[]>(zone.sectors);
  const stats = getZoneStats(cityId, { radiusKm, sectors });
  const toggle = (id: SectorId) => setSectors((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));

  return (
    <div className="max-w-xl">
      <div className="flex flex-col gap-7">
        <div>
          <label htmlFor={cityField} className="text-sm font-medium">
            Ville
          </label>
          <select
            id={cityField}
            value={cityId}
            onChange={(event) => setCityId(event.target.value)}
            className="mt-1.5 block h-11 w-full rounded-lg border border-trait-fort bg-nuit-800 px-3 text-base outline-none focus-visible:border-craie focus-visible:ring-3 focus-visible:ring-craie/15"
          >
            {CITIES.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <Curseur label="Rayon autour du centre" value={radiusKm} onChange={setRadiusKm} min={1} max={4} step={0.5} format={formatDistance} />
        <fieldset>
          <legend className="text-sm font-medium">Métiers</legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {SECTORS.map((sector) => {
              const checked = sectors.includes(sector.id);
              return (
                <label
                  key={sector.id}
                  className={cn(
                    "flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-craie has-[:focus-visible]:ring-offset-2",
                    checked ? "border-craie bg-nuit-800 font-medium" : "border-trait-fort text-brume hover:border-pave",
                  )}
                >
                  <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(sector.id)} />
                  <SectorIcon sector={sector.id} aria-hidden="true" className="size-4" />
                  {sector.plural}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <p aria-live="polite" className="mt-7 text-brume">
        <span className="cote font-medium text-craie">{plural(stats.opportunities, "opportunité")}</span> dans cette zone.
      </p>
      <Button
        size="lg"
        className="mt-4"
        disabled={sectors.length === 0}
        onClick={() => {
          setZone({ cityId, radiusKm, sectors });
          toast.success("Zone enregistrée", { description: "Relance un scan depuis le radar pour la voir" });
        }}
      >
        Enregistrer la zone
      </Button>

      <div className="mt-10 border-t border-trait pt-6">
        <p className="font-medium">
          1 zone sur {plan.limits.zones} {plan.limits.zones > 1 ? "permises" : "permise"} par {plan.name}
        </p>
        <p className="mt-1.5 max-w-[56ch] text-sm text-brume">
          {plan.limits.zones > 1
            ? "Cette démonstration ne gère qu'une zone à la fois : les zones supplémentaires arriveront avec le moteur."
            : "Pour prospecter plusieurs villes en même temps, il faut une formule qui permet plusieurs zones."}
        </p>
        {plan.limits.zones === 1 && (
          <Link href="/app/abonnement" className="mt-3 inline-block rounded-md text-sm font-medium underline decoration-trait-fort underline-offset-4 hover:decoration-craie">
            Voir les formules à plusieurs zones
          </Link>
        )}
      </div>
    </div>
  );
}

const SWITCHES: { key: string; label: string; detail: string; feature?: FeatureId }[] = [
  { key: "notify-open", label: "Une maquette est ouverte", detail: "À la seconde où le commerçant regarde sa maquette.", feature: "open-alert" },
  { key: "notify-new-business", label: "Une entreprise s'installe dans ta zone", detail: "Chaque matin, les nouvelles immatriculations.", feature: "new-business-alerts" },
  { key: "notify-reservation", label: "Une réservation se termine", detail: "Trois jours avant qu'un commerce redevienne visible pour les autres.", feature: "lead-reservation" },
  { key: "notify-meeting", label: "Un rendez-vous approche", detail: "La veille, avec l'adresse et le script." },
  { key: "weekly-digest", label: "Le résumé de la semaine", detail: "Le lundi matin : tes appels, tes rendez-vous, ce qui a bougé dans ta zone." },
];

function Notifications() {
  const preferences = useAppStore((state) => state.preferences);
  const setPreference = useAppStore((state) => state.setPreference);
  const plan = usePlan();

  return (
    <ul className="max-w-xl divide-y divide-trait">
      {SWITCHES.map((item) => {
        const locked = item.feature !== undefined && !plan.features.includes(item.feature);
        const id = `pref-${item.key}`;
        return (
          <li key={item.key} className="flex items-center gap-4 py-4">
            <div className="min-w-0 flex-1">
              <label htmlFor={id} className="flex flex-wrap items-center gap-2 font-medium">
                {item.label}
                {item.feature && <LockChip feature={item.feature} />}
              </label>
              <p className="mt-0.5 text-sm text-brume">{item.detail}</p>
            </div>
            <Switch id={id} checked={!locked && (preferences[item.key] ?? true)} disabled={locked} onCheckedChange={(checked) => setPreference(item.key, checked)} />
          </li>
        );
      })}
    </ul>
  );
}

function Equipe() {
  const user = useAppStore((state) => state.user);
  const seats = usePlan().limits.seats || 3;
  const [invited, setInvited] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const free = seats - 1 - invited.length;

  return (
    <div className="max-w-xl p-1">
      <p className="text-brume">
        {plural(seats, "compte")} partagent ta zone, ton pipeline et tes territoires.
      </p>
      <ul className="mt-4 divide-y divide-trait">
        <li className="flex items-center justify-between gap-3 py-3.5">
          <span className="min-w-0">
            <span className="block truncate font-medium">
              {user.firstName} {user.lastName}
            </span>
            <span className="block truncate text-sm text-brume">{user.email}</span>
          </span>
          <span className="text-sm text-pave">Toi</span>
        </li>
        {invited.map((address) => (
          <li key={address} className="flex items-center justify-between gap-3 py-3.5">
            <span className="truncate">{address}</span>
            <span className="text-sm text-pave">Invitation simulée</span>
          </li>
        ))}
      </ul>
      {free > 0 ? (
        <form
          noValidate
          className="mt-5 flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const problem = emailError(email);
            setError(problem);
            if (problem) return;
            setInvited((list) => [...list, email.trim()]);
            setEmail("");
            toast.success("Invitation notée", { description: "Démo : aucun e-mail n'est envoyé" });
          }}
        >
          <div className="flex-1">
            <Field label={`Inviter quelqu'un, ${plural(free, "place libre", "places libres")}`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} error={error} />
          </div>
          <Button type="submit" size="lg" variant="outline" className={cn("h-11 bg-nuit-800", error && "mb-[1.625rem]")}>
            Inviter
          </Button>
        </form>
      ) : (
        <p className="mt-5 text-sm text-brume">Les {seats} comptes de ta formule sont pris.</p>
      )}
    </div>
  );
}

const BRAND_COLORS = [
  { name: "Encre", hex: "#171717" },
  { name: "Brique", hex: "#B5391F" },
  { name: "Canal", hex: "#1F5F8B" },
  { name: "Sapin", hex: "#1F6B4F" },
];

function Marque() {
  const company = useAppStore((state) => state.user.company);
  const [name, setName] = useState(company);
  const [color, setColor] = useState(BRAND_COLORS[0].hex);

  return (
    <div className="max-w-xl p-1">
      <p className="text-brume">Le bandeau en haut de chaque maquette envoyée porte ton nom, pas celui de Pignon.</p>
      <div className="mt-6 flex flex-col gap-6">
        <Field label="Nom affiché" value={name} onChange={(event) => setName(event.target.value)} />
        <fieldset>
          <legend className="text-sm font-medium">Couleur du bandeau</legend>
          <div className="mt-2.5 flex gap-2">
            {BRAND_COLORS.map((item) => (
              <label key={item.hex} className="cursor-pointer rounded-full p-0.5 ring-offset-2 has-[:checked]:ring-2 has-[:checked]:ring-craie has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-craie">
                <input type="radio" name="couleur" className="sr-only" checked={color === item.hex} onChange={() => setColor(item.hex)} />
                <span className="block size-8 rounded-full" style={{ background: item.hex }} />
                <span className="sr-only">{item.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <p className="mt-8 text-sm text-brume">Aperçu du bandeau</p>
      <div className="mt-2 overflow-hidden rounded-xl shadow-flottant">
        <p className="px-4 py-2.5 text-sm text-white" style={{ background: color }}>
          Maquette de démonstration préparée par <strong className="font-medium">{name.trim() || "ta société"}</strong>. Ce n&apos;est pas son site officiel.
        </p>
        <div aria-hidden="true" className="h-24 bg-nuit-700" />
      </div>
      <Button size="lg" className="mt-6" onClick={() => toast.success("Marque enregistrée", { description: "Démo : l'aperçu ci-dessus est le seul endroit où elle s'applique" })}>
        Enregistrer la marque
      </Button>
    </div>
  );
}

function Demo() {
  const router = useRouter();
  const resetDemo = useAppStore((state) => state.resetDemo);
  const startFresh = useAppStore((state) => state.startFresh);
  const canTerritory = useCan("territory");

  return (
    <div className="max-w-xl divide-y divide-trait">
      <div className="pb-6">
        <p className="font-medium">Remettre la démo à zéro</p>
        <p className="mt-1 text-sm text-brume">
          Retour au compte Pro prérempli : son pipeline, ses réservations, ses alertes{canTerritory ? ". Tes territoires sont rendus" : ""}.
        </p>
        <Button
          variant="outline"
          size="lg"
          className="mt-3 bg-nuit-800"
          onClick={() => {
            resetDemo();
            toast.success("Démo réinitialisée");
          }}
        >
          Réinitialiser les données
        </Button>
      </div>
      <div className="pt-6">
        <p className="font-medium">Repartir d&apos;un compte neuf</p>
        <p className="mt-1 text-sm text-brume">Un compte Découverte vide, comme juste après l&apos;inscription, puis le choix de la zone.</p>
        <Button
          variant="outline"
          size="lg"
          className="mt-3 bg-nuit-800"
          onClick={() => {
            startFresh({});
            router.push("/bienvenue");
          }}
        >
          Repartir de zéro
        </Button>
      </div>
    </div>
  );
}
