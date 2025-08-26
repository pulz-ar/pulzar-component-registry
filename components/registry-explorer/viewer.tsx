"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Orb } from "@/registry/new-york/blocks/pulzar/orb"
import { Thread, ThreadContent, ThreadScrollButton } from "@/registry/new-york/blocks/pulzar/thread"
import { Event as ThreadEvent } from "@/registry/new-york/blocks/pulzar/event"
import { Prompt } from "@/registry/new-york/blocks/pulzar/prompt"
import { StoriesDocs } from "@/app/components/stories-docs"

interface RegistryItemMeta {
  name: string
  title?: string
  description?: string
}

export function Viewer({ item, className }: { item: RegistryItemMeta; className?: string }) {
  return (
    <section className={cn("border rounded-lg p-4 flex flex-col gap-4", className)}>
      <header className="flex items-start justify-between gap-2 border-l-4 border-cyan-500 pl-3">
        <div>
          <h2 className="text-base font-semibold text-cyan-700 dark:text-cyan-300">{item.title || item.name}</h2>
          {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
        </div>
      </header>
      {renderPreview(item.name)}
      {renderSnippets(item.name)}
    </section>
  )
}

function renderPreview(name: string) {
  if (name === "pulzar/stories") {
    return (
      <div className="border rounded-md p-2">
        <StoriesDocs />
      </div>
    )
  }

  if (name === "pulzar/orb") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 place-items-center">
        <Orb width={280} height={280} theme="light" />
        <Orb width={280} height={280} theme="dark" initialAnimation="explode" shader={{ type: "liquid-metal", colorBack: "hsl(0,0%,0%)", colorTint: "hsl(0,0%,100%)", repetition: 4, softness: 0.3, shiftRed: 0.3, shiftBlue: 0.3, distortion: 0.1, contour: 1, shape: "none", offsetX: 0, offsetY: 0, scale: 1, rotation: 0, speed: 1, position: "figure" }} />
      </div>
    )
  }

  if (name === "pulzar/thread") {
    const [messages, status] = useDemoMessages()
    return (
      <div className="flex flex-col">
        <div className="border rounded-md">
          <div className="max-h-[280px] overflow-auto flex flex-col">
            <Thread className="h-full">
              <ThreadContent>
                {messages.map((m, i) => (
                  <ThreadEvent key={i} role={m.role} parts={m.parts} isStreaming={status === "streaming"} />
                ))}
              </ThreadContent>
              <ThreadScrollButton />
            </Thread>
          </div>
        </div>
      </div>
    )
  }

  if (name === "pulzar/event") {
    const examples = [
      { role: "assistant", parts: [{ type: "text", text: "Respuesta de texto simple." }] },
      { role: "assistant", parts: [{ type: "reasoning", text: "Razonamiento expandible." }] },
      { role: "assistant", parts: [{ type: "source-url", url: "https://pulzar.ai" }] },
      { role: "assistant", parts: [{ type: "code", language: "tsx", code: "export function Example() {\n  return <div>Hola</div>\n}" }] },
    ]
    return (
      <div className="border rounded-md p-2">
        <div className="space-y-2">
          {examples.map((m, i) => (
            <ThreadEvent key={i} role={m.role} parts={m.parts as any[]} />
          ))}
        </div>
      </div>
    )
  }

  if (name === "pulzar/prompt") {
    return (
      <div className="border rounded-md p-3">
        <Prompt value={""} onChange={() => {}} onSubmit={() => {}} />
      </div>
    )
  }

  if (name === "pulzar/all") {
    const [messages, status] = useDemoMessages()
    return (
      <div className="flex flex-col">
        <div className="border rounded-md">
          <div className="max-h-[280px] overflow-auto flex flex-col">
            <Thread className="h-full">
              <ThreadContent>
                {messages.map((m, i) => (
                  <ThreadEvent key={i} role={m.role} parts={m.parts} isStreaming={status === "streaming"} />
                ))}
              </ThreadContent>
              <ThreadScrollButton />
            </Thread>
          </div>
        </div>
        <div className="mt-3">
          <Prompt value={"Escribe aquí..."} onChange={() => {}} onSubmit={() => {}} />
        </div>
      </div>
    )
  }

  return null
}

