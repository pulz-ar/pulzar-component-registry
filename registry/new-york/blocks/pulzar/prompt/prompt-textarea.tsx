"use client"

import React, { KeyboardEventHandler, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export type PromptTextareaProps = React.ComponentProps<"textarea"> & {
  minHeight?: number
  maxHeight?: number
}

export function PromptTextarea({
  className,
  placeholder = "What would you like to know?",
  minHeight = 64,
  maxHeight = 192,
  onChange,
  ...props
}: PromptTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) { return }
    el.style.height = "auto"
    const next = Math.min(el.scrollHeight, maxHeight)
    el.style.height = `${next}px`
  }, [props.value, maxHeight])
  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter") {
      if ((e as any).nativeEvent?.isComposing) {
        return
      }
      if (e.shiftKey) {
        return
      }
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) {
        form.requestSubmit()
      }
    }
  }

  return (
    <textarea
      ref={ref}
      name="message"
      placeholder={placeholder}
      onChange={(e) => onChange?.(e)}
      onKeyDown={handleKeyDown}
      style={{ minHeight, maxHeight }}
      className={cn(
        "w-full resize-none rounded-none border-0 p-3 text-base",
        "bg-white text-foreground placeholder:text-muted-foreground",
        "dark:bg-transparent dark:text-foreground dark:placeholder:text-muted-foreground",
        "shadow-none outline-none ring-0 focus-visible:ring-0",
        "field-sizing-content",
        className
      )}
      {...props}
    />
  )
}

export default PromptTextarea


