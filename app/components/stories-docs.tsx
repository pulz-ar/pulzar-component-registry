"use client"

import React from "react"
import { CodeBlock } from "@/components/ai-elements/code-block"

export function StoriesDocs() {
  return (
    <div className="grid gap-4">
      <section>
        <h3 className="text-lg font-semibold">Story‑Driven AI</h3>
        <p className="text-sm text-muted-foreground">Uso del framework: event → story loop (direction → execute → end|repeat).</p>
      </section>

      <section className="grid gap-2">
        <h4 className="text-base font-medium">Instalación (PowerShell)</h4>
        <pre className="text-xs overflow-auto bg-muted rounded p-3 whitespace-pre-wrap break-words">pnpm add pulz-ar/stories-react; pnpm add pulz-ar/stories-core; pnpm dlx shadcn@latest add /r/pulzar/thread.json; pnpm dlx shadcn@latest add /r/pulzar/event.json; pnpm dlx shadcn@latest add /r/pulzar/prompt.json</pre>
      </section>

      <section className="grid gap-2">
        <h4 className="text-base font-medium">Backend — Director fluido por pasos</h4>
        <p className="text-sm text-muted-foreground">Ahora definimos un Director con interfaz fluida: <code>createDirector(name).step(fn).step(fn)</code>. Cada <i>step</i> se guarda en un stack y se ejecuta en orden al invocar <code>react(event)</code>.</p>
        <CodeBlock language="ts" code={`// app/api/stories/[threadId]/stories/story.ts
import { createDirector } from './story'

export const director = createDirector('demo')
  .step(() => console.log('hi'))
  .step(() => console.log('hi 2'))
// El proceso core (guardar evento, echo mock LLM y cargar thread) vive en react()
`} />
        <h5 className="text-sm font-medium mt-2">Endpoint — recibir payload, crear evento y reaccionar</h5>
        <CodeBlock language="ts" code={`// app/api/stories/[threadId]/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createDirector, events } from './stories/story'

const director = createDirector('base')
  .step(({ event, ctx }) => { console.log('director:print', { eventId: event.id, threadId: ctx.threadId }) })

export async function POST(req: NextRequest, context: { params: { threadId: string } }) {
  const body = await req.json().catch(() => ({} as any))
  const threadId = (await context.params).threadId
  if (!threadId) { return new Response('threadId requerido', { status: 400 }) }

  const { orgId, userId } = await auth()
  if (!orgId) { return new Response('Organización no encontrada en el contexto', { status: 401 }) }

  const text = typeof body?.text === 'string' ? body.text : ''
  const userEvent = events.user('message-created', {
    userId,
    channel: 'web',
    parts: [{ type: 'text', text }],
  })

  const thread = await director.react(userEvent, { threadId, organizationId: orgId })
  return Response.json(thread)
}
`} />
      </section>

      <section className="grid gap-2">
        <h4 className="text-base font-medium">Uso básico</h4>
        <CodeBlock language="tsx" code={`import { Thread, ThreadContent, ThreadScrollButton } from "@/components/pulzar/thread"
import { Event as AEvent } from "@/components/pulzar/event"
import { Prompt } from "@/components/pulzar/prompt"
import { useThread } from 'pulz-ar/stories-react'

export default function StoryDemo({ threadKey }: { threadKey: string }) {
  const { events, status, input, handleInputChange, handleSubmit } = useThread({ threadKey, url: "/api/stories/" + threadKey })
  return (
    <div className="grid gap-3">
      <div className="border rounded-md max-h-[300px] overflow-auto">
        <Thread>
          <ThreadContent>
            {(events || []).map((e: any, i: number) => (
              <AEvent key={i} role={e.role || 'assistant'} parts={e.parts || [{ type: 'text', text: e.text || '' }]} isStreaming={status === 'streaming'} />
            ))}
          </ThreadContent>
          <ThreadScrollButton />
        </Thread>
      </div>
      <Prompt value={input} onChange={handleInputChange as any} onSubmit={handleSubmit as any} />
    </div>
  )
}
`} />
      </section>

      <section className="grid gap-2">
        <h4 className="text-base font-medium">Frontend — Orquestación UI</h4>
        <p className="text-sm text-muted-foreground">El front usa Thread/Event/Prompt. La Story vive en el backend; el Event unifica texto, reasoning, sources, código y tools. Inspirado en flujos de Workflows tipados y controlados por estado.</p>
        <p className="text-xs text-muted-foreground">Referencia: <a className="underline" href="https://mastra.ai/en/docs/workflows/overview" target="_blank" rel="noreferrer">Mastra Workflows Overview</a></p>
      </section>

      <section className="grid gap-2">
        <h4 className="text-base font-medium">Mapeo con dominio (Award)</h4>
        <p className="text-sm text-muted-foreground">Ejemplo de selección de Director según estado, equivalente al cambio de agentes en Award.</p>
        <CodeBlock language="ts" code={`// stories/back/award.story.ts
import { z } from 'zod'

const ConfirmDirector = { async decide({ event }) { return { toolName: 'confirmAward', args: { confirm: true } } } }
const RejectDirector = { async decide({ event }) { return { toolName: 'rejectAward', args: { reject: true } } } }

export const AwardStory = createStory('domain.award', {
  tools: [
    { name: 'confirmAward', description: 'Confirma adjudicación', parameters: z.object({ confirm: z.boolean(), notes: z.string().optional() }), async execute({ confirm, notes }, ctx) { return { confirm, notes } } },
    { name: 'rejectAward', description: 'Rechaza adjudicación', parameters: z.object({ reject: z.boolean(), notes: z.string().optional() }), async execute({ reject, notes }, ctx) { return { reject, notes } } },
  ],
  async onEvent(event, ctx) {
    const isClosed = ctx.state?.tender?.status === 'closed'
    const isAwarded = ctx.state?.award?.status === 'awarded'
    const director = isClosed && isAwarded ? ConfirmDirector : RejectDirector
    const direction = await director.decide({ state: ctx.state, event, tools: this.tools, prompt: this.prompt })
    if (direction.toolName === 'end') { return { done: true } }
    const tool = this.tools.find(t => t.name === direction.toolName)
    const result = await tool.execute(direction.args, ctx)
    return { done: false, result }
  },
})
`} />
      </section>
    </div>
  )
}


