"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchAwsS3WizardView } from "@/components/lakewatch/datasources-new/LakewatchAwsS3WizardView"

export default function AwsS3DatasourcePage() {
  return (
    <LakewatchAppShell
      activeItem="datasources"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchAwsS3WizardView />
    </LakewatchAppShell>
  )
}
