"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchAddDatasourceView } from "@/components/lakewatch/datasources-new/LakewatchAddDatasourceView"

export default function NewDatasourcePage() {
  return (
    <LakewatchAppShell
      activeItem="datasources"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchAddDatasourceView />
    </LakewatchAppShell>
  )
}
