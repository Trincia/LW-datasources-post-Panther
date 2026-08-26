"use client"

import * as React from "react"

export type PrototypeVariation = "p0" | "p1a" | "p1b"

const STORAGE_KEY = "lakewatch-prototype-variation"
const UNLOCK_KEY = "lakewatch-prototype-unlocked"
const CHANGE_EVENT = "lakewatch-prototype-variation-change"

// Gate that hides the in-progress P1 prototypes behind a shared password.
const P1_PASSWORD = "SFO-YVR-ATH-MTV"

/** True for any gated P1 variation (P1A or P1B). */
export function isAnyP1(variation: PrototypeVariation): boolean {
  return variation === "p1a" || variation === "p1b"
}

export function isP1A(variation: PrototypeVariation): boolean {
  return variation === "p1a"
}

export function isP1B(variation: PrototypeVariation): boolean {
  return variation === "p1b"
}

function normalizeStored(value: string | null): PrototypeVariation {
  // Migrate the legacy single "p1" value to "p1a".
  if (value === "p1") return "p1a"
  if (value === "p1a" || value === "p1b") return value
  return "p0"
}

function readUnlocked(): boolean {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(UNLOCK_KEY) === "true"
}

function readStored(): PrototypeVariation {
  if (typeof window === "undefined") return "p0"
  const value = normalizeStored(window.localStorage.getItem(STORAGE_KEY))
  // P1 variations are only visible once the password gate has been unlocked.
  if (value !== "p0" && !readUnlocked()) return "p0"
  return value
}

/**
 * Keeps the P0 / P1A / P1B selection alive across route changes, since every
 * page mounts its own app shell. Reads happen after hydration so the server and
 * client render the same initial markup. Switching to any P1 variation requires
 * unlocking the password gate first.
 */
export function usePrototypeVariation() {
  const [variation, setVariationState] = React.useState<PrototypeVariation>("p0")
  const [unlocked, setUnlockedState] = React.useState(false)

  React.useEffect(() => {
    setVariationState(readStored())
    setUnlockedState(readUnlocked())

    const sync = () => {
      setVariationState(readStored())
      setUnlockedState(readUnlocked())
    }
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const setVariation = React.useCallback((next: PrototypeVariation) => {
    // Never allow flipping to a P1 variation unless the gate has been unlocked.
    if (next !== "p0" && !readUnlocked()) return
    window.localStorage.setItem(STORAGE_KEY, next)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  const unlock = React.useCallback((password: string) => {
    if (password.trim() !== P1_PASSWORD) return false
    window.localStorage.setItem(UNLOCK_KEY, "true")
    window.dispatchEvent(new Event(CHANGE_EVENT))
    return true
  }, [])

  return [variation, setVariation, { isUnlocked: unlocked, unlock }] as const
}
