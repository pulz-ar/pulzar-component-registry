import React from "react"
import { cn } from "@/lib/utils"

export interface PromptButtonProps {
  children?: React.ReactNode
  className?: string
  title?: string
  ariaLabel?: string
  type?: "button" | "submit"
  disabled?: boolean
  active?: boolean
  onClick?: () => void
}

export function PromptButton({ children, className, title, ariaLabel, type, disabled, active, onClick }: PromptButtonProps) {
  const buttonType = type ? type : "button"
  const isActive = Boolean(active)

  return (
    <button
      type={buttonType}
      title={title}
      aria-label={ariaLabel || title}
      disabled={disabled}
      data-active={isActive ? "true" : "false"}
      onClick={onClick}
      className={cn(
        "h-9 w-9 px-0 grid place-items-center rounded-lg border",
        "border-border bg-background text-foreground p-0",
        "hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "disabled:opacity-50 disabled:pointer-events-none",
        "data-[active=true]:bg-accent/40 data-[active=true]:border-accent",
        className
      )}
    >
      {children}
    </button>
  )
}

export default PromptButton


