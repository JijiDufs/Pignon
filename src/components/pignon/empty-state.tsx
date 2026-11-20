import { cn } from "@/lib/utils";
import { PignonMark } from "./logo";

interface EmptyStateProps {
  title: string;
  /** What to do next, in one sentence */
  description: string;
  /** Usually one primary button */
  action?: React.ReactNode;
  className?: string;
}

/** An empty screen is an invitation to act: say what goes here and offer the first step. */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <PignonMark className="size-10 text-nuit-600" windowColor="var(--color-nuit-900)" />
      <p className="titre mt-5 text-xl">{title}</p>
      <p className="mt-2 max-w-[44ch] text-brume">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
