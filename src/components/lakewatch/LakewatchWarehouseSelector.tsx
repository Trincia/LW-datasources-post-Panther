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

const COMPUTE_OPTIONS = [
  "Lakewatch Warehouse",
  "Serverless SQL",
  "Shared Warehouse",
]

const CATALOG_OPTIONS = ["group_7_demo", "staging", "production"]

export function LakewatchCatalogSelector({ className }: { className?: string }) {
  const [catalog, setCatalog] = React.useState(CATALOG_OPTIONS[0])

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
      <DropdownMenuContent align="start" className="w-[213px]">
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

export function LakewatchWarehouseSelector() {
  const [warehouse, setWarehouse] = React.useState(COMPUTE_OPTIONS[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="min-w-[213px] justify-between gap-2 font-normal"
          aria-label={`Compute: ${warehouse}`}
        >
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--success)]" aria-hidden />
            <span className="text-foreground">{warehouse}</span>
          </span>
          <ChevronDownIcon size={16} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuRadioGroup value={warehouse} onValueChange={setWarehouse}>
          {COMPUTE_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              <span className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full bg-[var(--success)]"
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

export function LakewatchDataControls({ className }: { className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      <LakewatchWarehouseSelector />
    </div>
  )
}
