"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchDatasourcesOverviewView } from "@/components/lakewatch/datasources-new/LakewatchDatasourcesOverviewView"

export default function LakewatchDatasourcesPage() {
  return (
    <LakewatchAppShell
      activeItem="datasources"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchDatasourcesOverviewView />
    </LakewatchAppShell>
  )
}
