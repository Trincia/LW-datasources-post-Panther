"use client"

import { ChevronDownIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"

export function LakewatchWarehouseSelector() {
  return (
    <Button
      variant="default"
      size="sm"
      className="min-w-[216px] justify-between gap-2 font-normal"
    >
      <span className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-[var(--success)]" aria-hidden />
        <span className="text-foreground">Lakewatch Warehouse</span>
      </span>
      <ChevronDownIcon size={16} className="text-muted-foreground" />
    </Button>
  )
}
