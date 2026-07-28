"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  NotebookIcon, QueryEditorIcon, FileIcon, CloseIcon, OverflowIcon,
} from "@/components/icons"
import { LayoutPanelLeft, Plus } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type EditorTabType = "notebook" | "query" | "file"

export interface EditorTab {
  id: string
  label: string
  type: EditorTabType
  modified?: boolean
}

interface EditorTabBarProps {
  tabs: EditorTab[]
  activeTabId: string
  onTabClick: (id: string) => void
  onTabClose: (id: string) => void
  onNewTab?: () => void
  className?: string
}

// ─── Sub-component ────────────────────────────────────────────────────────────

const TAB_ICONS: Record<EditorTabType, React.ComponentType<{ size?: number; className?: string }>> = {
  notebook: NotebookIcon,
  query:    QueryEditorIcon,
  file:     FileIcon,
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditorTabBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
  className,
}: EditorTabBarProps) {
  return (
    <div
      className={cn(
        "flex h-9 items-stretch border-b border-border bg-secondary overflow-x-auto",
        className
      )}
    >
      {/* Tabs */}
      <div className="flex items-stretch min-w-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          const Icon = TAB_ICONS[tab.type]
          return (
            <div
              key={tab.id}
              role="tab"
              tabIndex={0}
              aria-selected={isActive}
              onClick={() => onTabClick(tab.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onTabClick(tab.id) }}
              className={cn(
                "group relative flex h-full cursor-pointer items-center gap-1.5 border-r border-border px-3 text-xs transition-colors shrink-0 max-w-[200px] focus:outline-none",
                isActive
                  ? "bg-background text-foreground font-semibold"
                  : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {/* Active top border indicator */}
              {isActive && (
                <span className="absolute top-0 left-0 h-0.5 w-full bg-primary" />
              )}
              <Icon size={13} className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className="truncate">{tab.label}</span>
              {tab.modified && !isActive && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => { e.stopPropagation(); onTabClose(tab.id) }}
                className={cn(
                  "ml-0.5 h-4 w-4 shrink-0 rounded transition-colors",
                  "opacity-0 group-hover:opacity-100",
                  isActive && "opacity-100",
                  "hover:bg-muted-foreground/20"
                )}
                aria-label={`Close ${tab.label}`}
              >
                <CloseIcon size={10} className="text-muted-foreground" />
              </Button>
            </div>
          )
        })}
      </div>

      {/* New tab */}
      <Button
        variant="ghost"
        size="icon-xs"
        className="shrink-0 self-center mx-1"
        aria-label="New tab"
        onClick={onNewTab}
      >
        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex shrink-0 items-center gap-0.5 pr-2">
        <Button variant="ghost" size="icon-xs" aria-label="Toggle layout">
          <LayoutPanelLeft className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon-xs" aria-label="More options">
          <OverflowIcon size={14} className="text-muted-foreground" />
        </Button>
      </div>
    </div>
  )
}
