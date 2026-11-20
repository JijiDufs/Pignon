import type { Business, Da, MaquetteContent } from "@/lib/types";

/** What every art-direction template receives. Templates render a complete one-page website. */
export interface MaquetteProps {
  business: Business;
  content: MaquetteContent;
  da: Da;
}

export type MaquetteTemplate = (props: MaquetteProps) => React.ReactNode;
