"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

// Single (dark blue) theme: no theme provider needed.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-pharmacie" />,
        info: <InfoIcon className="size-4 text-lune" />,
        warning: <TriangleAlertIcon className="size-4 text-ambre" />,
        error: <OctagonXIcon className="size-4 text-enseigne" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--color-trait-fort)",
          "--border-radius": "calc(var(--radius) * 1.4)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast font-sans shadow-flottant!",
          description: "text-brume!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
