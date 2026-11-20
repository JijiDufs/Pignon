import { getOpportunities } from "@/lib/data";
import { takenByOthers } from "@/lib/exclusivity";
import type { Business, SectorId, SiteStatus } from "@/lib/types";

const CITY = "lille";

/** Opportunities of the demo city that nobody else holds, best score first. */
function free(): Business[] {
  return getOpportunities(CITY).filter((business) => !takenByOthers(business.id));
}

function firstOf(list: Business[], test: (business: Business) => boolean): Business {
  return list.find(test) ?? list[0];
}

/** The business the page follows from its mockup to the call: the best garage of Lille still free. */
export function getVedette(): Business {
  return firstOf(free(), (business) => business.sector === "garage");
}

/** Three businesses of different trades, for the reservation demo. */
export function getReservables(): Business[] {
  const list = free();
  const trades: SectorId[] = ["garage", "bakery", "restaurant"];
  return trades.map((sector) => firstOf(list, (business) => business.sector === sector));
}

/** Three businesses whose scores come from different situations. */
export function getScored(): Business[] {
  const list = free();
  const statuses: SiteStatus[] = ["none", "dead", "insecure"];
  return statuses.map((status, index) =>
    firstOf(list, (business) => business.site.status === status && (index > 0 || business.sector === "garage")),
  );
}
