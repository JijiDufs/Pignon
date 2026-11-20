import { cn } from "@/lib/utils";

const WIDTHS = {
  default: "max-w-[1240px]",
  narrow: "max-w-3xl",
  full: "max-w-none",
} as const;

/** Standard scrolling page inside the app shell: consistent gutters and max width. */
export function Page({
  width = "default",
  className,
  children,
}: {
  width?: keyof typeof WIDTHS;
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("mx-auto w-full px-4 py-6 sm:px-6 lg:px-10 lg:py-9", WIDTHS[width], className)}>{children}</div>;
}

/** The title block of an app page. One per page; `title` renders the <h1>. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4", className)}>
      <div className="min-w-0">
        <h1 className="enseigne text-3xl sm:text-[2.5rem]">{title}</h1>
        {description && <p className="mt-2.5 max-w-[64ch] text-brume">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
