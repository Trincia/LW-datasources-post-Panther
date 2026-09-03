"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchDetectionRuleWizard } from "@/components/lakewatch/detection-rules/LakewatchDetectionRuleWizard"

export default function LakewatchEditDetectionRulePage() {
  return (
    <LakewatchAppShell
      activeItem="detection"
      workspace="Production"
      userInitial="J"
      sidebarOpen={false}
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchDetectionRuleWizard />
    </LakewatchAppShell>
  )
}
