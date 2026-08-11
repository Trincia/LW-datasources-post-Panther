"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchSchemaDetailView } from "@/components/lakewatch/schemas/LakewatchSchemaDetailView"

export default function LakewatchEditSchemaPage() {
  return (
    <LakewatchAppShell
      activeItem="schemas"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchSchemaDetailView editMode />
    </LakewatchAppShell>
  )
}
