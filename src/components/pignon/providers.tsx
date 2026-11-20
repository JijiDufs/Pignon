"use client";

import { MotionConfig } from "motion/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // reducedMotion="user": every Motion animation honours the OS setting.
    <MotionConfig reducedMotion="user">
      <TooltipProvider delay={250}>{children}</TooltipProvider>
      <Toaster position="bottom-right" />
    </MotionConfig>
  );
}
