"use client"

import { notFound, useParams } from "next/navigation"

import { LakewatchAppShell } from "@/components/lakewatch"
import {
  CONNECT_SOURCES,
  LakewatchLakeflowConnectWizardView,
  type LakewatchConnectSource,
} from "@/components/lakewatch/datasources-new/LakewatchLakeflowConnectWizardView"

export default function LakeflowConnectDatasourcePage() {
  const { source } = useParams<{ source: string }>()

  if (!Object.prototype.hasOwnProperty.call(CONNECT_SOURCES, source)) {
    notFound()
  }

  return (
    <LakewatchAppShell
      activeItem="datasources"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchLakeflowConnectWizardView source={source as LakewatchConnectSource} />
    </LakewatchAppShell>
  )
}
