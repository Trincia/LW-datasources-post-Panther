"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchOverviewView } from "@/components/lakewatch/LakewatchOverviewView"

export default function LakewatchOverviewPage() {
  return (
    <LakewatchAppShell
      activeItem="overview"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchOverviewView />
    </LakewatchAppShell>
  )
}
