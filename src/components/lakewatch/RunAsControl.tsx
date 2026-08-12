"use client"

import * as React from "react"
import { Pencil, User } from "lucide-react"

import { CheckCircleIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

export const RUN_AS_OPTIONS = [
  {
    value: "beau.trincia@databricks.com",
    label: "beau.trincia@databricks.com",
  },
  {
    value: "lakewatch-service-principal",
    label: "Lakewatch service principal",
  },
  {
    value: "security-platform@databricks.com",
    label: "security-platform@databricks.com",
  },
] as const

export function RunAsControl({
  value,
  onValueChange,
  className,
}: {
  value: string
  onValueChange: (value: string) => void
  className?: string
  /** @deprecated no longer used — kept for callsite compatibility */
  align?: "start" | "center" | "end"
}) {
  const current =
    RUN_AS_OPTIONS.find((option) => option.value === value) ?? RUN_AS_OPTIONS[0]

  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState(value)

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(value)
    setOpen(next)
  }

  const applyChange = () => {
    onValueChange(draft)
    setOpen(false)
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-hint text-muted-foreground",
        className
      )}
    >
      <User className="h-4 w-4 text-muted-foreground" />
      <span>Run as {current.label}</span>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Edit run as"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run as</DialogTitle>
            <DialogDescription>
              Choose the identity Lakewatch uses to run this workload.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <RadioGroup value={draft} onValueChange={setDraft} className="gap-1">
              {RUN_AS_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`run-as-${option.value}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 transition-colors hover:border-primary/40",
                    draft === option.value && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem
                    id={`run-as-${option.value}`}
                    value={option.value}
                  />
                  <span className="flex-1 text-sm text-foreground">
                    {option.label}
                  </span>
                  {value === option.value ? (
                    <span className="flex items-center gap-1.5 text-hint text-[var(--success)]">
                      <CheckCircleIcon
                        className="h-4 w-4"
                        ariaLabel="Current identity"
                      />
                      Current
                    </span>
                  ) : null}
                </label>
              ))}
            </RadioGroup>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="default" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button variant="primary" size="sm" onClick={applyChange}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
