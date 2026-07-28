"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"

export default function LakewatchOverviewPage() {
  return (
    <LakewatchAppShell activeItem="overview" workspace="Production" userInitial="J">
      <div className="p-6">
        <h1 className={PAGE_TITLE_SEMIBOLD}>Overview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Lakewatch overview placeholder for the post-Panther prototype.
        </p>
      </div>
    </LakewatchAppShell>
  )
}
