import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-white/15 bg-[var(--bg-dark)] px-3 py-2 text-sm text-white ring-offset-transparent placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:border-[var(--xp-gold)]/60 focus-visible:ring-1 focus-visible:ring-[var(--xp-gold)]/40 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
