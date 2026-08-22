"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchCreateNormalizerStudio } from "@/components/lakewatch/normalizers/LakewatchCreateNormalizerStudio"

export default function LakewatchCreateNormalizerPage() {
  return (
    <LakewatchAppShell
      activeItem="normalizers"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchCreateNormalizerStudio />
    </LakewatchAppShell>
  )
}
