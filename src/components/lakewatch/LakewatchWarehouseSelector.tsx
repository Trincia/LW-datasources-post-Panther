"use client"

import * as React from "react"

import { CatalogIcon, ChevronDownIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const COMPUTE_OPTIONS = ["sec_dev", "sec_stag", "sec_sandbox"]

const CATALOG_OPTIONS = ["sec_sandbox", "sec_dev", "sec_stag"]

export function LakewatchCatalogSelector({ className }: { className?: string }) {
  const [catalog, setCatalog] = React.useState("sec_dev")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className={cn("min-w-[213px] justify-between gap-2 font-normal", className)}
          aria-label={`Catalog: ${catalog}`}
        >
          <span className="flex items-center gap-2">
            <CatalogIcon size={16} className="text-muted-foreground" aria-hidden />
            <span className="text-foreground">{catalog}</span>
          </span>
          <ChevronDownIcon size={16} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[213px] border-[#083253] bg-[#02223d] text-white"
      >
        <DropdownMenuRadioGroup value={catalog} onValueChange={setCatalog}>
          {CATALOG_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              <span className="flex items-center gap-2">
                <CatalogIcon
                  size={16}
                  className="text-muted-foreground"
                  aria-hidden
                />
                {option}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function LakewatchWarehouseSelector({
  options = COMPUTE_OPTIONS,
  className,
}: {
  options?: string[]
  className?: string
} = {}) {
  const [warehouse, setWarehouse] = React.useState(options[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className={cn(
            "min-w-[213px] justify-between gap-2 font-normal",
            className
          )}
          aria-label={`Compute: ${warehouse}`}
        >
          <span className="flex items-center gap-2">
            <CatalogIcon size={16} className="text-muted-foreground" aria-hidden />
            <span className="text-foreground">{warehouse}</span>
          </span>
          <ChevronDownIcon size={16} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuRadioGroup value={warehouse} onValueChange={setWarehouse}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              <span className="flex items-center gap-2">
                <CatalogIcon
                  size={16}
                  className="text-muted-foreground"
                  aria-hidden
                />
                {option}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Boxed green status indicator shown next to the catalog/compute picker to
 * signal the warehouse is running. Matches the indicator on the datasource
 * detail header so it reads consistently across the site.
 */
export function WarehouseStatusIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-8 w-9 shrink-0 items-center justify-center rounded border border-input bg-background",
        className
      )}
      role="img"
      aria-label="Warehouse running"
    >
      <span className="h-2 w-2 rounded-full bg-[var(--success)]" aria-hidden />
    </div>
  )
}

export function LakewatchDataControls({ className }: { className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      <LakewatchWarehouseSelector />
      <WarehouseStatusIndicator />
    </div>
  )
}
