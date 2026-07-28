"use client";

import { useState, useCallback } from "react";
import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
  MessageToolbar,
} from "@/components/ai-elements/message";
import { GeniePrompt, type GenieTag } from "@/components/ai-elements/genie-prompt";
import {
  Suggestions,
  Suggestion,
} from "@/components/ai-elements/suggestion";
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
} from "@/components/ai-elements/chain-of-thought";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockActions,
  CodeBlockCopyButton,
} from "@/components/ai-elements/code-block";
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai-elements/sources";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
} from "@/components/ai-elements/task";
import {
  Checkpoint,
  CheckpointIcon,
  CheckpointLabel,
  CheckpointActions,
  CheckpointTrigger,
} from "@/components/ai-elements/checkpoint";
import {
  Commit,
  CommitHeader,
  CommitInfo,
  CommitMessage,
  CommitMetadata,
  CommitHash,
  CommitSeparator,
  CommitTimestamp,
  CommitActions,
  CommitCopyButton,
  CommitContent,
  CommitFiles,
  CommitFile,
  CommitFileInfo,
  CommitFileIcon,
  CommitFilePath,
  CommitFileStatus,
  CommitFileChanges,
  CommitFileAdditions,
  CommitFileDeletions,
} from "@/components/ai-elements/commit";
import {
  Snippet,
  SnippetInput,
  SnippetCopyButton,
} from "@/components/ai-elements/snippet";
import { Terminal } from "@/components/ai-elements/terminal";
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  WebPreviewBody,
  WebPreviewConsole,
} from "@/components/ai-elements/web-preview";
import { BookmarkIcon, CopyIcon, ThumbsUpIcon, ThumbsDownIcon, DownloadIcon, ArrowLeftIcon, ArrowRightIcon, RotateCwIcon, ExternalLinkIcon, MaximizeIcon, LinkIcon, CheckIcon, RotateCcwIcon } from "lucide-react";
import { AssistantIcon, QueryEditorIcon, TableIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SegmentedControl,
  SegmentedItem,
} from "@/components/ui/segmented-control";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function AiSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [id]);

  return (
    <section id={id} className="mb-16 scroll-mt-6">
      <div className="mb-6 border-b border-border pb-4">
        <div className="group flex items-center gap-1.5">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={copyLink}
            aria-label="Copy link"
            className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? <CheckIcon className="h-3 w-3" /> : <LinkIcon className="h-3 w-3" />}
          </Button>
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function DemoFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-background p-6">
      {children}
    </div>
  );
}

function DemoLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DEMO_TAGS: GenieTag[] = [
  { id: "1", label: "Node", kind: "node" },
  { id: "2", label: "column.name", kind: "column" },
];

