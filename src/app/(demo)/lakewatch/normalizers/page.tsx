"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchNormalizersView } from "@/components/lakewatch/normalizers/LakewatchNormalizersView"

export default function LakewatchNormalizersPage() {
  return (
    <LakewatchAppShell
      activeItem="normalizers"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchNormalizersView />
    </LakewatchAppShell>
  )
}
