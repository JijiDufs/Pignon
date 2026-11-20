import { cn } from "@/lib/utils";

/** A keyboard key, for shortcut hints. */
export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-trait-fort bg-nuit-800 px-1 font-sans text-2xs font-medium text-brume",
        className,
      )}
      {...props}
    />
  );
}
