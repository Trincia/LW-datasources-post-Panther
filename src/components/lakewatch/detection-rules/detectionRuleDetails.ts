import {
  DETECTION_RULES_LIST,
  type DetectionRuleListItem,
} from "@/components/lakewatch/detection-rules/detectionRulesList"

export type DetectionRuleDetail = DetectionRuleListItem & {
  catalog: string
  schema: string
  runAs: string
  sourceTable: string
  query: string
  mitreTactic: string
  mitreTechnique: string
  mitreSubtechnique: string
  summary: string
  objective: string
  scheduleMinutes: number
  jobGrouping: "Dedicated" | "Shared"
  performance: "Standard" | "Performance optimized"
  signals24h: number
  signals7d: number
  lastTriggered: string
}

type RuleMetadata = Pick<
  DetectionRuleDetail,
  | "sourceTable"
  | "query"
  | "mitreTactic"
  | "mitreTechnique"
  | "mitreSubtechnique"
  | "summary"
  | "objective"
  | "scheduleMinutes"
  | "signals24h"
  | "signals7d"
  | "lastTriggered"
>

const METADATA: Record<string, RuleMetadata> = {
  "unauthorized-s3-bucket-access": {
    sourceTable: "lakewatch.default.aws_cloudtrail",
    query: `SELECT event_time, user_identity_arn, request_parameters, source_ip_address
FROM lakewatch.default.aws_cloudtrail
WHERE event_name IN ('PutBucketPolicy', 'PutBucketAcl')
  AND lakewatch.is_s3_policy_public(request_parameters) = true`,
    mitreTactic: "Exfiltration",
    mitreTechnique: "Exfiltration Over Web Service",
    mitreSubtechnique: "Exfiltration to Cloud Storage",
    summary: "Public access enabled for S3 bucket {{request_parameters.bucketName}}",
    objective: "Identify S3 policy changes that expose production data to unauthenticated users.",
    scheduleMinutes: 5,
    signals24h: 3,
    signals7d: 11,
    lastTriggered: "18 minutes ago",
  },
  "excessive-okta-login-failures": {
    sourceTable: "lakewatch.default.okta_system_log",
    query: `SELECT actor_alternate_id, client_ip_address, COUNT(*) AS failed_attempts
FROM lakewatch.default.okta_system_log
WHERE event_type = 'user.session.start' AND outcome_result = 'FAILURE'
  AND event_time >= current_timestamp() - INTERVAL 5 MINUTES
GROUP BY actor_alternate_id, client_ip_address
HAVING COUNT(*) > 10`,
    mitreTactic: "Credential Access",
    mitreTechnique: "Brute Force",
    mitreSubtechnique: "Password Guessing",
    summary: "Excessive Okta login failures for {{actor_alternate_id}}",
    objective: "Surface likely password-guessing activity before an account is compromised.",
    scheduleMinutes: 5,
    signals24h: 14,
    signals7d: 86,
    lastTriggered: "7 minutes ago",
  },
  "massive-data-export-external-ip": {
    sourceTable: "lakewatch.default.aws_vpc_flow",
    query: `SELECT srcaddr, dstaddr, SUM(bytes) AS bytes_transferred
FROM lakewatch.default.aws_vpc_flow
WHERE action = 'ACCEPT' AND NOT lakewatch.is_corporate_cidr(dstaddr)
  AND event_time >= current_timestamp() - INTERVAL 15 MINUTES
GROUP BY srcaddr, dstaddr
HAVING SUM(bytes) > 5000000000`,
    mitreTactic: "Exfiltration",
    mitreTechnique: "Exfiltration Over Alternative Protocol",
    mitreSubtechnique: "Exfiltration Over Asymmetric Encrypted Non-C2 Protocol",
    summary: "Large outbound transfer from {{srcaddr}} to {{dstaddr}}",
    objective: "Detect high-volume transfers from protected networks to untrusted destinations.",
    scheduleMinutes: 15,
    signals24h: 1,
    signals7d: 4,
    lastTriggered: "2 hours ago",
  },
  "new-admin-role-assigned": {
    sourceTable: "lakewatch.default.databricks_audit",
    query: `SELECT event_time, user_identity.email, request_params, source_ip_address
FROM lakewatch.default.databricks_audit
WHERE service_name = 'accounts' AND action_name = 'addPrincipalToGroup'
  AND request_params.group_name IN ('admins', 'account admins')`,
    mitreTactic: "Persistence",
    mitreTechnique: "Account Manipulation",
    mitreSubtechnique: "Additional Cloud Roles",
    summary: "Administrative role assigned to {{request_params.principal}}",
    objective: "Monitor changes that grant persistent administrative access to Databricks.",
    scheduleMinutes: 10,
    signals24h: 2,
    signals7d: 7,
    lastTriggered: "4 hours ago",
  },
  "mfa-deactivated": {
    sourceTable: "lakewatch.default.okta_system_log",
    query: `SELECT event_time, actor_alternate_id, target, client_ip_address
FROM lakewatch.default.okta_system_log
WHERE event_type IN ('user.mfa.factor.deactivate', 'policy.rule.deactivate')
  AND outcome_result = 'SUCCESS'`,
    mitreTactic: "Defense Evasion",
    mitreTechnique: "Impair Defenses",
    mitreSubtechnique: "Disable or Modify Tools",
    summary: "MFA protection removed for {{target.display_name}}",
    objective: "Alert when identity safeguards are removed from a user or authentication policy.",
    scheduleMinutes: 5,
    signals24h: 4,
    signals7d: 19,
    lastTriggered: "42 minutes ago",
  },
  "cloudtrail-logging-disabled": {
    sourceTable: "lakewatch.default.aws_cloudtrail",
    query: `SELECT event_time, user_identity_arn, event_name, source_ip_address
FROM lakewatch.default.aws_cloudtrail
WHERE event_source = 'cloudtrail.amazonaws.com'
  AND event_name IN ('StopLogging', 'DeleteTrail', 'UpdateTrail')`,
    mitreTactic: "Defense Evasion",
    mitreTechnique: "Impair Defenses",
    mitreSubtechnique: "Disable Cloud Logs",
    summary: "CloudTrail logging changed by {{user_identity_arn}}",
    objective: "Detect attempts to remove audit visibility in production AWS accounts.",
    scheduleMinutes: 5,
    signals24h: 0,
    signals7d: 2,
    lastTriggered: "3 days ago",
  },
  "impossible-travel-login": {
    sourceTable: "lakewatch.default.azure_ad_signin",
    query: `SELECT user_principal_name, event_time, ip_address, location
FROM lakewatch.default.azure_ad_signin
QUALIFY lakewatch.travel_velocity_kph(
  LAG(location) OVER (PARTITION BY user_principal_name ORDER BY event_time),
  location, LAG(event_time) OVER (PARTITION BY user_principal_name ORDER BY event_time),
  event_time) > 900`,
    mitreTactic: "Initial Access",
    mitreTechnique: "Valid Accounts",
    mitreSubtechnique: "Cloud Accounts",
    summary: "Impossible travel detected for {{user_principal_name}}",
    objective: "Find geographically implausible sign-in sequences that indicate credential theft.",
    scheduleMinutes: 15,
    signals24h: 8,
    signals7d: 37,
    lastTriggered: "29 minutes ago",
  },
  "gcp-service-account-key-created": {
    sourceTable: "lakewatch.default.gcp_audit",
    query: `SELECT timestamp, authentication_info.principal_email, resource_name, caller_ip
FROM lakewatch.default.gcp_audit
WHERE method_name = 'google.iam.admin.v1.CreateServiceAccountKey'
  AND lakewatch.is_production_project(resource_name)`,
    mitreTactic: "Credential Access",
    mitreTechnique: "Steal Application Access Token",
    mitreSubtechnique: "Cloud Service Dashboard",
    summary: "New key created for service account {{resource_name}}",
    objective: "Track long-lived credentials created for service accounts in production projects.",
    scheduleMinutes: 10,
    signals24h: 0,
    signals7d: 3,
    lastTriggered: "Sep 1, 2026 at 09:42",
  },
  "github-org-owner-added": {
    sourceTable: "lakewatch.default.github_audit",
    query: `SELECT created_at, actor, user, actor_ip, org
FROM lakewatch.default.github_audit
WHERE action IN ('org.add_member', 'org.update_member')
  AND permission = 'admin'`,
    mitreTactic: "Persistence",
    mitreTechnique: "Account Manipulation",
    mitreSubtechnique: "Additional Cloud Roles",
    summary: "{{user}} added as an owner of GitHub organization {{org}}",
    objective: "Detect high-impact membership changes in source-code organizations.",
    scheduleMinutes: 15,
    signals24h: 1,
    signals7d: 2,
    lastTriggered: "11 hours ago",
  },
  "k8s-privileged-pod-created": {
    sourceTable: "lakewatch.default.kubernetes_audit",
    query: `SELECT event_time, user_username, object_ref.namespace, object_ref.name, request_object
FROM lakewatch.default.kubernetes_audit
WHERE verb = 'create' AND object_ref.resource = 'pods'
  AND EXISTS(request_object.spec.containers, c -> c.securityContext.privileged = true)`,
    mitreTactic: "Privilege Escalation",
    mitreTechnique: "Escape to Host",
    mitreSubtechnique: "Privileged Container",
    summary: "Privileged pod {{object_ref.name}} created in {{object_ref.namespace}}",
    objective: "Detect workloads capable of bypassing container isolation on production clusters.",
    scheduleMinutes: 5,
    signals24h: 6,
    signals7d: 28,
    lastTriggered: "13 minutes ago",
  },
  "slack-token-exfiltration": {
    sourceTable: "lakewatch.default.slack_audit",
    query: `SELECT date_create, actor_user_email, action, entity, context_ip_address
FROM lakewatch.default.slack_audit
WHERE action IN ('tokens_revoked', 'workspace_export_started', 'app_scopes_updated')
  AND lakewatch.contains_sensitive_scope(entity)`,
    mitreTactic: "Exfiltration",
    mitreTechnique: "Exfiltration Over Web Service",
    mitreSubtechnique: "Exfiltration to SaaS",
    summary: "Potential Slack credential export by {{actor_user_email}}",
    objective: "Identify activity that may expose Slack tokens or sensitive workspace exports.",
    scheduleMinutes: 30,
    signals24h: 0,
    signals7d: 1,
    lastTriggered: "Aug 30, 2026 at 14:06",
  },
  "guardduty-high-severity-finding": {
    sourceTable: "lakewatch.default.aws_guardduty",
    query: `SELECT updated_at, account_id, region, finding_type, severity, resource
FROM lakewatch.default.aws_guardduty
WHERE severity >= 7 AND service.archived = false`,
    mitreTactic: "Initial Access",
    mitreTechnique: "External Remote Services",
    mitreSubtechnique: "Cloud Services",
    summary: "High-severity GuardDuty finding: {{finding_type}}",
    objective: "Route high-confidence AWS threat findings into a consistent SOC triage workflow.",
    scheduleMinutes: 5,
    signals24h: 9,
    signals7d: 44,
    lastTriggered: "5 minutes ago",
  },
}

export const DETECTION_RULE_DETAILS: DetectionRuleDetail[] = DETECTION_RULES_LIST.map(
  (rule) => ({
    ...rule,
    catalog: "lakewatch_ui_v2",
    schema: "default",
    runAs: "Beau Trincia",
    jobGrouping: "Dedicated",
    performance: "Standard",
    ...METADATA[rule.id],
  })
)

export function getDetectionRule(ruleId: string | undefined) {
  return DETECTION_RULE_DETAILS.find((rule) => rule.id === ruleId)
}
