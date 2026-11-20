"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatEuro } from "@/lib/format";
import type { Business } from "@/lib/types";

interface StageDialogProps<T> {
  business: Business;
  onConfirm: (value: T) => void;
  onCancel: () => void;
}

/** Signing: the amount is asked once, pre-filled with the estimate. */
export function SignDialog({ business, onConfirm, onCancel }: StageDialogProps<number>) {
  const field = useId();
  const [amount, setAmount] = useState(String(business.estimatedDeal));
  const value = Number(amount);
  const valid = Number.isFinite(value) && value > 0;

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault();
            if (valid) onConfirm(Math.round(value));
          }}
        >
          <DialogHeader>
            <DialogTitle className="titre text-xl">{business.name} a signé</DialogTitle>
            <DialogDescription>À combien as-tu vendu le site ? L&apos;estimation était de {formatEuro(business.estimatedDeal)}.</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor={field}>Montant du site, en euros</Label>
            <Input
              id={field}
              type="number"
              inputMode="numeric"
              min={1}
              step={50}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="cote mt-1.5 h-11 text-lg"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={!valid}>
              Noter la signature
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function tomorrowAtTen(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(10, 0, 0, 0);
  // `datetime-local` wants local time without a zone.
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** A meeting needs its date: the queue of the day reads it. */
export function MeetingDialog({ business, onConfirm, onCancel }: StageDialogProps<number>) {
  const field = useId();
  const [when, setWhen] = useState(tomorrowAtTen);
  const at = new Date(when).getTime();
  const valid = Number.isFinite(at);

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault();
            if (valid) onConfirm(at);
          }}
        >
          <DialogHeader>
            <DialogTitle className="titre text-xl">Rendez-vous avec {business.name}</DialogTitle>
            <DialogDescription>
              Quand vois-tu {business.owner.civility} {business.owner.lastName} ? La date remontera dans ta file du jour.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor={field}>Date et heure</Label>
            <Input id={field} type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} className="cote mt-1.5 h-11" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={!valid}>
              Fixer le rendez-vous
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
