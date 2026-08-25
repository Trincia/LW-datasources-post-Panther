"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchMarketplaceView } from "@/components/lakewatch/marketplace/LakewatchMarketplaceView"

export default function LakewatchMarketplacePage() {
  return (
    <LakewatchAppShell
      activeItem="marketplace"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchMarketplaceView />
    </LakewatchAppShell>
  )
}