function renderSnippets(name: string) {
  const urlFor = (n: string) => `/r/${n}.json`

  if (name === "pulzar/stories") {
    const cmd = `pnpm add pulz-ar/stories; pnpm dlx shadcn@latest add ${urlFor("pulzar/thread")}; pnpm dlx shadcn@latest add ${urlFor("pulzar/event")}; pnpm dlx shadcn@latest add ${urlFor("pulzar/prompt")}`
    const imp = `import { Thread, ThreadContent, ThreadScrollButton } from "@/components/pulzar/thread";
import { Event as AEvent } from "@/components/pulzar/event";
import { Prompt } from "@/components/pulzar/prompt";`
    return <Snippets installCommand={cmd} importSnippet={imp} />
  }

  if (name === "pulzar/all") {
    const cmd = `pnpm dlx shadcn@latest add ${urlFor("pulzar/all")}; pnpm dlx shadcn@latest add ${urlFor("pulzar/orb")}`
    const imp = `import { Thread, ThreadContent, ThreadScrollButton } from "@/components/pulzar/thread";
import { Event } from "@/components/pulzar/event";
import { Prompt } from "@/components/pulzar/prompt";
import { Orb } from "@/components/pulzar/orb";`
    return <Snippets installCommand={cmd} importSnippet={imp} />
  }

  if (name === "pulzar/orb") {
    const cmd = `pnpm dlx shadcn@latest add ${urlFor("pulzar/orb")}`
    const imp = `import { Orb } from "@/components/pulzar/orb";`
    return <Snippets installCommand={cmd} importSnippet={imp} />
  }

  if (name === "pulzar/thread") {
    const cmd = `pnpm dlx shadcn@latest add ${urlFor("pulzar/thread")}`
    const imp = `import { Thread, ThreadContent, ThreadScrollButton } from "@/components/pulzar/thread";`
    return <Snippets installCommand={cmd} importSnippet={imp} />
  }

  if (name === "pulzar/event") {
    const cmd = `pnpm dlx shadcn@latest add ${urlFor("pulzar/event")}`
    const imp = `import { Event } from "@/components/pulzar/event";`
    return <Snippets installCommand={cmd} importSnippet={imp} />
  }

  if (name === "pulzar/prompt") {
    const cmd = `pnpm dlx shadcn@latest add ${urlFor("pulzar/prompt")}`
    const imp = `import { Prompt } from "@/components/pulzar/prompt";`
    return <Snippets installCommand={cmd} importSnippet={imp} />
  }

  return null
}

function useDemoMessages(): [{ role: string; parts: any[] }[], string] {
  const [status] = React.useState("idle")
  const messages = React.useMemo(() => {
    return [
      { role: "user", parts: [{ type: "text", text: "Hola Pulzar" }] },
      { role: "assistant", parts: [{ type: "text", text: "¡Hola! ¿En qué te ayudo?" }, { type: "reasoning", text: "Pensando opciones..." }] },
    ]
  }, [])
  return [messages, status]
}

function Snippets({ installCommand, importSnippet }: { installCommand: string; importSnippet: string }) {
  return (
    <section className="border rounded-lg p-3 grid gap-3">
      <div>
        <h3 className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Instalación (PowerShell)</h3>
        <pre className="text-xs overflow-auto bg-muted rounded p-3 whitespace-pre-wrap break-words">
{installCommand}
        </pre>
      </div>
      <div>
        <h3 className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Import</h3>
        <pre className="text-xs overflow-auto bg-muted rounded p-3 whitespace-pre-wrap break-words">
{importSnippet}
        </pre>
      </div>
    </section>
  )
}


