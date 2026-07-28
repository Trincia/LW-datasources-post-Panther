"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchDatasourceDetailView } from "@/components/lakewatch/datasources-new/LakewatchDatasourceDetailView"

export default function DatasourceDetailPage() {
  return (
    <LakewatchAppShell
      activeItem="datasources"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchDatasourceDetailView />
    </LakewatchAppShell>
  )
}
