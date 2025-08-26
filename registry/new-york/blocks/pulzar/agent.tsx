"use client"

import React, { useState } from "react"
import { useThread } from './use-thread'
import { Thread, ThreadContent, ThreadScrollButton } from './thread'
import { Event as ThreadEvent } from './event'
import { Prompt } from './prompt'

import { Loader } from '@/components/ai-elements/loader'
import { id } from "@instantdb/core"

// Guard global para evitar doble envío de initialPrompt por Strict Mode (dev)
const agentBootGuard: { lastPrompt?: string; lastAt?: number } = (globalThis as any).__pulzarAgentBootGuard || {}
;(globalThis as any).__pulzarAgentBootGuard = agentBootGuard


export default function Agent({ domain, className, initialPrompt, initialWebSearch, initialReasoningLevel }: { domain?: string; className?: string; initialPrompt?: string; initialWebSearch?: boolean; initialReasoningLevel?: 0 | 1 | 2 | 3 }) {
  const [webSearch, setWebSearch] = useState(Boolean(initialWebSearch))
  const [reasoningLevel, setReasoningLevel] = useState<0 | 1 | 2 | 3>(typeof initialReasoningLevel === 'number' ? initialReasoningLevel as 0|1|2|3 : 1)
  const [threadId] = useState<string>(id())
  const { events, status, input, handleInputChange, handleSubmit } = useThread({ threadId, url: "/api/stories/" + threadId })
  const [isUploading, setIsUploading] = useState(false)
  const [attachments, setAttachments] = useState<Array<{ id: string, file: File, previewURL: string, name: string, size?: string, type?: string, status: 'uploading'|'done'|'error', uploadedId?: string }>>([])

  async function handleFilesSelected(files: FileList) {
    const list = Array.from(files)
    const previews = list.map((file, idx) => ({ id: `${Date.now()}-${idx}`, file, previewURL: URL.createObjectURL(file), name: file.name, size: `${Math.round(file.size/1024)} KB`, type: file.type, status: 'uploading' as const }))
    setAttachments((prev) => [...prev, ...previews])
    setIsUploading(true)
    try {
      // Stub upload to backend. We only POST to a placeholder endpoint; backend not implemented yet
      const form = new FormData()
      previews.forEach((p) => form.append("files", p.file))
      const resp = await fetch(`/api/stories/${threadId}/upload`, { method: "POST", body: form })
      const json = await resp.json().catch(() => ({} as any))
      const serverFiles = Array.isArray(json?.files) ? json.files : []
      // Update only the batch we just uploaded, by matching the local preview ids
      setAttachments((prev) => prev.map((p) => {
        const idx = previews.findIndex((pp) => pp.id === p.id)
        if (idx === -1) { return p }
        const f = serverFiles[idx]
        if (f) { return { ...p, status: 'done', uploadedId: f.id } }
        return { ...p, status: 'error' }
      }))
    } finally {
      setIsUploading(false)
    }
  }

  function handleRemoveAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <main className={["min-h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] p-0 h-full", className || ""].join(" ") }>
      <div className="w-full md:h-full">
        <div className="px-6 py-6 h-full">
          <div className="h-full max-w-4xl mx-auto">
            <div className="flex flex-col h-full">
              <Thread className="h-full">
                <ThreadContent>
                  {(events || []).map((e) => (
                    <div key={e.id}>
                      <ThreadEvent
                        role={e.role}
                        parts={Array.isArray((e as any).parts)
                          ? (e as any).parts
                          : [{ type: 'text', text: String((e as any)?.payload?.body?.text || '') }]}
                        isStreaming={status === 'streaming'}
                      />
                    </div>
                  ))}
                  {status === 'submitted' && <Loader />}
                </ThreadContent>
                <ThreadScrollButton />
              </Thread>

              <div className="mt-4">
                <Prompt
                  value={input}
                  onChange={handleInputChange as any}
                  onSubmit={handleSubmit}
                  onToggleVoice={() => {}}
                  reasoningLevel={reasoningLevel}
                  onChangeReasoning={setReasoningLevel}
                  webSearch={webSearch}
                  onToggleWeb={() => setWebSearch(!webSearch)}
                  status={status as any}
                  onFilesSelected={handleFilesSelected}
                  isUploading={isUploading}
                  attachments={attachments.map((a) => ({ id: a.id, name: a.name, size: a.size, previewURL: a.previewURL, status: a.status, type: a.type })) as any}
                  onRemoveAttachment={handleRemoveAttachment}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}


