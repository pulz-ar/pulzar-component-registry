"use client"
import * as React from "react"
import { useChat } from "@ai-sdk/react"
import { Thread, ThreadContent, ThreadScrollButton } from "@/registry/new-york/blocks/pulzar/thread"
import { Event as ThreadEvent } from "@/registry/new-york/blocks/pulzar/event"
import { Prompt } from "@/registry/new-york/blocks/pulzar/prompt"
// This page displays items from the custom registry.
// You are free to implement this with your own design as needed.

export default function Home() {
  const { messages, status, input, handleInputChange, handleSubmit } = useChat({ api: "/api/agent" }) as any

  return (
    <div className="max-w-5xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Pulzar Registry</h1>
        <p className="text-muted-foreground">Wrappers @pulzar/* + AI Elements en acción</p>
      </header>
      <main className="flex flex-col flex-1 gap-8">
        {/* Showcase Agent (Thread + Event + Prompt) */}
        <section className="flex flex-col gap-4 border rounded-lg p-4 min-h-[450px] relative">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-muted-foreground sm:pl-3">Demo: Agent</h2>
          </div>
          <div className="flex flex-col min-h-[400px] relative">
            <div className="flex-1 min-h-0 border rounded-md">
              <div className="h-[360px] flex flex-col">
                <Thread className="h-full">
                  <ThreadContent>
                    {messages.map((m: any) => (
                      <ThreadEvent key={m.id} role={m.role} parts={m.parts || []} isStreaming={status === 'streaming'} />
                    ))}
                  </ThreadContent>
                  <ThreadScrollButton />
                </Thread>
              </div>
            </div>
            <div className="mt-3">
              <Prompt
                value={input || ""}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </section>

        {/* Listado de componentes incluidos */}
        <section className="flex flex-col gap-2 border rounded-lg p-4">
          <h3 className="text-sm font-medium">Componentes incluidos</h3>
          <ul className="list-disc pl-6 text-sm text-muted-foreground">
            <li>@pulzar/thread → Thread, ThreadContent, ThreadScrollButton</li>
            <li>@pulzar/event → Event (text, reasoning, source-url, code, image, inline-citation, loader, suggestion, task, tool, web-preview)</li>
            <li>@pulzar/prompt → Prompt</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
