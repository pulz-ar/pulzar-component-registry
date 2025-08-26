"use client"

import React from "react"
import { Response } from "@/components/ai-elements/response"
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
        <h4 className="text-base font-medium">Backend — Definir Story y Director</h4>
        <p className="text-sm text-muted-foreground">La Story siempre inicia con un evento. Un Director decide la <i>direction</i> (qué tool ejecutar) según el estado.</p>
        <CodeBlock language="ts" code={`// stories/back/story.calculator.ts
import { z } from 'zod'
// createStory y Director provienen de 'pulz-ar/stories-core'

const CalculatorDirector = {
  async decide({ state, event, tools, prompt }) {
    // Usa prompt/LLM para decidir la próxima acción (direction)
    const plan = await prompt({ system: 'Suma números con la tool sum', message: event.message })
    if (plan.toolName === 'sum') { return { toolName: 'sum', args: plan.args } }
    return { toolName: 'end', args: {} }
  },
}

export const CalculatorStory = createStory('domain.calculator', {
  tools: [
    { name: 'sum', description: 'Suma dos números', parameters: z.object({ a: z.number(), b: z.number() }), async execute({ a, b }) { return { sum: a + b } } },
  ],
  async onEvent(event, ctx) {
    const director = CalculatorDirector // o selecciona según ctx.state
    const direction = await director.decide({ state: ctx.state, event, tools: this.tools, prompt: this.prompt })
    if (direction.toolName === 'end') { return { done: true } }
    const tool = this.tools.find(t => t.name === direction.toolName)
    const result = await tool.execute(direction.args, ctx)
    return { done: false, result }
  },
})
`} />
        <h5 className="text-sm font-medium mt-2">Endpoint — recibir payload, crear evento y reaccionar</h5>
        <CodeBlock language="ts" code={`// app/api/stories/[threadKey]/route.ts
import { NextRequest } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { init } from '@instantdb/admin'
import schema from '@/instant.schema'
import { createStory } from 'pulz-ar/stories-core'
import { events } from 'pulz-zar/stores'

const db = init({ appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!, adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!, schema })

// story stateless + thread-safe: instancia única
const story = createStory('domain.calculator', {
  async onEvent(event, ctx) {
    // decidir con Director interno/externo según ctx.state y event
    // return { done: true } | { done: false, result }
    return { done: true }
  },
})

export async function POST(req: NextRequest, { params }: { params: { threadKey: string } }) {
  const body = await req.json()
  const user = await currentUser()

  const threadKey = String(params.threadKey || '')
  const userId = String(user.id)

  // 2) crear evento (user.message-created) con builder del SDK
  const event = events.user('message-created', {
    channel: 'web',
    body
  })

  // 3) reaccionar con la story
  const thread = await story.react(event, { threadKey })

  // 4) return updated thread (likely in processing status)
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


