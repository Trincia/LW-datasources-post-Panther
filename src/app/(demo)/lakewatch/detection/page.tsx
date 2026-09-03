"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchDetectionRulesView } from "@/components/lakewatch/detection-rules/LakewatchDetectionRulesView"

export default function LakewatchDetectionRulesPage() {
  return (
    <LakewatchAppShell
      activeItem="detection"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchDetectionRulesView />
    </LakewatchAppShell>
  )
}
