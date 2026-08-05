import { SunIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

export type LakewatchDatasourceLogoKind =
  | "fluentbit"
  | "cloudtrail"
  | "slack"
  | "1password"
  | "okta"

const BRAND_LOGOS: Partial<Record<LakewatchDatasourceLogoKind, string>> = {
  cloudtrail: "/lakewatch/ingest-v2-logos/cloudtrail.png",
  slack: "/lakewatch/ingest-v2-logos/slack.svg",
  "1password": "/lakewatch/ingest-v2-logos/1password.svg",
}

export function LakewatchDatasourceLogo({
  kind,
  size = "list",
}: {
  kind: LakewatchDatasourceLogoKind
  size?: "node" | "list" | "detail"
}) {
  const brandSrc = BRAND_LOGOS[kind]

  return (
    <span
      className={cn(
        "block shrink-0 overflow-hidden rounded",
        size === "detail" ? "size-10" : size === "node" ? "size-6" : "size-8",
      )}
      aria-hidden
    >
      {brandSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={brandSrc} alt="" className="size-full object-contain" />
      ) : kind === "fluentbit" ? (
        <span className="block size-full bg-muted-foreground/20" />
      ) : (
        <SunIcon className="size-full text-foreground" aria-hidden />
      )}
    </span>
  )
}
