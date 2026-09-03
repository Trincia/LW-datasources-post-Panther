"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchDetectionRuleDetailView } from "@/components/lakewatch/detection-rules/LakewatchDetectionRuleDetailView"

export default function LakewatchDetectionRulePage() {
  return (
    <LakewatchAppShell
      activeItem="detection"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchDetectionRuleDetailView />
    </LakewatchAppShell>
  )
}
