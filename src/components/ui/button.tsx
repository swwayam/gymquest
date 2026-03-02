import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--xp-gold)]/70",
  {
    variants: {
      variant: {
        default: "bg-[var(--xp-gold)] text-[var(--bg-dark)] font-bold hover:brightness-110 glow-gold",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-white/15 bg-transparent text-white hover:bg-white/10 hover:border-white/30",
        secondary: "bg-white/10 text-white hover:bg-white/15",
        ghost: "text-[var(--text-muted)] hover:text-white hover:bg-white/10",
        link: "text-[var(--xp-gold)] underline-offset-4 hover:underline",
        push: "border-2 border-[var(--push-color)] bg-[var(--push-color)]/15 text-[var(--push-color)] hover:bg-[var(--push-color)]/30 glow-push",
        pull: "border-2 border-[var(--pull-color)] bg-[var(--pull-color)]/15 text-[var(--pull-color)] hover:bg-[var(--pull-color)]/30 glow-pull",
        legs: "border-2 border-[var(--legs-color)] bg-[var(--legs-color)]/15 text-[var(--legs-color)] hover:bg-[var(--legs-color)]/30 glow-legs",
        cardio: "border-2 border-[var(--cardio-color)] bg-[var(--cardio-color)]/15 text-[var(--cardio-color)] hover:bg-[var(--cardio-color)]/30 glow-green",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        xl: "h-14 rounded-lg px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
