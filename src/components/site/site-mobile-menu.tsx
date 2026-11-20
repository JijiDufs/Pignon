"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { LinkButton } from "@/components/pignon/link-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SITE_LINKS } from "./site-links";

export function SiteMobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-lg" aria-label="Ouvrir le menu">
            <Menu aria-hidden="true" className="size-5" />
          </Button>
        }
      />
      <SheetContent side="right" className="w-[82%] gap-0 p-0">
        <SheetHeader className="border-b border-trait p-5">
          <SheetTitle className="titre text-lg">Menu</SheetTitle>
        </SheetHeader>
        <nav aria-label="Navigation du site" className="flex flex-col p-3">
          {SITE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="flex h-12 items-center rounded-lg px-3 text-base font-medium hover:bg-nuit-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t border-trait p-5">
          <LinkButton href="/inscription" size="xl" onClick={close}>
            Essayer gratuitement
          </LinkButton>
          <LinkButton href="/connexion" variant="outline" size="lg" onClick={close}>
            Se connecter
          </LinkButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
