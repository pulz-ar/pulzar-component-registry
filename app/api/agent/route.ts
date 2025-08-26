import { NextRequest } from "next/server"
import { streamText, convertToModelMessages } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const messages = Array.isArray(body?.messages) ? body.messages : []
  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY no configurado" }), { status: 500, headers: { "Content-Type": "application/json" } })
  }

  const result = await streamText({
    model: openai("gpt-4.1"),
    system: "Eres un agente demo de Pulzar Registry. Responde breve y claro.",
    messages: convertToModelMessages(messages),
    onError: (err) => console.error("/api/agent error", err),
  })

  result.consumeStream()
  return result.toUIMessageStreamResponse({ sendSources: false, sendReasoning: true })
}


