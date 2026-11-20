import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The payment method of the demo: a fixed, read-only card.
 * There is deliberately no input here: nobody must be able to type a real card number in a prototype.
 */
export function DemoCard({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3.5 rounded-xl border border-dashed border-trait-fort px-4 py-3.5", className)}>
      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-nuit-700 text-brume">
        <CreditCard className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium">
          Carte de démonstration, se terminant par <span className="cote">4242</span>
        </p>
        <p className="text-ui text-brume">Mode démo : aucun paiement n&apos;est effectué</p>
      </div>
    </div>
  );
}
