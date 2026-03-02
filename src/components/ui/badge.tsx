import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-[var(--xp-gold)]/40 bg-[var(--xp-gold)]/20 text-[var(--xp-gold)]",
        push: "border-[var(--push-color)]/40 bg-[var(--push-color)]/20 text-[var(--push-color)]",
        pull: "border-[var(--pull-color)]/40 bg-[var(--pull-color)]/20 text-[var(--pull-color)]",
        legs: "border-[var(--legs-color)]/40 bg-[var(--legs-color)]/20 text-[var(--legs-color)]",
        cardio: "border-[var(--cardio-color)]/40 bg-[var(--cardio-color)]/20 text-[var(--cardio-color)]",
        warning: "border-[var(--warning-amber)]/40 bg-[var(--warning-amber)]/20 text-[var(--warning-amber)]",
        muted: "border-white/10 bg-white/10 text-[var(--text-muted)]",
        perfect: "border-[var(--xp-gold)] bg-[var(--xp-gold)]/30 text-[var(--xp-gold)] font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
