import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, EllipsisVertical, Info, Lock, RotateCw, TriangleAlert } from "lucide-react";

interface BrowserProps {
  /** Address shown in the bar, without its scheme */
  host: string;
  /** Padlock when true, the "Non sécurisé" mention when false, a plain info mark when no site answered */
  secure?: boolean;
  /** Opens the browser's own warning under the address bar */
  warning?: boolean;
  children: ReactNode;
}

/**
 * A drawn, brandless browser window: the address bar stays put and the page scrolls underneath,
 * so a fixed-width site can overflow sideways without dragging the bar along.
 */
export function Browser({ host, secure, warning = false, children }: BrowserProps) {
  return (
    <div className="flex h-screen flex-col bg-white text-[#202124]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="relative z-10 flex h-[52px] shrink-0 items-center gap-2 border-b border-[#c4c7ce] bg-[#e9ebef] px-2.5 sm:gap-3 sm:px-4">
        <span aria-hidden="true" className="hidden items-center gap-3 text-[#5f6368] sm:flex">
          <ArrowLeft className="size-5" />
          <ArrowRight className="size-5 opacity-35" />
          <RotateCw className="size-[18px]" />
        </span>
        <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#d3d6dc] bg-white pr-4 pl-1 text-[15px]">
          {secure === undefined ? (
            <Info aria-hidden="true" className="ml-2.5 size-[18px] shrink-0 text-[#5f6368]" />
          ) : secure ? (
            <Lock role="img" aria-label="Connexion sécurisée" className="ml-2.5 size-4 shrink-0 text-[#5f6368]" />
          ) : (
            <span className="flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-[#fce8e6] px-2.5 font-bold text-[#c5221f]">
              <TriangleAlert aria-hidden="true" className="size-4" strokeWidth={2.4} />
              Non sécurisé
            </span>
          )}
          <span className="truncate">{host}</span>
        </div>
        <span aria-hidden="true" className="flex items-center gap-2 text-[#5f6368]">
          <span className="flex size-[22px] items-center justify-center rounded-md border-2 border-current text-[11px] font-bold sm:hidden">
            1
          </span>
          <EllipsisVertical className="size-5" />
        </span>

        {warning && (
          <div
            role="note"
            className="absolute top-[47px] right-2.5 left-2.5 rounded-xl border border-[#d3d6dc] bg-white p-4 shadow-[0_10px_30px_rgba(32,33,36,0.3)] sm:right-auto sm:left-[112px] sm:w-[410px] sm:p-5"
          >
            <span aria-hidden="true" className="absolute -top-[7px] left-12 size-3 rotate-45 border-t border-l border-[#d3d6dc] bg-white" />
            <p className="flex items-start gap-2.5 text-[17px] leading-snug font-bold text-[#c5221f] sm:text-[19px]">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={2.4} />
              Votre connexion à ce site n&apos;est pas sécurisée
            </p>
            <p className="mt-2.5 text-[14px] leading-relaxed text-[#3c4043] sm:text-[15px]">
              N&apos;y saisissez aucune information sensible (mot de passe, carte bancaire) : elle pourrait être
              interceptée.
            </p>
          </div>
        )}
      </div>

      <div className="relative min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}
