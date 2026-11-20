import Link from "next/link";
import { DAS, getOpportunities, getSector, SECTORS } from "@/lib/data";

// /m — index of sample mockups: one business per trade, in every art direction. A working tool for the team.
export default function MaquetteGalleryPage() {
  const opportunities = getOpportunities("lille");
  const samples = SECTORS.flatMap((sector) => opportunities.filter((b) => b.sector === sector.id).slice(0, 2));

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px", font: "16px/1.5 system-ui, sans-serif", color: "#14213d" }}>
      <h1 style={{ fontSize: 32, margin: 0 }}>Galerie des maquettes</h1>
      <p style={{ color: "#5b6478" }}>Deux commerces inventés par métier, dans chaque direction artistique.</p>
      <ul style={{ listStyle: "none", padding: 0, marginTop: 32, display: "grid", gap: 20 }}>
        {samples.map((business) => (
          <li key={business.id} data-slug={business.slug} style={{ borderTop: "1px solid #dfe3ec", paddingTop: 16 }}>
            <strong>{business.name}</strong>
            <span style={{ color: "#5b6478" }}>
              {" "}
              {getSector(business.sector).label}, site : {business.site.status}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6 }}>
              {DAS.map((da) => (
                <Link key={da.id} href={`/m/${business.slug}?da=${da.id}&embed=1`}>
                  {da.name}
                </Link>
              ))}
              <Link href={`/m/${business.slug}/avant?embed=1`}>Avant</Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
