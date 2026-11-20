import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBusinessBySlug, getMaquetteContent } from "@/lib/data";
import { Avant } from "@/maquettes/avant";

interface AvantPageProps {
  params: Promise<{ slug: string }>;
}

// /m/:slug/avant — what the business has online today, recreated from its diagnosis.
export default function AvantPage({ params }: AvantPageProps) {
  return (
    <Suspense fallback={null}>
      <Before params={params} />
    </Suspense>
  );
}

async function Before({ params }: AvantPageProps) {
  const { slug } = await params;
  const business = getBusinessBySlug(slug);
  if (!business) notFound();
  return <Avant business={business} content={getMaquetteContent(business)} />;
}
