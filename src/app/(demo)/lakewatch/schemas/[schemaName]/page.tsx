"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchSchemaDetailView } from "@/components/lakewatch/schemas/LakewatchSchemaDetailView"

export default function LakewatchSchemaDetailPage() {
  return (
    <LakewatchAppShell
      activeItem="schemas"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchSchemaDetailView />
    </LakewatchAppShell>
  )
}
