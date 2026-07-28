"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronsLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DbIcon } from "@/components/ui/db-icon"
import { SuggestionPill } from "@/components/ui/suggestion-pill"
import { cn } from "@/lib/utils"
import { GenieCodeIcon, PlusIcon, OverflowIcon, CloseIcon } from "@/components/icons"
import { GeniePrompt, type GenieTag } from "@/components/ai-elements/genie-prompt"
import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
  MessageToolbar,
} from "@/components/ai-elements/message"
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought"
import { ThumbsUpIcon, ThumbsDownIcon, CopyIcon } from "lucide-react"

interface GenieCodePanelProps {
  open: boolean
  onClose: () => void
  className?: string
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  thinking?: string
}

const SUGGESTION_CHIPS = [
  "Create automation",
  "What automation is best for my data?",
  "View latest automation",
]

const MOCK_RESPONSES: Record<string, { thinking: string; answer: string }> = {
  default: {
    thinking: "Analyzing the request and checking available data pipelines...",
    answer:
      "I can help with that. Based on your current workspace, you have 3 active pipelines and 2 scheduled workflows. Would you like me to walk you through the options or create a new automation?",
  },
}

let msgCounter = 0
function uid() {
  return `msg-${++msgCounter}`
}

export function GenieCodePanel({ open, onClose, className }: GenieCodePanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [tags, setTags] = useState<GenieTag[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking])

  const handleSubmit = (value: string) => {
    const text = value.trim()
    if (!text) return

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setTags([])
    setIsThinking(true)

    const response = MOCK_RESPONSES.default
    setTimeout(() => {
      setIsThinking(false)
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: response.answer,
          thinking: response.thinking,
        },
      ])
    }, 1800)
  }

  const handleSuggestion = (label: string) => {
    handleSubmit(label)
  }

  const handleNewConversation = () => {
    setMessages([])
    setInput("")
    setTags([])
    setIsThinking(false)
  }

  const isEmpty = messages.length === 0 && !isThinking

  return (
    <div
      className={cn(
        "flex flex-col shrink-0 bg-background overflow-hidden",
        open ? "w-[360px]" : "w-0",
        className
      )}
    >
      {open && (
        <>
          {/* Header */}
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
            <div className="flex flex-1 items-center gap-2">
              <ChevronsLeft className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-[13px] font-semibold leading-5 text-foreground">
                Genie Code
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-xs" aria-label="New conversation" onClick={handleNewConversation}>
                <PlusIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-xs" aria-label="More options">
                <OverflowIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-xs" aria-label="Close Genie Code" onClick={onClose}>
                <CloseIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto px-3 pt-3">
            {isEmpty ? (
              /* Empty state */
              <div className="flex flex-1 flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-4 px-6 w-full">
                  <DbIcon icon={GenieCodeIcon} color="ai" size={48} />
                  <div className="flex flex-col gap-2 items-center text-center w-full">
                    <p className="text-xl font-semibold leading-7 text-foreground">
                      Genie Code
                    </p>
                    <p className="text-[13px] leading-5 text-muted-foreground">
                      Run multi-step data and AI tasks
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 w-full">
                    {SUGGESTION_CHIPS.map((label) => (
                      <SuggestionPill key={label} onClick={() => handleSuggestion(label)}>
                        {label}
                      </SuggestionPill>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Chat thread */
              <div className="flex flex-col gap-4 pb-3">
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    <Message key={msg.id} from="user">
                      <MessageContent>{msg.content}</MessageContent>
                    </Message>
                  ) : (
                    <Message key={msg.id} from="assistant">
                      {msg.thinking && (
                        <ChainOfThought>
                          <ChainOfThoughtHeader isStreaming={false}>
                            Thought for a moment
                          </ChainOfThoughtHeader>
                          <ChainOfThoughtContent>
                            <ChainOfThoughtStep label={msg.thinking} />
                          </ChainOfThoughtContent>
                        </ChainOfThought>
                      )}
                      <MessageContent className="pl-3">{msg.content}</MessageContent>
                      <MessageToolbar className="pl-3">
                        <MessageActions>
                          <MessageAction tooltip="Copy">
                            <CopyIcon className="h-4 w-4" />
                          </MessageAction>
                          <MessageAction tooltip="Helpful">
                            <ThumbsUpIcon className="h-4 w-4" />
                          </MessageAction>
                          <MessageAction tooltip="Not helpful">
                            <ThumbsDownIcon className="h-4 w-4" />
                          </MessageAction>
                        </MessageActions>
                      </MessageToolbar>
                    </Message>
                  )
                )}

                {isThinking && (
                  <Message from="assistant">
                    <ChainOfThought>
                      <ChainOfThoughtHeader isStreaming={true}>
                        Thinking
                      </ChainOfThoughtHeader>
                    </ChainOfThought>
                  </Message>
                )}
              </div>
            )}
          </div>

          {/* Compose area */}
          <div className="shrink-0 p-3">
            <GeniePrompt
              variant="chat"
              size="small"
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              tags={tags}
              onTagRemove={(id) => setTags((prev) => prev.filter((t) => t.id !== id))}
              placeholder="Ask Genie Code..."
            />
            <p className="mt-2 text-center text-[12px] leading-4 text-muted-foreground">
              Only use the agent with code and data you trust
            </p>
          </div>
        </>
      )}
    </div>
  )
}
