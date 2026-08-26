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
  /** Short, purpose-focused blurb for list views (why this table exists). */
  purpose: string
  tags: string[]
  criticality: "High" | "Medium" | "Low"
  coverage: number
  dlq: string
}

// An Enrichment augments the normalized OCSF table with extra context sourced
// from a reference feed (GeoIP, threat intel, HR/identity, CMDB, ML scoring…),
// populating additional OCSF fields at query/refresh time.
export type EnrichmentKind =
  | "GeoIP"
  | "Threat intel"
  | "Identity"
  | "Asset / CMDB"
  | "Reputation"
  | "WHOIS"
  | "ML model"

export type Enrichment = {
  id: string
  name: string
  kind: EnrichmentKind
  /** Reference table / feed the enrichment joins against. */
  reference: string
  /** OCSF field(s) the enrichment populates. */
  enrichedFields: string
  /** Share of rows that get a match from the reference. */
  matchRate: number
  records: string
  lastRun: string
  status: "Active" | "Draft"
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
    purpose:
      "Track logins and session activity across identity providers to spot account takeover and access anomalies.",
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
    purpose:
      "Audit cloud and SaaS API calls to detect risky control-plane changes and privilege misuse.",
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
    purpose:
      "Monitor endpoint process execution to hunt malware and suspicious command-line activity.",
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
    purpose:
      "Analyze connection and firewall flows to surface lateral movement and data exfiltration.",
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
    purpose:
      "Inspect DNS resolutions to catch C2 beaconing, DNS tunneling, and malicious domains.",
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
    purpose:
      "Consolidate detections from EDR, cloud, and CSPM tools into one triage and response surface.",
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

// Realistic enrichments per OCSF data model, keyed by group id.
const MODEL_ENRICHMENTS: Record<string, Enrichment[]> = {
  authentication: [
    {
      id: "auth-geoip",
      name: "Source IP geolocation",
      kind: "GeoIP",
      reference: "lakewatch.enrich.maxmind_geoip2_city",
      enrichedFields: "src_endpoint.location.{country, city, coordinates}",
      matchRate: 98,
      records: "0.88M / 24h",
      lastRun: "2 min ago",
      status: "Active",
    },
    {
      id: "auth-identity",
      name: "Workforce identity context",
      kind: "Identity",
      reference: "hr_prod.people.worker_directory",
      enrichedFields: "actor.user.{department, manager, employee_type}",
      matchRate: 94,
      records: "0.83M / 24h",
      lastRun: "5 min ago",
      status: "Active",
    },
    {
      id: "auth-ti",
      name: "Malicious IP reputation",
      kind: "Threat intel",
      reference: "lakewatch.enrich.ti_ip_indicators",
      enrichedFields: "src_endpoint.reputation.{score, provider}",
      matchRate: 12,
      records: "104K / 24h",
      lastRun: "2 min ago",
      status: "Active",
    },
    {
      id: "auth-risk",
      name: "Impossible-travel risk score",
      kind: "ML model",
      reference: "lakewatch.ml.auth_geo_velocity_v3",
      enrichedFields: "risk_details, risk_level",
      matchRate: 100,
      records: "0.9M / 24h",
      lastRun: "4 min ago",
      status: "Active",
    },
  ],
  "api-activity": [
    {
      id: "api-cmdb",
      name: "Cloud resource ownership",
      kind: "Asset / CMDB",
      reference: "servicenow_prod.cmdb.ci_cloud_resource",
      enrichedFields: "resources[].owner, resources[].criticality",
      matchRate: 89,
      records: "3.7M / 24h",
      lastRun: "1 min ago",
      status: "Active",
    },
    {
      id: "api-identity",
      name: "Caller identity resolution",
      kind: "Identity",
      reference: "lakewatch.enrich.iam_principal_map",
      enrichedFields: "actor.user.{name, type}, actor.session",
      matchRate: 97,
      records: "4.1M / 24h",
      lastRun: "1 min ago",
      status: "Active",
    },
    {
      id: "api-geoip",
      name: "Caller IP geolocation",
      kind: "GeoIP",
      reference: "lakewatch.enrich.maxmind_geoip2_city",
      enrichedFields: "src_endpoint.location.{country, coordinates}",
      matchRate: 91,
      records: "3.8M / 24h",
      lastRun: "2 min ago",
      status: "Active",
    },
  ],
  "process-activity": [
    {
      id: "proc-filerep",
      name: "File hash reputation",
      kind: "Reputation",
      reference: "lakewatch.enrich.filehash_reputation",
      enrichedFields: "process.file.{reputation, is_signed}",
      matchRate: 63,
      records: "7.4M / 24h",
      lastRun: "30s ago",
      status: "Active",
    },
    {
      id: "proc-asset",
      name: "Endpoint asset context",
      kind: "Asset / CMDB",
      reference: "servicenow_prod.cmdb.ci_endpoint",
      enrichedFields: "device.{owner, criticality, location}",
      matchRate: 96,
      records: "11.3M / 24h",
      lastRun: "1 min ago",
      status: "Active",
    },
    {
      id: "proc-mitre",
      name: "MITRE technique tagging",
      kind: "ML model",
      reference: "lakewatch.ml.proc_attack_classifier_v2",
      enrichedFields: "attacks[].{tactic, technique}",
      matchRate: 41,
      records: "4.8M / 24h",
      lastRun: "2 min ago",
      status: "Active",
    },
    {
      id: "proc-signer",
      name: "Code-signing certificate trust",
      kind: "Reputation",
      reference: "lakewatch.enrich.codesign_ca_trust",
      enrichedFields: "process.file.signature.{ca, is_trusted}",
      matchRate: 78,
      records: "9.1M / 24h",
      lastRun: "4 min ago",
      status: "Draft",
    },
  ],
  "network-activity": [
    {
      id: "net-geoip",
      name: "Destination IP geolocation",
      kind: "GeoIP",
      reference: "lakewatch.enrich.maxmind_geoip2_city",
      enrichedFields: "dst_endpoint.location.{country, city}",
      matchRate: 86,
      records: "38.9M / 24h",
      lastRun: "20s ago",
      status: "Active",
    },
    {
      id: "net-asn",
      name: "ASN / WHOIS ownership",
      kind: "WHOIS",
      reference: "lakewatch.enrich.maxmind_geoip2_asn",
      enrichedFields: "dst_endpoint.autonomous_system.{number, name}",
      matchRate: 90,
      records: "40.1M / 24h",
      lastRun: "20s ago",
      status: "Active",
    },
    {
      id: "net-ti",
      name: "Malicious IP reputation",
      kind: "Threat intel",
      reference: "lakewatch.enrich.ti_ip_indicators",
      enrichedFields: "dst_endpoint.reputation.{score, provider}",
      matchRate: 4,
      records: "1.9M / 24h",
      lastRun: "1 min ago",
      status: "Active",
    },
    {
      id: "net-asset",
      name: "Internal asset context",
      kind: "Asset / CMDB",
      reference: "servicenow_prod.cmdb.ci_network_asset",
      enrichedFields: "src_endpoint.{owner, zone}",
      matchRate: 72,
      records: "29.7M / 24h",
      lastRun: "25s ago",
      status: "Active",
    },
  ],
  "dns-activity": [
    {
      id: "dns-ti",
      name: "Malicious domain reputation",
      kind: "Threat intel",
      reference: "lakewatch.enrich.ti_domain_indicators",
      enrichedFields: "query.reputation.{score, provider}",
      matchRate: 7,
      records: "2.2M / 24h",
      lastRun: "25s ago",
      status: "Active",
    },
    {
      id: "dns-nrd",
      name: "Newly-registered domain flag",
      kind: "WHOIS",
      reference: "lakewatch.enrich.whois_domain_age",
      enrichedFields: "query.hostname_age_days, is_newly_registered",
      matchRate: 83,
      records: "26.6M / 24h",
      lastRun: "30s ago",
      status: "Active",
    },
    {
      id: "dns-dga",
      name: "DGA / algorithmic domain score",
      kind: "ML model",
      reference: "lakewatch.ml.dns_dga_classifier_v4",
      enrichedFields: "query.dga_score, risk_level",
      matchRate: 100,
      records: "32.1M / 24h",
      lastRun: "25s ago",
      status: "Active",
    },
    {
      id: "dns-geoip",
      name: "Resolved answer geolocation",
      kind: "GeoIP",
      reference: "lakewatch.enrich.maxmind_geoip2_city",
      enrichedFields: "answers[].location.country",
      matchRate: 88,
      records: "28.4M / 24h",
      lastRun: "20s ago",
      status: "Draft",
    },
  ],
  "detection-finding": [
    {
      id: "find-mitre",
      name: "MITRE ATT&CK mapping",
      kind: "ML model",
      reference: "lakewatch.enrich.mitre_attack_catalog",
      enrichedFields: "finding_info.attacks[].{tactic, technique}",
      matchRate: 92,
      records: "3,658 / 24h",
      lastRun: "6 min ago",
      status: "Active",
    },
    {
      id: "find-asset",
      name: "Affected-asset criticality",
      kind: "Asset / CMDB",
      reference: "servicenow_prod.cmdb.ci_asset",
      enrichedFields: "resources[].criticality, resources[].owner",
      matchRate: 88,
      records: "3,499 / 24h",
      lastRun: "6 min ago",
      status: "Active",
    },
    {
      id: "find-identity",
      name: "Impacted-user risk context",
      kind: "Identity",
      reference: "lakewatch.enrich.user_risk_scores",
      enrichedFields: "evidences[].actor.user.risk_level",
      matchRate: 74,
      records: "2,941 / 24h",
      lastRun: "8 min ago",
      status: "Active",
    },
    {
      id: "find-ti",
      name: "Indicator threat-intel correlation",
      kind: "Threat intel",
      reference: "lakewatch.enrich.ti_indicators_all",
      enrichedFields: "finding_info.related_iocs[].provider",
      matchRate: 34,
      records: "1,352 / 24h",
      lastRun: "6 min ago",
      status: "Active",
    },
  ],
}

export function getEnrichments(id: string): Enrichment[] {
  return MODEL_ENRICHMENTS[id] ?? []
}
