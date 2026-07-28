"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppShell, PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Tree, type TreeNode } from "@/components/ui/tree"
import {
  FolderFillIcon, FolderIcon, FolderHomeIcon, NotebookIcon, QueryEditorIcon,
  DashboardIcon, MarkdownIcon, StarFillIcon, OverflowIcon,
  UserGroupIcon, StarIcon, TrashIcon, FolderBranchFillIcon,
  ChevronDownIcon as ChevronDownDbIcon,
  SearchIcon, GridIcon,
} from "@/components/icons"
import { ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type FileType = "Folder" | "Git folder" | "Notebook" | "Query" | "Dashboard" | "File"

type FileItem = {
  id: string
  name: string
  type: FileType
  owner: string
  createdAt: string
  updatedAt: string
  href?: string        // if set, clicking the row navigates here
}

type PathItem = { id: string; label: string }

// ─── Nav tree ─────────────────────────────────────────────────────────────────

const BLUE = "text-blue-400 dark:text-blue-500"

const NAV_TREE: TreeNode[] = [
  {
    id: "home",
    label: "Home",
    icon: FolderHomeIcon,
    defaultExpanded: true,
    children: [
      { id: "home-drafts",    label: "Drafts",       icon: FolderIcon },
      { id: "home-assistant", label: ".assistant",   icon: FolderFillIcon,       iconClassName: BLUE },
      { id: "home-avocado",   label: "Avocado_Flow", icon: FolderBranchFillIcon, iconClassName: BLUE },
    ],
  },
  { id: "shared", label: "Shared with me", icon: UserGroupIcon },
  {
    id: "workspace",
    label: "Workspace",
    icon: FolderFillIcon,
    iconClassName: BLUE,
    children: [
      { id: "ws-projects", label: "Projects", icon: FolderFillIcon,       iconClassName: BLUE },
      { id: "ws-repos",    label: "Repos",    icon: FolderBranchFillIcon, iconClassName: BLUE },
      { id: "ws-shared",   label: "Shared",   icon: FolderIcon },
      { id: "ws-users",    label: "Users",    icon: UserGroupIcon },
    ],
  },
  { id: "favorites", label: "Favorites", icon: StarIcon },
  { id: "trash",     label: "Trash",     icon: TrashIcon },
]

// ─── File data ────────────────────────────────────────────────────────────────

const FILES: Record<string, FileItem[]> = {
  home: [
    { id: "home-drafts",   name: "Drafts",                   type: "Folder",    owner: "Joy Xie", createdAt: "May 19, 2025, 01:37 PM", updatedAt: "May 19, 2025, 01:37 PM" },
    { id: "home-apps",     name: "Apps",                     type: "Folder",    owner: "Joy Xie", createdAt: "Feb 13, 2025, 02:30 PM", updatedAt: "Feb 13, 2025, 02:30 PM" },
    { id: "home-projects", name: "Projects",                  type: "Folder",    owner: "Joy Xie", createdAt: "Jan 10, 2025, 09:00 AM", updatedAt: "Mar 01, 2026, 11:00 AM" },
    { id: "h4",            name: "(Clone) draft",             type: "Folder",    owner: "Joy Xie", createdAt: "Mar 04, 2025, 02:13 PM", updatedAt: "Mar 04, 2025, 02:13 PM" },
    { id: "h5",            name: "(Clone) Qualtrics fee...",  type: "Folder",    owner: "Joy Xie", createdAt: "Nov 28, 2023, 10:33 AM", updatedAt: "Nov 28, 2023, 10:33 AM" },
    { id: "h6",            name: ".assistant",                type: "Folder",    owner: "Joy Xie", createdAt: "Jan 30, 2026, 04:27 PM", updatedAt: "Jan 30, 2026, 04:27 PM" },
    { id: "h7",            name: "AgentSt...",                type: "Git folder",owner: "Joy Xie", createdAt: "Sep 11, 2025, 10:22 AM", updatedAt: "—" },
    { id: "h8",            name: "customer_churn_model",      type: "Notebook",  owner: "Joy Xie", createdAt: "Jan 15, 2025, 09:00 AM", updatedAt: "Mar 04, 2025, 10:30 AM", href: "/workspace/notebook" },
    { id: "h9",            name: "etl_pipeline_v2",           type: "Notebook",  owner: "Joy Xie", createdAt: "Feb 01, 2025, 11:00 AM", updatedAt: "Feb 28, 2025, 03:15 PM", href: "/workspace/notebook" },
    { id: "h10",           name: "sales_query.sql",           type: "Query",     owner: "Joy Xie", createdAt: "Mar 10, 2025, 10:00 AM", updatedAt: "Mar 12, 2025, 02:00 PM", href: "/workspace/notebook" },
  ],
  "home-drafts": [
    { id: "d1", name: "scratch_analysis",        type: "Notebook", owner: "Joy Xie", createdAt: "May 10, 2025, 11:00 AM", updatedAt: "May 19, 2025, 01:37 PM", href: "/workspace/notebook" },
    { id: "d2", name: "wip_feature_exploration", type: "Notebook", owner: "Joy Xie", createdAt: "Apr 22, 2025, 03:00 PM", updatedAt: "May 01, 2025, 09:15 AM", href: "/workspace/notebook" },
  ],
  "home-projects": [
    { id: "p1", name: "Avocado Dashboard",              type: "Dashboard", owner: "Joy Xie", createdAt: "Feb 01, 2025, 09:00 AM", updatedAt: "Mar 01, 2026, 11:00 AM", href: "/workspace/notebook" },
    { id: "p2", name: "New Notebook 2026-02-22 21:02",  type: "Notebook",  owner: "Joy Xie", createdAt: "Feb 22, 2026, 09:02 PM", updatedAt: "Mar 15, 2026, 04:30 PM", href: "/workspace/notebook" },
    { id: "p3", name: "rules.md",                       type: "File",      owner: "Joy Xie", createdAt: "Jan 05, 2026, 10:00 AM", updatedAt: "Jan 05, 2026, 10:00 AM" },
  ],
  workspace: [
    { id: "ws-users",    name: "Users",    type: "Folder",     owner: "Joy Xie", createdAt: "Jan 01, 2025, 00:00 AM", updatedAt: "—" },
    { id: "ws-repos",    name: "Repos",    type: "Git folder", owner: "Joy Xie", createdAt: "Jan 01, 2025, 00:00 AM", updatedAt: "—" },
    { id: "ws-projects", name: "Projects", type: "Folder",     owner: "Joy Xie", createdAt: "Jan 01, 2025, 00:00 AM", updatedAt: "Mar 01, 2026, 11:00 AM" },
  ],
}

const TITLES: Record<string, string> = {
  home: "joy@databricks.com",
}

// ─── File icon ────────────────────────────────────────────────────────────────

function FileIcon({ type }: { type: FileType }) {
  const cls = "shrink-0"
  if (type === "Notebook")   return <NotebookIcon      size={16} className={cn(cls, "text-primary")} />
  if (type === "Query")      return <QueryEditorIcon   size={16} className={cn(cls, "text-primary")} />
  if (type === "Dashboard")  return <DashboardIcon     size={16} className={cn(cls, "text-primary")} />
  if (type === "Git folder") return <FolderBranchFillIcon size={16} className={cn(cls, "text-blue-400 dark:text-blue-500")} />
  if (type === "File")       return <MarkdownIcon      size={16} className={cn(cls, "text-muted-foreground")} />
  return <FolderFillIcon size={16} className={cn(cls, "text-blue-400 dark:text-blue-500")} />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// ─── Nav helpers ──────────────────────────────────────────────────────────────

function findNode(id: string, nodes: TreeNode[] = NAV_TREE): TreeNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n
    const found = findNode(id, n.children ?? [])
    if (found) return found
  }
}

