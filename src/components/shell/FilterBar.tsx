import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { SegmentedControl, SegmentedItem } from "@/components/ui/segmented-control"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { SplitButton } from "@/components/ui/split-button"
import { SearchIcon } from "@/components/icons"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterBarSegment {
  value: string
  label: string
}

export interface FilterBarSelect {
  value: string
  onValueChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}

export interface FilterBarProps {
  /** Controlled search text */
  searchValue?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  /** Optional segmented toggle groups */
  segments?: { value: string; onValueChange: (v: string) => void; items: FilterBarSegment[] }[]
  /** Optional dropdown selects */
  selects?: FilterBarSelect[]
  /** Primary action label for the split button (omit to hide) */
  createLabel?: string
  onCreateClick?: () => void
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Filter...",
  segments = [],
  selects = [],
  createLabel,
  onCreateClick,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Search */}
      <div className="relative">
        <SearchIcon
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          className="w-52 pl-8 text-xs"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      {/* Segmented toggles */}
      {segments.map((seg, i) => (
        <SegmentedControl key={i} value={seg.value} onValueChange={seg.onValueChange}>
          {seg.items.map((item) => (
            <SegmentedItem key={item.value} value={item.value}>
              {item.label}
            </SegmentedItem>
          ))}
        </SegmentedControl>
      ))}

      {/* Dropdown selects */}
      {selects.map((sel, i) => (
        <Select key={i} value={sel.value} onValueChange={sel.onValueChange}>
          <SelectTrigger className="w-auto min-w-[80px]">
            <SelectValue placeholder={sel.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {sel.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Create split button */}
      {createLabel && (
        <SplitButton className="ml-auto" onClick={onCreateClick}>
          {createLabel}
        </SplitButton>
      )}
    </div>
  )
}
