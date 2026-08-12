"use client"

import { notFound, useParams } from "next/navigation"

import { LakewatchAppShell } from "@/components/lakewatch"
import {
  LakewatchAwsS3WizardView,
  type LakewatchDatasourceWizardKind,
} from "@/components/lakewatch/datasources-new/LakewatchAwsS3WizardView"

const SUPPORTED_SOURCE_TYPES = new Set<LakewatchDatasourceWizardKind>([
  "aws-sqs",
  "existing-table",
  "google-cloud-storage",
  "uc-volume",
  "azure-blob-storage",
])

export default function CustomDatasourcePage() {
  const { sourceType } = useParams<{ sourceType: string }>()

  if (!SUPPORTED_SOURCE_TYPES.has(sourceType as LakewatchDatasourceWizardKind)) {
    notFound()
  }

  return (
    <LakewatchAppShell
      activeItem="datasources"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchAwsS3WizardView kind={sourceType as LakewatchDatasourceWizardKind} />
    </LakewatchAppShell>
  )
}
