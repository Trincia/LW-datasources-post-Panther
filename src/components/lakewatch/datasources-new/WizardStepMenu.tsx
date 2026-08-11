"use client"

import * as React from "react"
import { Check, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/**
 * Compact step indicator shown next to the page title when the vertical
 * WizardStepper is hidden (narrow layouts or when a side panel takes its space).
 * Renders a "Step X / N" button that opens a popover listing every step with the
 * current one highlighted.
 */
export function WizardStepMenu({
  steps,
  activeStep,
  className,
}: {
  steps: readonly string[]
  activeStep: number
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="default"
          size="sm"
          className={cn("shrink-0 gap-2", className)}
          aria-label={`Step ${activeStep} of ${steps.length}`}
        >
          <List className="h-4 w-4 text-muted-foreground" />
          Step {activeStep} / {steps.length}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-4">
        <ol aria-label="Datasource setup progress" className="flex flex-col">
          {steps.map((label, index) => {
            const step = index + 1
            const active = step === activeStep
            const complete = step < activeStep

            return (
              <li key={label} className="flex flex-col">
                <div className="flex items-center gap-3.5">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                      active
                        ? "border-blue-400 bg-blue-400 text-white"
                        : complete
                          ? "border-blue-400 bg-blue-400/10 text-blue-400"
                          : "border-muted-foreground text-muted-foreground"
                    )}
                    aria-current={active ? "step" : undefined}
                  >
                    {complete ? <Check className="h-4 w-4" /> : step}
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap text-sm",
                      active
                        ? "rounded border border-primary px-2 py-0.5 font-semibold text-blue-400"
                        : complete
                          ? "font-semibold text-blue-400"
                          : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {index < steps.length - 1 ? (
                  <span
                    className="my-2 ml-[13px] h-5 w-px bg-muted-foreground/60"
                    aria-hidden
                  />
                ) : null}
              </li>
            )
          })}
        </ol>
      </PopoverContent>
    </Popover>
  )
}
