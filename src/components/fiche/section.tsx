import { cn } from "@/lib/utils";

interface SectionProps {
  /** Id of the heading, used as the section's accessible name */
  id: string;
  title: string;
  /** One sentence under the title */
  lead?: React.ReactNode;
  /** Sits to the right of the title */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** One block of the sheet: an <h2>, an optional sentence, an optional action, then the content. */
export function Section({ id, title, lead, action, className, children }: SectionProps) {
  return (
    <section aria-labelledby={id} className={cn("min-w-0", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h2 id={id} className="titre text-xl">
            {title}
          </h2>
          {lead && <p className="mt-1.5 max-w-[64ch] text-sm text-brume">{lead}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
