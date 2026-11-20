"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getPlan, PLAN_ORDER } from "@/lib/plans";
import { useAppStore } from "@/lib/store";
import type { PlanId } from "@/lib/types";
import { emailError, Field } from "./field";

type Touched = Record<string, boolean>;

/**
 * Both forms keep the password out of React state and out of the store: it is read once from the form
 * when it is sent, only to check that something was typed, and then dropped. Nothing is wired.
 */
function passwordOf(form: HTMLFormElement): string {
  const value = new FormData(form).get("motdepasse");
  return typeof value === "string" ? value : "";
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState<Touched>({});
  const [passwordMissing, setPasswordMissing] = useState(false);
  const mailError = touched.email ? emailError(email) : undefined;

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        const missing = passwordOf(event.currentTarget).length === 0;
        setTouched({ email: true });
        setPasswordMissing(missing);
        if (!emailError(email) && !missing) router.push("/app");
      }}
    >
      <Field
        label="E-mail"
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        onBlur={() => setTouched((current) => ({ ...current, email: true }))}
        error={mailError}
      />
      <Field
        label="Mot de passe"
        type="password"
        name="motdepasse"
        autoComplete="current-password"
        onChange={() => passwordMissing && setPasswordMissing(false)}
        error={passwordMissing ? "Indique ton mot de passe." : undefined}
      />
      <Button type="submit" size="xl" className="mt-1">
        Se connecter
      </Button>
      <p className="text-sm text-brume">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-medium text-craie underline decoration-trait-fort underline-offset-4 hover:decoration-craie">
          Essayer gratuitement
        </Link>
      </p>
    </form>
  );
}

function isPlan(value: string | null): value is PlanId {
  return value !== null && (PLAN_ORDER as string[]).includes(value);
}

export function SignupForm() {
  const router = useRouter();
  const asked = useSearchParams().get("formule");
  const chosen = isPlan(asked) && asked !== "free" ? getPlan(asked) : null;
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState<Touched>({});
  const [passwordError, setPasswordError] = useState<string>();

  const nameError = touched.firstName && !firstName.trim() ? "Indique ton prénom : on s'en sert dans tes scripts d'appel." : undefined;
  const mailError = touched.email ? emailError(email) : undefined;
  const touch = (field: string) => () => setTouched((current) => ({ ...current, [field]: true }));

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        const short = passwordOf(event.currentTarget).length < 8 ? "Choisis un mot de passe d'au moins 8 caractères." : undefined;
        setTouched({ firstName: true, email: true });
        setPasswordError(short);
        if (!firstName.trim() || emailError(email) || short) return;
        // The account of the demo: an empty Découverte account under this first name. The password goes nowhere.
        useAppStore.getState().startFresh({ firstName: firstName.trim(), email: email.trim() });
        router.push(chosen ? `/bienvenue?formule=${chosen.id}` : "/bienvenue");
      }}
    >
      {chosen && (
        <p className="rounded-xl bg-nuit-700 px-4 py-3 text-sm">
          Tu as choisi <strong className="font-medium">{chosen.name}</strong>. Tu l&apos;activeras juste après avoir réglé ta zone.
        </p>
      )}
      <Field label="Prénom" name="prenom" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} onBlur={touch("firstName")} error={nameError} />
      <Field label="E-mail" type="email" name="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} onBlur={touch("email")} error={mailError} />
      <Field
        label="Mot de passe"
        type="password"
        name="motdepasse"
        autoComplete="new-password"
        onChange={() => passwordError && setPasswordError(undefined)}
        error={passwordError}
        hint="8 caractères au moins."
      />
      <Button type="submit" size="xl" className="mt-1">
        Créer mon compte
      </Button>
      <p className="text-sm text-brume">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-medium text-craie underline decoration-trait-fort underline-offset-4 hover:decoration-craie">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