function buildParentMap(nodes: TreeNode[], parent: TreeNode | null = null, map = new Map<string, TreeNode | null>()) {
  for (const n of nodes) {
    map.set(n.id, parent)
    buildParentMap(n.children ?? [], n, map)
  }
  return map
}

const NAV_PARENT_MAP = buildParentMap(NAV_TREE)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const router = useRouter()
  const [navPath, setNavPath] = React.useState<PathItem[]>([{ id: "home", label: "Home" }])
  const [search, setSearch]   = React.useState("")
  const [starred, setStarred] = React.useState<Record<string, boolean>>({ h5: true, "home-apps": true })

  const currentId = navPath[navPath.length - 1].id
  const files     = FILES[currentId] ?? []
  const filtered  = search ? files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())) : files
  const pageTitle = TITLES[currentId] ?? navPath[navPath.length - 1].label

  function handleNavSelect(id: string) {
    const node   = findNode(id)
    if (!node) return
    const parent = NAV_PARENT_MAP.get(id) ?? null
    if (parent) {
      setNavPath([{ id: parent.id, label: parent.label }, { id: node.id, label: node.label }])
    } else {
      setNavPath([{ id: node.id, label: node.label }])
    }
    setSearch("")
  }

  function navigateTree(node: TreeNode) {
    setNavPath([{ id: node.id, label: node.label }])
    setSearch("")
  }

  function navigateIntoFolder(file: FileItem) {
    if (file.type === "Folder" || file.type === "Git folder") {
      setNavPath((p) => [...p, { id: file.id, label: file.name }])
      setSearch("")
    } else if (file.href) {
      router.push(file.href)
    }
  }

  function navigateBreadcrumb(index: number) {
    setNavPath((p) => p.slice(0, index + 1))
    setSearch("")
  }

  function toggleStar(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setStarred((p) => ({ ...p, [id]: !p[id] }))
  }

  return (
    <AppShell activeItem="workspace" workspace="Production" userInitial="N">
      <div className="flex h-full">

        {/* ── Left tree panel ── */}
        <aside className="flex w-[200px] shrink-0 flex-col border-r border-border overflow-y-auto bg-background">
          <div className="px-3 py-3 text-sm font-semibold text-foreground">Workspace</div>
          <div className="px-1 pb-2">
            <Tree
              nodes={NAV_TREE}
              selectedId={currentId}
              onSelect={handleNavSelect}
              variant="nav"
            />
          </div>
        </aside>

        {/* ── Right content panel ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">

            {/* Page header */}
            <PageHeader
              breadcrumbs={
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); navigateTree(NAV_TREE[2]) }}>
                        Workspace
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {navPath.map((item, i) => (
                      <React.Fragment key={item.id}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          {i === navPath.length - 1 ? (
                            <BreadcrumbPage>{TITLES[item.id] ?? item.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); navigateBreadcrumb(i) }}>
                              {TITLES[item.id] ?? item.label}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              }
              title={pageTitle}
              starred={starred[currentId]}
              onStarToggle={() => setStarred((p) => ({ ...p, [currentId]: !p[currentId] }))}
              actions={
                <>
                  <Button variant="default" size="sm">Share</Button>
                  <Button size="sm" className="gap-1">
                    Create <ChevronDownDbIcon size={12} />
                  </Button>
                </>
              }
            />

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <SearchIcon size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="w-52 pl-8"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="default" size="sm" className="gap-1">
                Type <ChevronDownDbIcon size={12} className="text-muted-foreground" />
              </Button>
              <Button variant="default" size="sm" className="gap-1">
                Owner <ChevronDownDbIcon size={12} className="text-muted-foreground" />
              </Button>
              <Button variant="default" size="sm" className="gap-1">
                Last modified <ChevronDownDbIcon size={12} className="text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Toggle view">
                <GridIcon size={16} className="text-muted-foreground" />
              </Button>
            </div>

            {/* File table */}
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                {search ? `No results for "${search}".` : "This folder is empty."}
              </div>
            ) : (
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead>
                        <div className="flex items-center gap-1">
                          Name <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Created at</TableHead>
                      <TableHead>Last updated at</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((file) => {
                      const isClickable = file.type === "Folder" || file.type === "Git folder" || !!file.href
                      return (
                        <TableRow
                          key={file.id}
                          className={cn("group", isClickable && "cursor-pointer")}
                          onClick={() => navigateIntoFolder(file)}
                        >
                          {/* Star */}
                          <TableCell className="w-8 pr-0">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={(e) => toggleStar(file.id, e)}
                              className={cn(
                                "transition-colors",
                                starred[file.id]
                                  ? "text-[var(--color-star)]"
                                  : "text-transparent group-hover:text-muted-foreground/40 hover:!text-[var(--color-star)]"
                              )}
                              aria-label={starred[file.id] ? "Remove from favorites" : "Add to favorites"}
                            >
                              <StarFillIcon size={14} />
                            </Button>
                          </TableCell>

                          {/* Name */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileIcon type={file.type} />
                              <span className={cn(
                                "truncate max-w-[280px]",
                                isClickable ? "text-primary hover:underline" : "text-foreground"
                              )}>
                                {file.name}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-muted-foreground">{file.type}</TableCell>
                          <TableCell className="text-muted-foreground">{file.owner}</TableCell>
                          <TableCell className="text-muted-foreground">{file.createdAt}</TableCell>
                          <TableCell className="text-muted-foreground">{file.updatedAt}</TableCell>

                          {/* Row overflow */}
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="More options"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <OverflowIcon size={14} className="text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

          </div>
        </div>

      </div>
    </AppShell>
  )
}
