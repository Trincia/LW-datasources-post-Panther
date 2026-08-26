"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchCreateNormalizerStudio } from "@/components/lakewatch/normalizers/LakewatchCreateNormalizerStudio"

function CreateNormalizerStudio() {
  const searchParams = useSearchParams()
  // e.g. ?dest=model:authentication — locks the destination to a normalized table.
  const dest = searchParams.get("dest")
  return (
    <LakewatchCreateNormalizerStudio
      presetTargetValue={dest ?? undefined}
      lockDestination={Boolean(dest)}
    />
  )
}

export default function LakewatchCreateNormalizerPage() {
  return (
    <LakewatchAppShell
      activeItem="normalizers"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <Suspense>
        <CreateNormalizerStudio />
      </Suspense>
    </LakewatchAppShell>
  )
}
