"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { AppIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ─── Product icons ────────────────────────────────────────────────────────────

function LakehouseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4.48047L28 13.1205H4L16 4.48047Z" fill="#FABFBA"/>
      <path d="M4.46094 22.2402H15.5009C15.5009 25.1563 13.137 27.5202 10.2209 27.5202H9.74094C6.82488 27.5202 4.46094 25.1563 4.46094 22.2402Z" fill="#FF5F46"/>
      <path d="M4.46094 15.6289H15.5009C15.5009 18.545 13.137 20.9089 10.2209 20.9089H9.74094C6.82488 20.9089 4.46094 18.545 4.46094 15.6289Z" fill="#FABFBA"/>
      <path d="M27.501 20.9082L16.461 20.9082C16.461 17.9921 18.8249 15.6282 21.741 15.6282L22.221 15.6282C25.137 15.6282 27.501 17.9921 27.501 20.9082Z" fill="#FF5F46"/>
      <path d="M27.501 27.5195L16.461 27.5195C16.461 24.6035 18.8249 22.2395 21.741 22.2395L22.221 22.2395C25.137 22.2395 27.501 24.6035 27.501 27.5195Z" fill="#FABFBA"/>
    </svg>
  )
}

function DatabricksOneIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#dbone-clip)">
        <path d="M11.0088 9.85254L7.98926 11.4941V21.3672L11.0088 23.0078V27.3604L4 23.3311V9.53027L11.0088 5.5V9.85254ZM28 9.53027V23.3311L21.0088 27.3506V22.998L24.0107 21.3672V11.4941L21.0088 9.8623V5.50977L28 9.53027Z" fill="#FFDB96"/>
        <path d="M21.5326 13.3763V19.4845L16.0466 22.5386L10.5605 19.4845V13.3763L16.0466 10.3223L21.5326 13.3763ZM12.1119 14.2453V18.6155L16.0466 20.806L19.9812 18.6155V14.2453L16.0466 12.0548L12.1119 14.2453Z" fill="#FFAB00"/>
      </g>
      <defs>
        <clipPath id="dbone-clip">
          <rect x="4" y="4" width="24" height="23.9999" rx="2" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  )
}

function LakebaseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#lakebase-clip)">
        <path d="M28 19.1221C26.2178 19.7214 24.1777 20.0635 22 20.0635C19.8223 20.0635 17.7799 19.7214 16 19.1221H28ZM28 19.1211H16C14.22 18.4966 12.1777 18.1397 10 18.1396C7.82228 18.1396 5.78219 18.4966 4 19.1211V12.7422H28V19.1211Z" fill="#9ED6C4"/>
        <path d="M10.0283 20.4863C12.1958 20.4863 14.2284 20.8112 16 21.3799C17.7716 21.9485 19.8042 22.2734 21.9717 22.2734C23.8683 22.2734 25.66 22.0242 27.2666 21.5811L27.9434 21.3799H28V27.999H4V21.3799H4.05664C5.83043 20.8112 7.86087 20.4863 10.0283 20.4863Z" fill="#00A972"/>
        <rect x="4" y="4" width="23.9999" height="6.61969" fill="#9ED6C4"/>
      </g>
      <defs>
        <clipPath id="lakebase-clip">
          <rect width="24" height="23.9999" fill="white" transform="translate(4 4)"/>
        </clipPath>
      </defs>
    </svg>
  )
}

function DatabricksAppsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#apps-clip)">
        <rect x="4" y="4" width="11" height="11" fill="#FABFBA"/>
        <path d="M9.5 17L15 28H4L9.5 17Z" fill="#FF5F46"/>
        <rect x="17" y="4" width="11" height="11" rx="5.5" fill="#FF5F46"/>
        <path d="M17 21C17 18.7909 18.7909 17 21 17H24C26.2091 17 28 18.7909 28 21V28H17V21Z" fill="#FABFBA"/>
      </g>
      <defs>
        <clipPath id="apps-clip">
          <rect width="24" height="23.9999" fill="white" transform="translate(4 4)"/>
        </clipPath>
      </defs>
    </svg>
  )
}

// ─── App list ─────────────────────────────────────────────────────────────────

const APPS = [
  {
    id: "lakehouse",
    name: "Lakehouse",
    desc: "Analytics & AI on large-scale data",
    Icon: LakehouseIcon,
    href: "/shell",
  },
  {
    id: "databricks-one",
    name: "Databricks One",
    desc: "Business insights from data and AI",
    Icon: DatabricksOneIcon,
    href: "/shell",
  },
  {
    id: "lakebase",
    name: "Lakebase Postgres",
    desc: "Operational databases for applications",
    Icon: LakebaseIcon,
    href: "/shell",
  },
  {
    id: "databricks-apps",
    name: "Databricks Apps",
    desc: "Create and manage your Databricks apps",
    Icon: DatabricksAppsIcon,
    href: "/apps",
  },
] as const

function activeAppIdFromPath(pathname: string): (typeof APPS)[number]["id"] {
  if (pathname.startsWith("/apps")) return "databricks-apps"
  return "lakehouse"
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const activeApp = activeAppIdFromPath(pathname)

  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="App launcher"
        onClick={() => setOpen((v) => !v)}
      >
        <AppIcon className="h-4 w-4 text-muted-foreground" />
      </Button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-[297px] rounded-md border border-border bg-background p-[6px] shadow-[var(--shadow-db-lg)]"
          role="menu"
        >
          {APPS.map((app) => {
            const isActive = activeApp === app.id
            return (
              <button
                key={app.id}
                role="menuitem"
                type="button"
                onClick={() => {
                  router.push(app.href)
                  setOpen(false)
                }}
                className={cn(
                  "flex h-[50px] w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors",
                  isActive ? "bg-[var(--action-default-bg-hover)]" : "hover:bg-[var(--action-default-bg-hover)]",
                )}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded p-1">
                  <app.Icon />
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-sm font-semibold leading-5 text-foreground">
                    {app.name}
                  </span>
                  <span className="truncate text-hint text-muted-foreground">
                    {app.desc}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
