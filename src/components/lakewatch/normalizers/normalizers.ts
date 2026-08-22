export type NormalizerRow = {
  identifier: string
  displayName: string
  sourceParser: string
  targetEventClass: string
  type: "built-in" | "custom"
  latestVersion: string
  creator: "Databricks" | "You"
}

export const NORMALIZERS: NormalizerRow[] = [
  {
    identifier: "aws_cloudtrail_to_ocsf_api_activity",
    displayName: "AWS CloudTrail → OCSF API Activity",
    sourceParser: "AWS CloudTrail",
    targetEventClass: "API Activity (Class 6003)",
    type: "built-in",
    latestVersion: "Aug 6, 2026, 9:00 AM",
    creator: "Databricks",
  },
  {
    identifier: "aws_cloudtrail_to_ocsf_authentication",
    displayName: "AWS CloudTrail → OCSF Authentication",
    sourceParser: "AWS CloudTrail",
    targetEventClass: "Authentication (Class 3002)",
    type: "built-in",
    latestVersion: "Aug 4, 2026, 2:18 PM",
    creator: "Databricks",
  },
  {
    identifier: "okta_systemlog_to_ocsf_authentication",
    displayName: "Okta System Log → OCSF Authentication",
    sourceParser: "Okta System Log",
    targetEventClass: "Authentication (Class 3002)",
    type: "built-in",
    latestVersion: "Jul 29, 2026, 11:42 AM",
    creator: "Databricks",
  },
  {
    identifier: "crowdstrike_fdr_to_ocsf_process_activity",
    displayName: "CrowdStrike FDR → OCSF Process Activity",
    sourceParser: "CrowdStrike FDR Process",
    targetEventClass: "Process Activity (Class 1007)",
    type: "custom",
    latestVersion: "Aug 18, 2026, 4:05 PM",
    creator: "You",
  },
]
