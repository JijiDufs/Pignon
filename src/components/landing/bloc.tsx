import { cn } from "@/lib/utils";

/** Title and lead of a landing section: the same voice down the page. */
export function Titre({ title, lead, className }: { title: string; lead?: string; className?: string }) {
  return (
    <div className={className}>
      <h2 className="enseigne max-w-[20ch] text-[clamp(2rem,4vw,3.125rem)]">{title}</h2>
      {lead && <p className="mt-5 max-w-[54ch] text-lg text-brume">{lead}</p>}
    </div>
  );
}

interface BlocProps {
  id?: string;
  title: string;
  lead?: string;
  className?: string;
  children: React.ReactNode;
}

/** A landing section: title on top, its own composition underneath. */
export function Bloc({ id, title, lead, className, children }: BlocProps) {
  return (
    <section id={id} className={cn("mx-auto max-w-[1240px] scroll-mt-16 px-4 py-20 sm:px-6 lg:px-10 lg:py-28", className)}>
      <Titre title={title} lead={lead} />
      <div className="mt-12">{children}</div>
    </section>
  );
}
