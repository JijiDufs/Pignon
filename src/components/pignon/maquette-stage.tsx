"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Maximize2, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getDa } from "@/lib/data";
import { rebond } from "@/lib/motion";
import type { DaId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MaquetteFrame } from "./maquette-frame";

interface MaquetteStageProps {
  slug: string;
  da: DaId;
  /** Name of the business, for the accessible title of the enlarged view */
  name: string;
  /** False keeps the devices dimmed and low until the scene is ready to bring them forward */
  lit?: boolean;
  className?: string;
  /** Overlays pinned to the stage (a notice, a caption) */
  children?: React.ReactNode;
}

/**
 * The mockup as an object: a browser and a phone standing in perspective, like devices photographed on a table.
 * Clicking the stage brings the device forward, straight and full size, where the site can be browsed.
 */
export function MaquetteStage({ slug, da, name, lit = true, className, children }: MaquetteStageProps) {
  const [zoomed, setZoomed] = useState<"desktop" | "mobile" | null>(null);

  return (
    <div className={cn("scene-3d relative overflow-hidden rounded-3xl bg-nuit-700 px-6 pt-10 pb-14 sm:px-10", className)}>
      <div
        className={cn(
          "relative mx-auto max-w-[780px] transition-[opacity,transform] duration-700 ease-doux [transform-style:preserve-3d]",
          lit ? "opacity-100" : "translate-y-4 opacity-30",
        )}
      >
        <div className="w-[84%] origin-left [transform:rotateY(13deg)_rotateX(4deg)]">
          <MaquetteFrame slug={slug} da={da} interactive={false} className="shadow-halo" />
        </div>
        <div className="absolute right-0 -bottom-[7%] w-[23%] [transform:rotateY(-16deg)_rotateX(4deg)_translateZ(60px)]">
          <MaquetteFrame slug={slug} da={da} device="mobile" interactive={false} />
        </div>
        <button
          type="button"
          onClick={() => setZoomed("desktop")}
          aria-label="Agrandir la maquette"
          className="absolute inset-0 z-10 cursor-zoom-in rounded-2xl"
        />
      </div>
      <span className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-1.5 rounded-md bg-nuit-800 px-2 py-1 text-2xs text-brume shadow-petit">
        <Maximize2 aria-hidden="true" className="size-3" />
        Clique pour la parcourir
      </span>
      {children}

      <Dialog open={zoomed !== null} onOpenChange={(open) => !open && setZoomed(null)}>
        <DialogContent className="scene-3d w-full max-w-[min(1180px,94vw)] gap-3 bg-transparent p-0 ring-0 sm:max-w-[min(1180px,94vw)]" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>Maquette de {name}</DialogTitle>
            <DialogDescription>Direction artistique {getDa(da).name}. La maquette se parcourt comme un vrai site.</DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotateY: 13, rotateX: 4 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }}
            transition={rebond}
            className="mx-auto w-full"
            style={{ maxWidth: zoomed === "mobile" ? 340 : undefined }}
          >
            {zoomed && <MaquetteFrame key={zoomed} slug={slug} da={da} device={zoomed} className="shadow-halo" />}
          </motion.div>
          <div className="mx-auto flex items-center gap-1 rounded-xl bg-nuit-800 p-1 shadow-flottant">
            {(["desktop", "mobile"] as const).map((device) => (
              <button
                key={device}
                type="button"
                aria-pressed={zoomed === device}
                onClick={() => setZoomed(device)}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg px-3 text-ui font-medium transition-colors",
                  zoomed === device ? "bg-craie text-nuit-950" : "text-brume hover:bg-nuit-700",
                )}
              >
                {device === "desktop" ? <Monitor aria-hidden="true" className="size-3.5" /> : <Smartphone aria-hidden="true" className="size-3.5" />}
                {device === "desktop" ? "Ordinateur" : "Téléphone"}
              </button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setZoomed(null)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
