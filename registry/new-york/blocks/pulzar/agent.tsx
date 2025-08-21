"use client"

import React, { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { Conversation, ConversationContent, ConversationScrollButton } from '../ai-elements/conversation'
import { Message, MessageContent } from '../ai-elements/message'
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '../ai-elements/prompt-input'
import { Response } from '../ai-elements/response'
import { Sources, SourcesContent, SourcesTrigger, Source } from '../ai-elements/source'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '../ai-elements/reasoning'
import { Loader } from '../ai-elements/loader'
import { GlobeIcon, SendIcon } from "lucide-react"
import { ReasoningLevelSelect } from '../ai-elements/reasoning-level'

type Props = {
  domain?: string
  className?: string
  initialPrompt?: string
  initialWebSearch?: boolean
  initialReasoningLevel?: 0 | 1 | 2 | 3
}

const bootGuard: { lastPrompt?: string; lastAt?: number } = (globalThis as any).__pulzarAgentBootGuard || {}
;(globalThis as any).__pulzarAgentBootGuard = bootGuard

export default function Agent({ domain, className, initialPrompt, initialWebSearch, initialReasoningLevel }: Props) {
  const [input, setInput] = useState("")
  const [webSearch, setWebSearch] = useState(Boolean(initialWebSearch))
  const [reasoningLevel, setReasoningLevel] = useState<0 | 1 | 2 | 3>(typeof initialReasoningLevel === 'number' ? initialReasoningLevel as 0|1|2|3 : 1)
  const { messages, sendMessage, status } = useChat()
  const [isSending, setIsSending] = useState(false)
  const [bootSent, setBootSent] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isSending) return
    setIsSending(true)
    sendMessage(
      { text: input },
      { body: { webSearch, reasoningLevel, domain } as any },
    )
    setInput("")
    setTimeout(() => setIsSending(false), 0)
  }

  React.useEffect(() => {
    if (!bootSent && initialPrompt && initialPrompt.trim().length > 0) {
      const now = Date.now()
      if (bootGuard.lastPrompt === initialPrompt && typeof bootGuard.lastAt === 'number' && now - (bootGuard.lastAt as number) < 5000) {
        setBootSent(true)
        return
      }
      bootGuard.lastPrompt = initialPrompt
      bootGuard.lastAt = now
      setBootSent(true)
      setIsSending(true)
      sendMessage(
        { text: initialPrompt },
        { body: { webSearch: false, reasoningLevel, domain } as any },
      )
      setTimeout(() => setIsSending(false), 0)
    }
  }, [bootSent, initialPrompt, domain, reasoningLevel, sendMessage])

  return (
    <main className={["min-h-screen md:h-screen p-0 h-full", className || ""].join(" ") }>
      <div className="w-full md:h-full">
        <div className="px-6 py-6 h-full">
          <div className="h-full max-w-4xl mx-auto">
            <div className="flex flex-col h-full">
              <Conversation className="h-full">
                <ConversationContent>
                  {messages.map((message) => (
                    <div key={message.id as any}>
                      {message.role === 'assistant' && (
                        <Sources>
                          {message.parts.map((part: any, i: number) => {
                            if (part.type === 'source-url') {
                              return (
                                <React.Fragment key={`src-${message.id}-${i}`}>
                                  <SourcesTrigger count={message.parts.filter((p: any) => p.type === 'source-url').length} />
                                  <SourcesContent>
                                    <Source href={part.url} title={part.url} />
                                  </SourcesContent>
                                </React.Fragment>
                              )
                            }
                            return null
                          })}
                        </Sources>
                      )}
                      <Message from={message.role}>
                        <MessageContent>
                          {message.parts.map((part: any, i: number) => {
                            switch (part.type) {
                              case 'text':
                                return <Response key={`${message.id}-${i}`}>{part.text}</Response>
                              case 'reasoning':
                                return (
                                  <Reasoning key={`${message.id}-${i}`} className="w-full" isStreaming={status === 'streaming'}>
                                    <ReasoningTrigger />
                                    <ReasoningContent>{part.text}</ReasoningContent>
                                  </Reasoning>
                                )
                              default:
                                return null
                            }
                          })}
                        </MessageContent>
                      </Message>
                    </div>
                  ))}
                  {status === 'submitted' && <Loader />}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>

              <PromptInput onSubmit={handleSubmit as any} className="mt-4">
                <PromptInputTextarea onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)} value={input} />
                <PromptInputToolbar>
                  <PromptInputTools>
                    <PromptInputButton
                      variant={'outline'}
                      className={
                        (webSearch
                          ? 'bg-foreground/90 text-background hover:bg-foreground '
                          : 'bg-transparent text-foreground/80 hover:bg-accent/30 ') +
                        ' h-9 w-9 !p-0 !px-0 !py-0 leading-none grid place-items-center border border-border rounded-none rounded-bl-xl'
                      }
                      onClick={() => setWebSearch(!webSearch)}
                    >
                      <GlobeIcon className="size-5 shrink-0" strokeWidth={1.75} />
                    </PromptInputButton>
                    <ReasoningLevelSelect value={reasoningLevel} onChange={setReasoningLevel} />
                  </PromptInputTools>
                  <PromptInputSubmit
                    disabled={!input}
                    status={status as any}
                    className={'h-9 w-9 !p-0 !px-0 !py-0 leading-none grid place-items-center border border-border rounded-none rounded-br-xl bg-transparent text-foreground hover:bg-accent/30'}
                    variant={'outline'}
                  >
                    <SendIcon className="size-5" strokeWidth={1.75} />
                  </PromptInputSubmit>
                </PromptInputToolbar>
              </PromptInput>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}


