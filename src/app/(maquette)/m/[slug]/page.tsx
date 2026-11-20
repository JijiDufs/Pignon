import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBusinessBySlug, getDa, getMaquetteContent } from "@/lib/data";
import { isDaId, TEMPLATES } from "@/maquettes";
import { MaquetteChrome } from "@/maquettes/chrome";

interface MaquettePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// /m/:slug?da=<id>[&embed=1] — the mockup of one business in one art direction.
export default function MaquettePage(props: MaquettePageProps) {
  return (
    <Suspense fallback={null}>
      <Maquette {...props} />
    </Suspense>
  );
}

async function Maquette({ params, searchParams }: MaquettePageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const business = getBusinessBySlug(slug);
  if (!business) notFound();

  const daId = isDaId(query.da) ? query.da : business.recommendedDas[0];
  const Template = TEMPLATES[daId];

  return (
    <>
      <Template business={business} content={getMaquetteContent(business)} da={getDa(daId)} />
      <MaquetteChrome slug={slug} da={daId} businessName={business.name} embed={query.embed === "1"} />
    </>
  );
}
