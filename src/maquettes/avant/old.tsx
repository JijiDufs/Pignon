import { Browser } from "./browser";
import { hostOf, SECTOR_TINT, seed, type AvantProps } from "./lib";

const TABS = ["Accueil", "Nos prestations", "Tarifs", "Plan d'accès", "Contact"];

/**
 * A site that works but shows its age: the look of the early 2010s, rebuilt from the diagnosis.
 * `not-mobile` freezes it at 980 px, `insecure` opens the browser's warning, a directory-made
 * site gets the uniform template that hundreds of shops share.
 */
export function Old({ business, content }: AvantProps) {
  const { site } = business;
  const tint = SECTOR_TINT[business.sector];
  const host = hostOf(business);

  if (site.status === "ok") {
    return (
      <Browser host={host} secure>
        <div style={{ fontFamily: "Helvetica, Arial, sans-serif", color: "#1f2933" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 6%", borderBottom: "1px solid #e3e7ec" }}>
            <strong style={{ fontSize: 20 }}>{business.name}</strong>
            <span style={{ color: tint.main, fontWeight: 700 }}>{business.phone}</span>
          </div>
          <div style={{ padding: "64px 6%", background: tint.pale }}>
            <h1 style={{ margin: 0, fontSize: 38, maxWidth: 620, lineHeight: 1.15 }}>{content.tagline}</h1>
            <p style={{ maxWidth: 520, fontSize: 17, lineHeight: 1.6 }}>{content.intro}</p>
          </div>
          <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, padding: "40px 6%", margin: 0, listStyle: "none" }}>
            {content.services.slice(0, 3).map((service) => (
              <li key={service.name}>
                <strong>{service.name}</strong>
                <p style={{ margin: "6px 0 0", color: "#52606d" }}>{service.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </Browser>
    );
  }

  const fixed = site.status === "not-mobile";
  const directory = site.platform?.startsWith("Solocal") ?? false;
  const year = site.copyrightYear ?? 2014;
  const visits = String(10_000 + (seed(business.id) % 80_000)).padStart(6, "0");
  const bevel = "inset 1px 1px 0 rgba(255,255,255,.75), inset -1px -1px 0 rgba(0,0,0,.35)";

  return (
    <Browser host={host} secure={site.https ?? false} warning={site.status === "insecure"}>
      <div style={{ minHeight: "100%", background: directory ? "#dcdcdc" : tint.pale, padding: fixed ? "0" : "0 0 24px" }}>
        <div
          style={{
            // A frozen desktop layout: on a phone it overflows sideways and the text is tiny.
            width: fixed ? 980 : "min(100%, 980px)",
            margin: "0 auto",
            background: "#fff",
            border: "1px solid #999",
            fontFamily: "Verdana, Geneva, Arial, sans-serif",
            fontSize: fixed ? 11 : 12.5,
            lineHeight: 1.55,
            color: "#222",
          }}
        >
          <div
            style={{
              padding: "22px 24px",
              color: "#fff",
              background: directory ? "linear-gradient(#6f6f6f, #3c3c3c)" : `linear-gradient(${tint.main}, ${tint.dark})`,
              textShadow: "1px 1px 2px rgba(0,0,0,.6)",
            }}
          >
            <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: fixed ? 30 : 28, fontWeight: 700 }}>{business.name}</div>
            <div style={{ fontStyle: "italic", marginTop: 4 }}>
              {content.sectorLabel} à {content.city} : bienvenue sur notre site internet
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: fixed ? "nowrap" : "wrap", background: "#e4e4e4", borderBottom: "1px solid #999" }}>
            {TABS.map((tab, index) => (
              <span
                key={tab}
                style={{
                  padding: "7px 14px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  boxShadow: bevel,
                  color: index === 0 ? "#fff" : "#333",
                  background: index === 0 ? tint.accent : "linear-gradient(#fdfdfd, #cfcfcf)",
                }}
              >
                {tab}
              </span>
            ))}
          </div>

          <div style={{ background: "#fff7c2", borderBottom: "1px solid #d9c96a", padding: "5px 24px", fontWeight: 700, color: "#7a5b00" }}>
            Nouveau : notre site est en cours de mise à jour, merci de votre compréhension
          </div>

          <div style={{ display: "flex", flexWrap: fixed ? "nowrap" : "wrap", gap: 20, padding: 24 }}>
            <div style={{ flex: "1 1 320px", minWidth: 0 }}>
              <h1 style={{ margin: "0 0 10px", fontFamily: "Georgia, serif", fontSize: 20, color: tint.dark, borderBottom: `2px solid ${tint.accent}`, paddingBottom: 4 }}>
                Bienvenue
              </h1>
              <p style={{ margin: "0 0 10px", textAlign: "justify" }}>
                {business.name} vous accueille à {content.city} et met son savoir-faire à votre service. N&apos;hésitez pas à nous contacter
                pour tout renseignement complémentaire ou pour une demande de devis.
              </p>
              <p style={{ margin: "0 0 6px", fontWeight: 700, color: tint.dark }}>Nos prestations :</p>
              <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>
                {content.services.map((service) => (
                  <li key={service.name}>{service.name}</li>
                ))}
              </ul>
              <p style={{ margin: 0 }}>
                <u style={{ color: "#00c" }}>Cliquez ici</u> pour consulter nos tarifs (document PDF).
              </p>
            </div>

            <div style={{ flex: "0 0 230px" }}>
              <div style={{ border: "1px solid #999", background: "linear-gradient(#f4f4f4, #dcdcdc)", padding: 12, boxShadow: bevel }}>
                <div style={{ fontWeight: 700, color: tint.dark }}>Nous contacter</div>
                {/* The number as a picture, the way it was done to dodge spam: no tap-to-call. */}
                <div style={{ margin: "8px 0", padding: "6px 8px", background: "#fff", border: "1px inset #bbb", fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 14, userSelect: "none" }}>
                  {business.phone}
                </div>
                <div>{content.address}</div>
              </div>
              <div style={{ marginTop: 12, textAlign: "center", fontSize: 11, color: "#555" }}>
                Vous êtes le visiteur n°
                <div style={{ display: "inline-block", marginLeft: 6, padding: "2px 6px", background: "#000", color: "#3f3", fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: 2 }}>
                  {visits}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "10px 24px", background: "#efefef", borderTop: "1px solid #999", fontSize: 10.5, color: "#555", textAlign: "center" }}>
            © {year} {business.name}. Tous droits réservés.{" "}
            {directory
              ? "Site vitrine créé et hébergé par votre annuaire professionnel, modèle « Classique »."
              : "Site optimisé pour un affichage en 1024 × 768."}
          </div>
        </div>
      </div>
    </Browser>
  );
}
