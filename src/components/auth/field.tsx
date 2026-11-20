"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FieldProps extends Omit<React.ComponentProps<"input">, "id"> {
  label: string;
  /** Shown under the field and read with it; empty or undefined when the value is fine */
  error?: string;
  hint?: string;
}

/** A labelled input whose error is tied to it for screen readers. */
export function Field({ label, error, hint, ...props }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-erreur` : hint ? `${id}-aide` : undefined;

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className="mt-1.5 h-11 bg-nuit-800 text-base md:text-base" {...props} />
      {error ? (
        <p id={`${id}-erreur`} className="mt-1.5 text-sm text-enseigne">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-aide`} className="mt-1.5 text-sm text-pave">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function emailError(value: string): string | undefined {
  if (!value.trim()) return "Indique ton e-mail.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Cet e-mail n'a pas la bonne forme : il manque peut-être le @ ou le domaine.";
  return undefined;
}