export function AiElementsTab() {
  const [inputValue, setInputValue] = useState("");
  const [chatTags, setChatTags] = useState<GenieTag[]>(DEMO_TAGS);
  const [smallChatTags, setSmallChatTags] = useState<GenieTag[]>([
    { id: "1", label: "cell.name", kind: "notebook" },
  ]);
  const [genieVariant, setGenieVariant] = useState("all");
  const [genieSize, setGenieSize] = useState("all");

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-2xl font-semibold text-foreground">AI Elements</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          AI SDK UI components styled with DuBois tokens. Drop-in for chat, code, and agent UIs.
        </p>
      </div>

      {/* ── Message ──────────────────────────────────────────────────────── */}
      <AiSection
        id="ae-message"
        title="Message"
        description="User and assistant message bubbles. User messages sit right with a secondary background; assistant messages are left-aligned plain text."
      >
        <div className="flex flex-col gap-6">
          <div>
            <DemoLabel>Conversation thread</DemoLabel>
            <DemoFrame>
              <div className="flex flex-col gap-4 max-w-xl">
                <Message from="user">
                  <MessageContent>
                    What&apos;s the best way to query a Delta table in Databricks SQL?
                  </MessageContent>
                </Message>

                <Message from="assistant">
                  <MessageContent>
                    Use <code className="rounded bg-secondary px-1 py-0.5 text-xs">SELECT</code> directly on the table path or use the catalog name. Delta tables support ACID transactions so reads are always consistent.
                  </MessageContent>
                  <MessageToolbar>
                    <div className="flex items-center gap-1">
                      <MessageActions>
                        <MessageAction tooltip="Good response" label="Thumbs up">
                          <ThumbsUpIcon size={14} />
                        </MessageAction>
                        <MessageAction tooltip="Bad response" label="Thumbs down">
                          <ThumbsDownIcon size={14} />
                        </MessageAction>
                        <MessageAction tooltip="Copy" label="Copy">
                          <CopyIcon size={14} />
                        </MessageAction>
                        <MessageAction tooltip="Download" label="Download">
                          <DownloadIcon size={14} />
                        </MessageAction>
                      </MessageActions>
                      <Sources>
                        <SourcesTrigger
                          count={4}
                          icons={[
                            {
                              icon: <AssistantIcon className="h-3 w-3 text-white" />,
                              className: "bg-blue-600",
                            },
                            { icon: <QueryEditorIcon className="h-3 w-3 text-muted-foreground" /> },
                            { icon: <TableIcon className="h-3 w-3 text-muted-foreground" /> },
                          ]}
                        />
                        <SourcesContent>
                          <Source href="#" title="Ask Genie about this table" icon={<AssistantIcon className="h-3.5 w-3.5 text-primary" />} />
                          <Source href="#" title="orders_delta — SQL query" icon={<QueryEditorIcon className="h-3.5 w-3.5 text-muted-foreground" />} />
                          <Source href="#" title="main.sales.orders" icon={<TableIcon className="h-3.5 w-3.5 text-muted-foreground" />} />
                          <Source href="#" title="main.sales.line_items" icon={<TableIcon className="h-3.5 w-3.5 text-muted-foreground" />} />
                        </SourcesContent>
                      </Sources>
                    </div>
                  </MessageToolbar>
                </Message>

                <Message from="user">
                  <MessageContent>
                    Can you show me an example?
                  </MessageContent>
                </Message>
              </div>
            </DemoFrame>
          </div>
        </div>
      </AiSection>

      {/* ── Genie Prompt Input ───────────────────────────────────────────── */}
      <AiSection
        id="ae-prompt-input"
        title="Genie Prompt"
        description="Unified Genie prompt input from Figma design. Supports Ask/Search mode toggle, context tag chips, model selector, and three layout variants."
      >
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Variant</span>
            <SegmentedControl value={genieVariant} onValueChange={setGenieVariant}>
              <SegmentedItem value="all">All</SegmentedItem>
              <SegmentedItem value="chat">Chat</SegmentedItem>
              <SegmentedItem value="toggle">Toggle</SegmentedItem>
              <SegmentedItem value="compact">Compact</SegmentedItem>
            </SegmentedControl>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Size</span>
            <SegmentedControl value={genieSize} onValueChange={setGenieSize}>
              <SegmentedItem value="all">All</SegmentedItem>
              <SegmentedItem value="default">Default</SegmentedItem>
              <SegmentedItem value="small">Small</SegmentedItem>
            </SegmentedControl>
          </div>
        </div>

        <div className="flex flex-col gap-8">

          {(genieVariant === "all" || genieVariant === "chat") && (genieSize === "all" || genieSize === "default") && (
            <div>
              <DemoLabel>Chat — default size (stacked layout)</DemoLabel>
              <DemoFrame>
                <GeniePrompt
                  variant="chat"
                  mode="ask"
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={(text) => { setInputValue(""); console.log("submit:", text); }}
                  tags={chatTags}
                  onTagRemove={(id) => setChatTags((prev) => prev.filter((t) => t.id !== id))}
                  modelName="Mythos 6.7 (max)"
                />
              </DemoFrame>
            </div>
          )}

          {(genieVariant === "all" || genieVariant === "toggle") && (genieSize === "all" || genieSize === "default") && (
            <div>
              <DemoLabel>Toggle — Ask/Search segmented control</DemoLabel>
              <DemoFrame>
                <GeniePrompt
                  variant="toggle"
                  mode="ask"
                  onModeChange={(m) => console.log("mode:", m)}
                  value=""
                  modelName="Mythos 6.7 (max)"
                />
              </DemoFrame>
            </div>
          )}

          {(genieVariant === "all" || genieVariant === "toggle") && (genieSize === "all" || genieSize === "default") && (
            <div>
              <DemoLabel>Toggle — Search active</DemoLabel>
              <DemoFrame>
                <GeniePrompt
                  variant="toggle"
                  mode="search"
                  onModeChange={(m) => console.log("mode:", m)}
                  value=""
                  placeholder="Search Dashboards, Genie spaces, and Apps..."
                  modelName="Mythos 6.7 (max)"
                />
              </DemoFrame>
            </div>
          )}

          {(genieVariant === "all" || genieVariant === "compact") && (genieSize === "all" || genieSize === "default") && (
            <div>
              <DemoLabel>Compact — inline single row</DemoLabel>
              <DemoFrame>
                <GeniePrompt
                  variant="compact"
                  mode="ask"
                  value=""
                  modelName="Mythos 6.7 (max)"
                />
              </DemoFrame>
            </div>
          )}

          {(genieVariant === "all" || genieVariant === "chat") && (genieSize === "all" || genieSize === "small") && (
            <div>
              <DemoLabel>Chat — small size</DemoLabel>
              <DemoFrame>
                <GeniePrompt
                  variant="chat"
                  size="small"
                  mode="ask"
                  value=""
                  tags={smallChatTags}
                  onTagRemove={(id) => setSmallChatTags((prev) => prev.filter((t) => t.id !== id))}
                  modelName="Mythos 6.7 (max)"
                />
              </DemoFrame>
            </div>
          )}

          {(genieVariant === "all" || genieVariant === "compact") && (genieSize === "all" || genieSize === "small") && (
            <div>
              <DemoLabel>Compact — small size</DemoLabel>
              <DemoFrame>
                <GeniePrompt
                  variant="compact"
                  size="small"
                  mode="ask"
                  value=""
                  modelName="Mythos 6.7 (max)"
                />
              </DemoFrame>
            </div>
          )}

        </div>
      </AiSection>

      {/* ── Suggestions ──────────────────────────────────────────────────── */}
      <AiSection
        id="ae-suggestions"
        title="Suggestions"
        description="Horizontally scrollable prompt chips. Clicking a suggestion fires an onClick(suggestion) callback."
      >
        <DemoFrame>
          <Suggestions>
            <Suggestion suggestion="Summarize this notebook" />
            <Suggestion suggestion="Optimize this SQL query" />
            <Suggestion suggestion="Explain this pipeline error" />
            <Suggestion suggestion="Generate a data quality check" />
            <Suggestion suggestion="Write a unit test" />
          </Suggestions>
        </DemoFrame>
      </AiSection>

      {/* ── Chain of Thought ─────────────────────────────────────────────── */}
      <AiSection
        id="ae-chain-of-thought"
        title="Chain of Thought"
        description="Collapsible step-by-step agent reasoning. Each step shows status: complete, active, or pending."
      >
        <div className="flex flex-col gap-6">
          <div>
            <DemoLabel>Expanded (defaultOpen)</DemoLabel>
            <DemoFrame>
              <div className="max-w-lg">
                <ChainOfThought defaultOpen>
                  <ChainOfThoughtHeader isStreaming>Thinking</ChainOfThoughtHeader>
                  <ChainOfThoughtContent>
                    <ChainOfThoughtStep label="Parsed SQL query" status="complete" />
                    <ChainOfThoughtStep
                      label="Searched catalog for matching tables"
                      status="complete"
                      description="Found 3 Delta tables matching the schema"
                    >
                      <ChainOfThoughtSearchResults>
                        <ChainOfThoughtSearchResult>main.sales.orders</ChainOfThoughtSearchResult>
                        <ChainOfThoughtSearchResult>main.sales.items</ChainOfThoughtSearchResult>
                        <ChainOfThoughtSearchResult>main.finance.revenue</ChainOfThoughtSearchResult>
                      </ChainOfThoughtSearchResults>
                    </ChainOfThoughtStep>
                    <ChainOfThoughtStep label="Generating optimized query plan" status="active" />
                    <ChainOfThoughtStep label="Validating permissions" status="pending" />
                  </ChainOfThoughtContent>
                </ChainOfThought>
              </div>
            </DemoFrame>
          </div>

          <div>
            <DemoLabel>Collapsed</DemoLabel>
            <DemoFrame>
              <div className="max-w-lg">
                <ChainOfThought>
                  <ChainOfThoughtHeader>Thought for 3s</ChainOfThoughtHeader>
                  <ChainOfThoughtContent>
                    <ChainOfThoughtStep label="Reviewed the notebook cells" status="complete" />
                    <ChainOfThoughtStep label="Identified performance bottleneck in join" status="complete" />
                  </ChainOfThoughtContent>
                </ChainOfThought>
              </div>
            </DemoFrame>
          </div>
        </div>
      </AiSection>

      {/* ── Code Block ───────────────────────────────────────────────────── */}
      <AiSection
        id="ae-code-block"
        title="Code Block"
        description="Syntax-highlighted code using Shiki. Includes copy button and optional language selector."
      >
        <DemoFrame>
          <div className="max-w-2xl">
            <CodeBlock
              code={`from pyspark.sql import SparkSession\n\nspark = SparkSession.builder.getOrCreate()\n\ndf = spark.read.format("delta").load("/mnt/data/sales")\ndf.filter(df.revenue > 10000).show()`}
              language="python"
            >
              <CodeBlockHeader>
                <CodeBlockTitle>example.py</CodeBlockTitle>
                <CodeBlockActions>
                  <CodeBlockCopyButton />
                </CodeBlockActions>
              </CodeBlockHeader>
            </CodeBlock>
          </div>
        </DemoFrame>
      </AiSection>

      {/* ── Sources ──────────────────────────────────────────────────────── */}
      <AiSection
        id="ae-sources"
        title="Sources"
        description="Collapsible cited sources panel. Shown below assistant messages when references are available."
      >
        <DemoFrame>
          <Sources>
            <SourcesTrigger
              count={3}
              icons={[
                { favicon: "https://www.google.com/s2/favicons?sz=32&domain=databricks.com" },
                { favicon: "https://www.google.com/s2/favicons?sz=32&domain=docs.databricks.com" },
                { favicon: "https://www.google.com/s2/favicons?sz=32&domain=learn.microsoft.com" },
              ]}
            />
            <SourcesContent>
              <Source
                href="#"
                title="Databricks Delta Lake documentation"
                favicon="https://www.google.com/s2/favicons?sz=32&domain=databricks.com"
              />
              <Source
                href="#"
                title="Unity Catalog best practices"
                favicon="https://www.google.com/s2/favicons?sz=32&domain=docs.databricks.com"
              />
              <Source
                href="#"
                title="SQL Warehouse configuration guide"
                favicon="https://www.google.com/s2/favicons?sz=32&domain=learn.microsoft.com"
              />
            </SourcesContent>
          </Sources>
        </DemoFrame>
      </AiSection>

      {/* ── Reasoning ────────────────────────────────────────────────────── */}
      <AiSection
        id="ae-reasoning"
        title="Reasoning"
        description="Extended thinking display for models that expose a reasoning trace. Auto-opens while streaming, auto-closes when done."
      >
        <div className="flex flex-col gap-6">
          <div>
            <DemoLabel>Streaming (isStreaming)</DemoLabel>
            <DemoFrame>
              <div className="max-w-lg">
                <Reasoning isStreaming defaultOpen>
                  <ReasoningTrigger />
                  <ReasoningContent>
                    {`The user is asking about Delta table performance. Let me think through the key factors:

1. File size and Z-ordering
2. Partition strategy
3. Cache warming
4. Photon vs standard compute`}
                  </ReasoningContent>
                </Reasoning>
              </div>
            </DemoFrame>
          </div>

          <div>
            <DemoLabel>Done (duration shown)</DemoLabel>
            <DemoFrame>
              <div className="max-w-lg">
                <Reasoning duration={4} defaultOpen>
                  <ReasoningTrigger />
                  <ReasoningContent>
                    {`Analyzed the schema and determined the optimal join strategy based on table sizes and partition keys.`}
                  </ReasoningContent>
                </Reasoning>
              </div>
            </DemoFrame>
          </div>
        </div>
      </AiSection>

      {/* ── Shimmer ──────────────────────────────────────────────────────── */}
      <AiSection
        id="ae-shimmer"
        title="Shimmer"
        description="Animated sweep text for loading states. Uses muted-foreground color token."
      >
        <DemoFrame>
          <div className="flex flex-col gap-3">
            <Shimmer className="text-sm">Thinking...</Shimmer>
            <Shimmer className="text-sm" duration={3}>
              Searching catalog for relevant tables...
            </Shimmer>
            <Shimmer className="text-base font-semibold" duration={1.5}>
              Generating response
            </Shimmer>
          </div>
        </DemoFrame>
      </AiSection>

      {/* ── Tool ─────────────────────────────────────────────────────────── */}
      <AiSection
        id="ae-tool"
        title="Tool"
        description="Collapsible tool call card showing input parameters and output. Displays state badges for streaming, complete, error, etc."
      >
        <div className="flex flex-col gap-6">
          <div>
            <DemoLabel>Completed</DemoLabel>
            <DemoFrame>
              <div className="max-w-lg">
                <Tool defaultOpen>
                  <ToolHeader
                    type="tool-call"
                    state="output-available"
                    title="search_catalog"
                  />
                  <ToolContent>
                    <ToolInput input={{ query: "Delta tables in sales schema", limit: 10 }} />
                    <ToolOutput
                      output={{ tables: ["sales.orders", "sales.items"], count: 2 }}
                      errorText={undefined}
                    />
                  </ToolContent>
                </Tool>
              </div>
            </DemoFrame>
          </div>
          <div>
            <DemoLabel>Error</DemoLabel>
            <DemoFrame>
              <div className="max-w-lg">
                <Tool>
                  <ToolHeader
                    type="tool-call"
                    state="output-error"
                    title="run_query"
                  />
                  <ToolContent>
                    <ToolInput input={{ sql: "SELECT * FROM unknown_table" }} />
                    <ToolOutput
                      output={undefined}
                      errorText="Table 'unknown_table' not found in catalog"
                    />
                  </ToolContent>
                </Tool>
              </div>
            </DemoFrame>
          </div>
        </div>
      </AiSection>

      {/* ── Task ─────────────────────────────────────────────────────────── */}
      <AiSection
        id="ae-task"
        title="Task"
        description="Collapsible task item showing what the agent is working on, with file references."
      >
        <DemoFrame>
          <div className="max-w-lg flex flex-col gap-3">
            <Task defaultOpen>
              <TaskTrigger title="Searching for relevant files" />
              <TaskContent>
                <TaskItem>
                  Reading <TaskItemFile>src/lib/utils.ts</TaskItemFile> and{" "}
                  <TaskItemFile>src/components/ui/button.tsx</TaskItemFile>
                </TaskItem>
                <TaskItem>Found 3 matching patterns</TaskItem>
              </TaskContent>
            </Task>
            <Task>
              <TaskTrigger title="Updating imports across codebase" />
              <TaskContent>
                <TaskItem>Modified 12 files</TaskItem>
              </TaskContent>
            </Task>
          </div>
        </DemoFrame>
      </AiSection>

      {/* ── Checkpoint ───────────────────────────────────────────────────── */}
      <AiSection
        id="ae-checkpoint"
        title="Checkpoint"
        description="Inline divider with optional action buttons. Used to mark save points or branching moments in a conversation."
      >
        <DemoFrame>
          <div className="max-w-lg flex flex-col gap-3">
            <Checkpoint>
              <CheckpointLabel>
                <CheckpointIcon />
                Checkpoint
              </CheckpointLabel>
              <CheckpointActions>
                <CheckpointTrigger variant="ghost" size="sm">View changes</CheckpointTrigger>
                <CheckpointTrigger variant="default" size="sm">
                  <RotateCcwIcon className="size-4" />
                  Restore
                </CheckpointTrigger>
              </CheckpointActions>
            </Checkpoint>
            <Checkpoint>
              <CheckpointLabel>
                <CheckpointIcon />
                Before refactor
              </CheckpointLabel>
              <CheckpointActions>
                <CheckpointTrigger variant="ghost" size="sm">View changes</CheckpointTrigger>
                <CheckpointTrigger variant="default" size="sm">
                  <RotateCcwIcon className="size-4" />
                  Restore
                </CheckpointTrigger>
              </CheckpointActions>
            </Checkpoint>
          </div>
        </DemoFrame>
      </AiSection>

      {/* ── Commit ───────────────────────────────────────────────────────── */}
      <AiSection
        id="ae-commit"
        title="Commit"
        description="Git commit card with author, hash, message, and expandable file diff summary."
      >
        <DemoFrame>
          <div className="max-w-lg">
            <Commit defaultOpen>
              <CommitHeader>
                <CommitInfo>
                  <CommitMessage>feat: add Delta table query examples</CommitMessage>
                  <CommitMetadata>
                    <CommitHash>a1b2c3d</CommitHash>
                    <CommitSeparator />
                    <CommitTimestamp date={new Date(Date.now() - 1000 * 60 * 60 * 2)} />
                  </CommitMetadata>
                </CommitInfo>
                <CommitActions>
                  <CommitCopyButton hash="a1b2c3d" />
                </CommitActions>
              </CommitHeader>
              <CommitContent>
                <CommitFiles>
                  <CommitFile>
                    <CommitFileInfo>
                      <CommitFileStatus status="added" />
                      <CommitFileIcon />
                      <CommitFilePath>src/examples/delta-query.py</CommitFilePath>
                    </CommitFileInfo>
                    <CommitFileChanges>
                      <CommitFileAdditions count={42} />
                    </CommitFileChanges>
                  </CommitFile>
                  <CommitFile>
                    <CommitFileInfo>
                      <CommitFileStatus status="modified" />
                      <CommitFileIcon />
                      <CommitFilePath>src/lib/catalog.ts</CommitFilePath>
                    </CommitFileInfo>
                    <CommitFileChanges>
                      <CommitFileAdditions count={8} />
                      <CommitFileDeletions count={3} />
                    </CommitFileChanges>
                  </CommitFile>
                  <CommitFile>
                    <CommitFileInfo>
                      <CommitFileStatus status="deleted" />
                      <CommitFileIcon />
                      <CommitFilePath>src/examples/legacy-query.sql</CommitFilePath>
                    </CommitFileInfo>
                    <CommitFileChanges>
                      <CommitFileDeletions count={18} />
                    </CommitFileChanges>
                  </CommitFile>
                </CommitFiles>
              </CommitContent>
            </Commit>
          </div>
        </DemoFrame>
      </AiSection>

      {/* ── Snippet ──────────────────────────────────────────────────────── */}
      <AiSection
        id="ae-snippet"
        title="Snippet"
        description="Copyable inline code input. Useful for sharing install commands or connection strings."
      >
        <DemoFrame>
          <div className="max-w-md flex flex-col gap-3">
            <Snippet code="npx shadcn@latest add button">
              <SnippetInput />
              <SnippetCopyButton />
            </Snippet>
            <Snippet code="databricks configure --token">
              <SnippetInput />
              <SnippetCopyButton />
            </Snippet>
          </div>
        </DemoFrame>
      </AiSection>

      {/* ── Terminal ─────────────────────────────────────────────────────── */}
      <AiSection
        id="ae-terminal"
        title="Terminal"
        description="Dark terminal output pane with ANSI color support, copy, and optional clear. Auto-scrolls while streaming."
      >
        <DemoFrame>
          <div className="max-w-2xl">
            <Terminal
              output={`Installing dependencies...\n\u001b[32m✓\u001b[0m React 18.3.1\n\u001b[32m✓\u001b[0m Next.js 15.0.0\n\u001b[32m✓\u001b[0m Tailwind CSS 4.0.0\n\u001b[33m⚠\u001b[0m Peer dependency warning: react-dom\n\nBuild complete in 3.2s`}
            />
          </div>
        </DemoFrame>
      </AiSection>

      {/* ── Web Preview ──────────────────────────────────────────────────── */}
      <AiSection
        id="ae-web-preview"
        title="Web Preview"
        description="Sandboxed iframe preview with URL bar navigation and console panel. Useful for rendering agent-generated HTML or live apps."
      >
        <DemoFrame>
          <div className="max-w-2xl h-96">
            <WebPreview defaultUrl="/">
              <WebPreviewNavigation>
                <WebPreviewNavigationButton tooltip="Back" disabled>
                  <ArrowLeftIcon className="h-4 w-4" />
                </WebPreviewNavigationButton>
                <WebPreviewNavigationButton tooltip="Forward" disabled>
                  <ArrowRightIcon className="h-4 w-4" />
                </WebPreviewNavigationButton>
                <WebPreviewNavigationButton tooltip="Reload">
                  <RotateCwIcon className="h-4 w-4" />
                </WebPreviewNavigationButton>
                <WebPreviewUrl />
                <WebPreviewNavigationButton tooltip="Open in new tab">
                  <ExternalLinkIcon className="h-4 w-4" />
                </WebPreviewNavigationButton>
                <WebPreviewNavigationButton tooltip="Fullscreen">
                  <MaximizeIcon className="h-4 w-4" />
                </WebPreviewNavigationButton>
              </WebPreviewNavigation>
              <WebPreviewBody />
              <WebPreviewConsole
                logs={[
                  { level: "log", message: "Page loaded", timestamp: new Date() },
                  { level: "warn", message: "Deprecated API usage detected", timestamp: new Date() },
                  { level: "error", message: "Failed to fetch /api/data", timestamp: new Date() },
                ]}
              />
            </WebPreview>
          </div>
        </DemoFrame>
      </AiSection>

      <Separator className="my-8" />
      <p className="text-xs text-muted-foreground pb-8">
        AI Elements · DuBois tokens on shadcn/ui · Tailwind v4
      </p>
    </div>
  );
}
