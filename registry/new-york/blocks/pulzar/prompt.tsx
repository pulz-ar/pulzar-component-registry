"use client"

import React from "react"
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from "@/components/ai-elements/prompt-input"

import { Mic, ArrowUp, Plus } from "lucide-react"

export function Prompt({
  value,
  onChange,
  onSubmit,
  onToggleVoice,
  reasoningLevel,
  onChangeReasoning,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent) => void
  onToggleVoice?: () => void
  reasoningLevel?: 0 | 1 | 2 | 3
  onChangeReasoning?: (v: 0 | 1 | 2 | 3) => void
}) {
  const isDirty = (value || "").trim().length > 0
  return (
    <PromptInput onSubmit={onSubmit}>
      <PromptInputTextarea value={value} minHeight={64} className="text-base" />
      <PromptInputToolbar>
        <div className="flex items-center gap-1 min-h-9">
          <button type="button" aria-label="Más opciones" title="Más opciones" className="h-9 w-9 grid place-items-center border rounded-none rounded-bl-2xl bg-transparent">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-1 min-h-9">
          {onToggleVoice && (
            <button type="button" aria-label="Voz" title="Voz" className="h-9 w-9 grid place-items-center border rounded-lg bg-transparent" onClick={onToggleVoice}>
              <Mic className="h-4 w-4" />
            </button>
          )}
          <PromptInputSubmit disabled={!isDirty} className="h-9 w-9 grid place-items-center border rounded-none rounded-br-2xl bg-transparent">
            <ArrowUp className="h-4 w-4" />
          </PromptInputSubmit>
        </div>
      </PromptInputToolbar>
    </PromptInput>
  )
}


