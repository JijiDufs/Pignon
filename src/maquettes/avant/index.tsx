import { Dead } from "./dead";
import type { AvantProps } from "./lib";
import { Old } from "./old";
import { Serp } from "./serp";
import { Social } from "./social";

/** The business's current web presence, recreated: one variant per site status. */
export function Avant(props: AvantProps) {
  switch (props.business.site.status) {
    case "none":
      return <Serp {...props} />;
    case "social-only":
      return <Social {...props} />;
    case "dead":
      return <Dead {...props} />;
    default:
      return <Old {...props} />;
  }
}
