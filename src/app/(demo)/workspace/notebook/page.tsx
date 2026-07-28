"use client"

import * as React from "react"
import Link from "next/link"
import { AppShell } from "@/components/shell/AppShell"
import { SidePanel } from "@/components/shell/SidePanel"
import { EditorTabBar, EditorTab } from "@/components/shell/EditorTabBar"
import { NotebookCell } from "@/components/ui/notebook-cell"
import { Button } from "@/components/ui/button"
import { TreeNode } from "@/components/ui/tree"
import {
  NotebookIcon, FolderFillIcon, FolderHomeIcon, UserGroupIcon,
  QueryEditorIcon, MarkdownIcon, DashboardIcon, RunIcon,
} from "@/components/icons"
import { ChevronDown, Plus } from "lucide-react"

// ─── Tree data ────────────────────────────────────────────────────────────────

const FILE_TREE: TreeNode[] = [
  {
    id: "home",
    label: "Home",
    icon: FolderHomeIcon,
    children: [],
  },
  {
    id: "shared",
    label: "Shared with me",
    icon: UserGroupIcon,
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: FolderFillIcon,
    iconClassName: "text-blue-400 dark:text-blue-500",
    defaultExpanded: true,
    children: [
      {
        id: "projects",
        label: "Projects",
        icon: FolderFillIcon,
        iconClassName: "text-blue-400 dark:text-blue-500",
        defaultExpanded: true,
        children: [
          { id: "notebook-1",        label: "New Notebook 2026-02-22 21:02:35", icon: NotebookIcon },
          { id: "sales-query",       label: "sales_query.sql",                  icon: QueryEditorIcon },
          { id: "rules-md",          label: "rules.md",                         icon: MarkdownIcon },
          { id: "avocado-dashboard", label: "Avocado Dashboard",                icon: DashboardIcon },
        ],
      },
    ],
  },
]

const INITIAL_TABS: EditorTab[] = [
  { id: "notebook-1",  label: "New Notebook 2026-02-22 21:02:35", type: "notebook" },
  { id: "sales-query", label: "sales_query.sql",                  type: "query" },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotebookPage() {
  const [selectedFile, setSelectedFile] = React.useState("notebook-1")
  const [activeTab, setActiveTab]       = React.useState("notebook-1")
  const [tabs, setTabs]                 = React.useState<EditorTab[]>(INITIAL_TABS)

  function handleTabClose(id: string) {
    const next = tabs.find((t) => t.id !== id)
    setTabs((prev) => prev.filter((t) => t.id !== id))
    if (activeTab === id) setActiveTab(next?.id ?? "")
  }

  function handleFileSelect(id: string) {
    setSelectedFile(id)
    // Open file as a new tab if not already open
    const alreadyOpen = tabs.some((t) => t.id === id)
    if (!alreadyOpen) {
      const node = FILE_TREE[2].children?.[0].children?.find((n) => n.id === id)
      if (node) {
        const type = id.endsWith(".sql") || id === "sales-query" ? "query" : "notebook"
        setTabs((prev) => [...prev, { id, label: node.label, type }])
      }
    }
    setActiveTab(id)
  }

  return (
    <AppShell activeItem="workspace" workspace="Production" userInitial="N">
      <div className="flex h-full min-h-0 flex-1">

        {/* ── Side panel ── */}
        <SidePanel
          path={["...", "Home", "user@example"]}
          nodes={FILE_TREE}
          selectedId={selectedFile}
          onSelect={handleFileSelect}
        />

        {/* ── Editor area ── */}
        <div className="flex min-w-0 flex-1 flex-col bg-background">

          {/* Tab bar */}
          <EditorTabBar
            tabs={tabs}
            activeTabId={activeTab}
            onTabClick={setActiveTab}
            onTabClose={handleTabClose}
          />

          {/* Menu toolbar */}
          <div className="flex h-9 items-center border-b border-border px-3 gap-0">
            {["File", "Edit", "View", "Run", "Help"].map((label) => (
              <Button key={label} variant="ghost" size="xs" className="px-2 text-sm">
                {label}
              </Button>
            ))}
            <span className="mx-1 text-border">|</span>
            <Button variant="ghost" size="xs" className="px-2 text-sm gap-1">
              Python
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
            <span className="ml-2 text-hint text-muted-foreground">Last edit 20 min ago</span>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <Button size="xs" className="gap-1.5">
                <RunIcon size={12} />
                Run all
              </Button>
              <Button variant="default" size="xs" className="gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--success)] inline-block" />
                Serverless
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
              <Button variant="default" size="xs">Schedule</Button>
              <Button variant="default" size="xs">Share</Button>
            </div>
          </div>

          {/* Notebook title + cells */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex max-w-4xl flex-col gap-3 p-8">
              <NotebookCell
                language="Python"
                code={[
                  "import pandas as pd",
                  "import matplotlib.pyplot as plt",
                  "from pyspark.sql import SparkSession",
                ]}
              />
              <NotebookCell
                language="Python"
                code={[
                  "df = spark.read.table(\"samples.nyctaxi.trips\")",
                  "df.show(5)",
                ]}
              />
              <NotebookCell language="SQL" code={["SELECT * FROM samples.nyctaxi.trips LIMIT 10"]} />
              <NotebookCell language="Python" code={["# Add your code here"]} />
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-primary self-start"
              >
                <Plus className="h-3.5 w-3.5" />
                Add cell
              </Button>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  )
}
