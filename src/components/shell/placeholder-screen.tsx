"use client";

import { Page, PageHeader } from "@/components/pignon/page";

/** Temporary body of a route whose screen is not built yet. */
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <Page>
      <PageHeader title={title} description="Écran en construction." />
    </Page>
  );
}
