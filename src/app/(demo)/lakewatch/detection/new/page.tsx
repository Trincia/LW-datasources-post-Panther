"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchDetectionRuleWizard } from "@/components/lakewatch/detection-rules/LakewatchDetectionRuleWizard"

export default function LakewatchCreateDetectionRulePage() {
  return (
    <LakewatchAppShell
      activeItem="detection"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchDetectionRuleWizard mode="create" />
    </LakewatchAppShell>
  )
}
