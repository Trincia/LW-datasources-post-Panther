"use client"

import * as React from "react"
import { LoaderCircle } from "lucide-react"

import { CheckCircleIcon } from "@/components/icons"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ValidationState = "idle" | "validating" | "verified"

/**
 * Drives a fake validation lifecycle from a value: any non-empty value shows a
 * spinner for `delayMs`, then a verified state. Empty resets to idle. Used for
 * link / source-location fields whether they're typed, autofilled, chosen from
 * a Select, or picked from a browser.
 */
export function useValidationState(value: string, delayMs = 1500) {
  const [state, setState] = React.useState<ValidationState>(() =>
    value.trim() ? "verified" : "idle"
  )
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (!value.trim()) {
      setState("idle")
      return
    }
    setState("validating")
    timer.current = setTimeout(() => {
      setState("verified")
      timer.current = null
    }, delayMs)
    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
    }
  }, [value, delayMs])

  return state
}

/** The spinner → green check indicator, sized to sit beside a field. */
export function ValidationIndicator({
  value,
  delayMs,
  className,
}: {
  value: string
  delayMs?: number
  className?: string
}) {
  const state = useValidationState(value, delayMs)
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center",
        className
      )}
      aria-live="polite"
    >
      {state === "validating" ? (
        <LoaderCircle
          className="h-4 w-4 animate-spin text-muted-foreground"
          aria-label="Validating"
        />
      ) : state === "verified" ? (
        <CheckCircleIcon
          className="h-4 w-4 text-[var(--success)]"
          ariaLabel="Verified"
        />
      ) : null}
    </span>
  )
}

/**
 * A text input for links / source locations that shows an inline validation
 * indicator on the right: a spinner while validating, then a green check.
 * Validation is faked (a delay) since this is a prototype — any non-empty
 * value briefly "validates" then verifies.
 */
export function ValidatedInput({
  value,
  className,
  containerClassName,
  validationDelayMs = 1500,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value"> & {
  value: string
  containerClassName?: string
  validationDelayMs?: number
}) {
  const state = useValidationState(value, validationDelayMs)

  return (
    <div className={cn("relative", containerClassName)}>
      <Input value={value} className={cn("pr-9", className)} {...props} />
      <span
        className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center"
        aria-live="polite"
      >
        {state === "validating" ? (
          <LoaderCircle
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-label="Validating"
          />
        ) : state === "verified" ? (
          <CheckCircleIcon
            className="h-4 w-4 text-[var(--success)]"
            ariaLabel="Verified"
          />
        ) : null}
      </span>
    </div>
  )
}
