"use client"

import * as React from "react"

export type PrototypeVariation = "p0" | "p1"

const STORAGE_KEY = "lakewatch-prototype-variation"
const UNLOCK_KEY = "lakewatch-prototype-unlocked"
const CHANGE_EVENT = "lakewatch-prototype-variation-change"

// Gate that hides the in-progress P1 prototype behind a shared password.
const P1_PASSWORD = "SFO-YVR-ATH-MTV"

function readUnlocked(): boolean {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(UNLOCK_KEY) === "true"
}

function readStored(): PrototypeVariation {
  if (typeof window === "undefined") return "p0"
  // P1 is only visible once the password gate has been unlocked.
  if (!readUnlocked()) return "p0"
  return window.localStorage.getItem(STORAGE_KEY) === "p1" ? "p1" : "p0"
}

/**
 * Keeps the P0 / P1 selection alive across route changes, since every page
 * mounts its own app shell. Reads happen after hydration so the server and
 * client render the same initial markup. Switching to P1 requires unlocking
 * the password gate first.
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
    // Never allow flipping to P1 unless the gate has been unlocked.
    if (next === "p1" && !readUnlocked()) return
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
