import { NORMALIZER_GROUPS } from "@/components/lakewatch/normalizers/normalizers"

// A Data model is a normalized (OCSF or similar) destination table populated by
// one or more normalizers, each fed by a datasource. We derive each model from
// its OCSF event-class group so the source list stays in sync with the
// normalizers that actually feed it.

export type Materialization = "view" | "materialized_view" | "pipeline"

export type DataModel = {
  id: string
  name: string
  standard: "OCSF"
  version: string
  eventClass: string
  classUid: number
  category: string
  table: string
  /** Distinct datasources / parsers feeding this model. */
  sources: string[]
  records: string
  totalRows: string
  freshness: string
  lastUpdated: string
  createdAt: string
  owner: "Databricks" | "You"
  steward: string
  status: "Active" | "Draft"
  // Delivery / materialization
  materialization: Materialization
  refreshDetail: string
  pipelineName?: string
  // Governance
  description: string
  tags: string[]
  criticality: "High" | "Medium" | "Low"
  coverage: number
  dlq: string
}

export function materializationLabel(materialization: Materialization): string {
  switch (materialization) {
    case "view":
      return "View"
    case "materialized_view":
      return "Materialized view"
    case "pipeline":
      return "Pipeline"
  }
}

// Per-class realistic metadata keyed by the OCSF event-class group id.
type ModelMeta = Omit<
  DataModel,
  | "id"
  | "name"
  | "standard"
  | "version"
  | "eventClass"
  | "classUid"
  | "category"
  | "table"
  | "sources"
>

const MODEL_META: Record<string, ModelMeta> = {
  authentication: {
    records: "0.9M / 24h",
    totalRows: "1.24B",
    freshness: "2 min ago",
    lastUpdated: "Aug 20, 2026, 9:14 PM",
    createdAt: "Feb 3, 2026",
    owner: "Databricks",
    steward: "Alice Nguyen",
    status: "Active",
    materialization: "materialized_view",
    refreshDetail: "Refreshes every 5 min · last refresh 2 min ago",
    description:
      "Unified authentication and session events across identity providers, normalized to OCSF Authentication (3002).",
    tags: ["identity", "iam", "auth"],
    criticality: "High",
    coverage: 100,
    dlq: "0",
  },
  "api-activity": {
    records: "4.2M / 24h",
    totalRows: "6.8B",
    freshness: "1 min ago",
    lastUpdated: "Aug 20, 2026, 9:18 PM",
    createdAt: "Feb 3, 2026",
    owner: "Databricks",
    steward: "Diego Ramos",
    status: "Active",
    materialization: "materialized_view",
    refreshDetail: "Refreshes every 5 min · last refresh 1 min ago",
    description:
      "Cloud control-plane and SaaS API calls normalized to OCSF API Activity (6003).",
    tags: ["cloud", "audit", "api"],
    criticality: "High",
    coverage: 100,
    dlq: "312 (0.007%)",
  },
  "process-activity": {
    records: "11.8M / 24h",
    totalRows: "19.2B",
    freshness: "30 sec ago",
    lastUpdated: "Aug 20, 2026, 9:11 PM",
    createdAt: "Jan 22, 2026",
    owner: "You",
    steward: "Priya Shah",
    status: "Active",
    materialization: "pipeline",
    refreshDetail: "Streaming · Lakeflow pipeline · ~30s lag",
    pipelineName: "ocsf_process_normalize",
    description:
      "Endpoint process-execution telemetry from EDR agents normalized to OCSF Process Activity (1007).",
    tags: ["edr", "endpoint", "process"],
    criticality: "High",
    coverage: 100,
    dlq: "1,024 (0.008%)",
  },
  "network-activity": {
    records: "41.3M / 24h",
    totalRows: "62.5B",
    freshness: "20 sec ago",
    lastUpdated: "Aug 20, 2026, 9:19 PM",
    createdAt: "Jan 15, 2026",
    owner: "Databricks",
    steward: "Marcus Lee",
    status: "Active",
    materialization: "pipeline",
    refreshDetail: "Streaming · Lakeflow pipeline · ~20s lag",
    pipelineName: "ocsf_network_normalize",
    description:
      "Flow and firewall connection records normalized to OCSF Network Activity (4001).",
    tags: ["network", "flow", "firewall"],
    criticality: "High",
    coverage: 100,
    dlq: "4,510 (0.007%)",
  },
  "dns-activity": {
    records: "32.1M / 24h",
    totalRows: "48.9B",
    freshness: "25 sec ago",
    lastUpdated: "Aug 20, 2026, 9:07 PM",
    createdAt: "Jan 15, 2026",
    owner: "Databricks",
    steward: "Marcus Lee",
    status: "Active",
    materialization: "pipeline",
    refreshDetail: "Streaming · Lakeflow pipeline · ~20s lag",
    pipelineName: "ocsf_dns_normalize",
    description:
      "Recursive and passive DNS resolutions normalized to OCSF DNS Activity (4003).",
    tags: ["network", "dns"],
    criticality: "Medium",
    coverage: 100,
    dlq: "2,103 (0.006%)",
  },
  "detection-finding": {
    records: "3,976 / 24h",
    totalRows: "312.4K",
    freshness: "6 min ago",
    lastUpdated: "Aug 20, 2026, 9:02 PM",
    createdAt: "Mar 11, 2026",
    owner: "You",
    steward: "Priya Shah",
    status: "Active",
    materialization: "view",
    refreshDetail: "Computed live at query time · no storage",
    description:
      "Security detections and findings from EDR, cloud, and CSPM tools normalized to OCSF Detection Finding (2004).",
    tags: ["findings", "alerts", "detections"],
    criticality: "High",
    coverage: 100,
    dlq: "0",
  },
}

function tableSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
}

export const DATA_MODELS: DataModel[] = NORMALIZER_GROUPS.map((group) => {
  const meta = MODEL_META[group.id]
  const sources = Array.from(new Set(group.rows.map((row) => row.sourceParser)))
  return {
    id: group.id,
    name: `OCSF ${group.name}`,
    standard: "OCSF",
    version: "1.3.0",
    eventClass: group.name,
    classUid: group.classUid,
    category: group.category,
    table: `lakewatch.gold.ocsf_${tableSlug(group.name)}`,
    sources,
    ...meta,
  }
})

const MODELS_BY_ID = new Map(DATA_MODELS.map((model) => [model.id, model]))

export function getDataModel(id: string): DataModel | undefined {
  return MODELS_BY_ID.get(id)
}
