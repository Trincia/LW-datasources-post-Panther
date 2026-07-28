"use client"

import * as React from "react"
import { PlusIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
import { NewMenu } from "./NewMenu"

interface NewButtonProps {
  onClick?: () => void
  className?: string
}

/**
 * DuBois "New" button — sidebar-specific.
 * Brand-tinted background (not the generic primary blue).
 * Uses Databricks brand red at varying opacity for default/hover/press states.
 * Opens the NewMenu dropdown on click.
 */
export function NewButton({ onClick, className }: NewButtonProps) {
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

  const handleClick = () => {
    setOpen((v) => !v)
    onClick?.()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleClick}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          // DuBois: 32px height (h-8), 8px radius, brand-tinted bg + border
          "flex h-8 w-full items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors",
          "border-brand-red/12 bg-brand-red/8 text-foreground",
          "hover:bg-brand-red/16 hover:border-brand-red/20",
          "active:bg-brand-red/24 active:border-brand-red/28",
          className
        )}
      >
        <PlusIcon size={16} className="shrink-0 text-brand-red" />
        <span>New</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1" role="menu">
          <NewMenu
            onItemClick={() => setOpen(false)}
            onAddData={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
