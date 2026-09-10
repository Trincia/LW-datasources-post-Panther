// Marketplace → Detection rules catalog (mock).
// Each rule is mapped to the parser whose parsed events it evaluates, so the
// "Associated parser" column is realistic (e.g. AWS CloudTrail rules → AWS.CloudTrail).

export type DetectionSeverity = "Critical" | "High" | "Medium" | "Low" | "Informational"

export type DetectionRule = {
  name: string
  /** Parser this rule evaluates events from. */
  parser: string
  severity: DetectionSeverity
  tactic: string
  technique: string
  techniqueId: string
  pack: string
}

// Realistic datasource instance name that would produce each parser's events.
const PARSER_DATASOURCE: Record<string, string> = {
  "Databricks.Audit": "databricks-audit-prod",
  "Okta.SystemLog": "okta-corp",
  "AWS.CloudTrail": "aws-cloudtrail-org",
  "AWS.GuardDuty": "aws-guardduty-prod",
  "AWS.VPCFlow": "aws-vpcflow-prod",
  "AzureAD.SignInLogs": "entra-signin-logs",
  "GCP.AuditLog": "gcp-audit-org",
  "GitHub.AuditLog": "github-enterprise",
  "Kubernetes.Audit": "eks-audit-prod",
  "Slack.AuditLogs": "slack-enterprise",
}

// Rules where more than one datasource in the workspace produces the parser,
// so the user must choose which datasource to assign the rule to on import.
const MULTI_DATASOURCE: Record<string, string[]> = {
  aws_cloudtrail_logging_disabled: ["aws-cloudtrail-org", "aws-cloudtrail-security"],
  okta_mfa_deactivated: ["okta-corp", "okta-workforce"],
  aws_iam_access_key_created: ["aws-cloudtrail-org", "aws-cloudtrail-payer"],
}

/**
 * Connected datasources for a rule's parser. Returns an empty array when no
 * datasource is wired to the parser, one for the common case, or two for the
 * handful of rules whose parser is produced by multiple datasources.
 */
export function connectedDatasources(rule: DetectionRule): string[] {
  if (MULTI_DATASOURCE[rule.name]) return MULTI_DATASOURCE[rule.name]
  let hash = 0
  for (const char of rule.name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  if (hash % 5 === 0) return []
  const single = PARSER_DATASOURCE[rule.parser]
  return single ? [single] : []
}

/** A subset of catalog rules that are already imported into this workspace. */
export function isInstalledInWorkspace(rule: DetectionRule): boolean {
  if (connectedDatasources(rule).length === 0) return false
  let hash = 0
  for (const char of rule.name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash % 4 === 0
}

// ---------------------------------------------------------------------------
// Rule detail (drawer content), derived accurately from each rule's fields.
// ---------------------------------------------------------------------------

export type DetectionRuleDetail = {
  comment: string
  objective: string
  fidelity: "High" | "Medium" | "Low"
  category: string
  sql: string
  summary: string
  schedule: string
}

// Parsed table + key fields each parser's events land in.
const PARSER_SOURCE: Record<
  string,
  { table: string; dateField: string; actorField: string; actionField: string }
> = {
  "Databricks.Audit": {
    table: "system.access.audit",
    dateField: "event_date",
    actorField: "user_identity.email",
    actionField: "action_name",
  },
  "Okta.SystemLog": {
    table: "okta.system_log",
    dateField: "event_date",
    actorField: "actor.alternate_id",
    actionField: "event_type",
  },
  "AWS.CloudTrail": {
    table: "aws.cloudtrail",
    dateField: "event_date",
    actorField: "user_identity.arn",
    actionField: "event_name",
  },
  "AWS.GuardDuty": {
    table: "aws.guardduty_findings",
    dateField: "event_date",
    actorField: "resource.access_key_details.principal_id",
    actionField: "type",
  },
  "AWS.VPCFlow": {
    table: "aws.vpc_flow",
    dateField: "event_date",
    actorField: "srcaddr",
    actionField: "action",
  },
  "AzureAD.SignInLogs": {
    table: "azure_ad.signin_logs",
    dateField: "event_date",
    actorField: "user_principal_name",
    actionField: "operation_name",
  },
  "GCP.AuditLog": {
    table: "gcp.audit_log",
    dateField: "event_date",
    actorField: "authentication_info.principal_email",
    actionField: "method_name",
  },
  "GitHub.AuditLog": {
    table: "github.audit_log",
    dateField: "event_date",
    actorField: "actor",
    actionField: "action",
  },
  "Kubernetes.Audit": {
    table: "kubernetes.audit",
    dateField: "event_date",
    actorField: "user.username",
    actionField: "verb",
  },
  "Slack.AuditLogs": {
    table: "slack.audit_logs",
    dateField: "event_date",
    actorField: "actor.user.email",
    actionField: "action",
  },
}

// Vendor prefixes stripped when deriving the human-readable signal.
const VENDOR_PREFIXES = new Set([
  "aws",
  "okta",
  "gcp",
  "entra",
  "github",
  "slack",
  "k8s",
  "azuread",
])

const ACRONYMS: Record<string, string> = {
  acl: "ACL",
  acls: "ACLs",
  aws: "AWS",
  iam: "IAM",
  mfa: "MFA",
  k8s: "Kubernetes",
  gcp: "GCP",
  ec2: "EC2",
  ebs: "EBS",
  eks: "EKS",
  vpc: "VPC",
  s3: "S3",
  ip: "IP",
  sql: "SQL",
  api: "API",
}

function humanize(name: string): string {
  return name
    .split("_")
    .map((token) => ACRONYMS[token] ?? token)
    .join(" ")
}

function signalTokens(rule: DetectionRule): string[] {
  const tokens = rule.name.split("_")
  if (tokens.length > 1 && VENDOR_PREFIXES.has(tokens[0])) return tokens.slice(1)
  return tokens
}

function categoryFor(rule: DetectionRule): string {
  const n = rule.name
  if (/bruteforce|impossible_travel|enumeration|port_scan|allowlist/.test(n)) return "Correlation"
  if (/anomalous|abuse|cryptomining/.test(n)) return "Anomaly"
  if (/disabled|modified|deleted|change|created|enabled|attached|assigned/.test(n))
    return "Static Signature"
  return "Static Signature"
}

function fidelityFor(rule: DetectionRule): DetectionRuleDetail["fidelity"] {
  let hash = 0
  for (const char of rule.name) hash = (hash * 17 + char.charCodeAt(0)) >>> 0
  return (["High", "Medium", "Low"] as const)[hash % 3]
}

function scheduleFor(rule: DetectionRule): string {
  switch (rule.severity) {
    case "Critical":
      return "1h"
    case "High":
      return "12h"
    case "Medium":
      return "12h"
    case "Low":
      return "24h"
    default:
      return "24h"
  }
}

// Hand-authored SQL for rules where accuracy matters most; others generate below.
const SQL_OVERRIDES: Record<string, string> = {
  acl_controls_disabled: `FROM system.access.audit
|> WHERE
  event_date >= current_date
  AND service_name = 'accounts'
  AND action_name IN ('disableWorkspaceAcls',
    'disableClusterAcls', 'disableTableAcls')
|> SELECT *`,
}

function generateSql(rule: DetectionRule): string {
  if (SQL_OVERRIDES[rule.name]) return SQL_OVERRIDES[rule.name]
  const src = PARSER_SOURCE[rule.parser]
  if (!src) {
    return `FROM ${rule.parser.toLowerCase()}\n|> WHERE\n  event_date >= current_date\n|> SELECT *`
  }
  const keyword = signalTokens(rule).slice(-2).join("_")
  return `FROM ${src.table}
|> WHERE
  ${src.dateField} >= current_date
  AND ${src.actionField} ILIKE '%${keyword}%'
|> SELECT *`
}

function summaryFor(rule: DetectionRule): string {
  const src = PARSER_SOURCE[rule.parser]
  const actor = src ? `{${src.actorField}}` : "{actor}"
  const action = src ? `{${src.actionField}}` : "{action}"
  return `${humanize(rule.name)}: ${action} by ${actor}`
}

const DETAIL_OVERRIDES: Record<string, Partial<DetectionRuleDetail>> = {
  acl_controls_disabled: {
    comment:
      "Detects when access control lists are disabled at the workspace, cluster, or table level, removing authorization barriers across the environment",
    objective:
      "Detect when access control lists are disabled at the workspace, cluster, or table level. Disabling ACLs removes authorization barriers and effectively grants unrestricted access to resources. This is rare in normal operations and a strong signal of security control weakening.",
    summary: "ACL controls disabled: {action_name} by {user_identity.email}",
  },
}

export function getRuleDetail(rule: DetectionRule): DetectionRuleDetail {
  const signal = humanize(rule.name).toLowerCase()
  const hasMitre = Boolean(rule.tactic && rule.technique)
  const comment = `Detects ${signal} in ${rule.parser} events, indicating a potential security-relevant change or adversary action.`
  const objective = hasMitre
    ? `Identify ${signal} by evaluating ${rule.parser} events. This behavior maps to the ${rule.tactic} tactic via ${rule.technique} (${rule.techniqueId}) and can indicate weakening of security controls or active adversary activity.`
    : `Identify ${signal} by evaluating ${rule.parser} events. Surfaced findings should be triaged for weakening of security controls or active adversary activity.`

  return {
    comment,
    objective,
    fidelity: fidelityFor(rule),
    category: categoryFor(rule),
    sql: generateSql(rule),
    summary: summaryFor(rule),
    schedule: scheduleFor(rule),
    ...DETAIL_OVERRIDES[rule.name],
  }
}

export const DETECTION_RULES: DetectionRule[] = [
  {
    name: "acl_controls_disabled",
    parser: "Databricks.Audit",
    severity: "High",
    tactic: "Defense Evasion",
    technique: "Impair Defenses",
    techniqueId: "T1562",
    pack: "Databricks Audit Intelligence",
  },
  {
    name: "anomalous_user_agent_change",
    parser: "Okta.SystemLog",
    severity: "Medium",
    tactic: "Initial Access",
    technique: "Valid Accounts",
    techniqueId: "T1078",
    pack: "Initial Access Behavior Detections",
  },
  {
    name: "attempted_login_from_denied_ip",
    parser: "Databricks.Audit",
    severity: "Informational",
    tactic: "Initial Access",
    technique: "Valid Accounts",
    techniqueId: "T1078",
    pack: "Databricks Audit Intelligence",
  },
  {
    name: "aws_bedrock_model_abuse",
    parser: "AWS.CloudTrail",
    severity: "Medium",
    tactic: "Impact",
    technique: "Resource Hijacking",
    techniqueId: "T1496",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_cloudtrail_logging_disabled",
    parser: "AWS.CloudTrail",
    severity: "High",
    tactic: "Defense Evasion",
    technique: "Impair Defenses",
    techniqueId: "T1562",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_cloudtrail_logging_modified",
    parser: "AWS.CloudTrail",
    severity: "Medium",
    tactic: "Defense Evasion",
    technique: "Impair Defenses",
    techniqueId: "T1562",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_config_recording_disabled",
    parser: "AWS.CloudTrail",
    severity: "High",
    tactic: "Defense Evasion",
    technique: "Impair Defenses",
    techniqueId: "T1562",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_console_login_bruteforce",
    parser: "AWS.CloudTrail",
    severity: "Medium",
    tactic: "Credential Access",
    technique: "Brute Force",
    techniqueId: "T1110",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_cryptomining_instance_launch",
    parser: "AWS.CloudTrail",
    severity: "Medium",
    tactic: "Impact",
    technique: "Resource Hijacking",
    techniqueId: "T1496",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_ebs_snapshot_shared_external",
    parser: "AWS.CloudTrail",
    severity: "High",
    tactic: "Exfiltration",
    technique: "Transfer Data to Cloud Account",
    techniqueId: "T1537",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_ec2_startup_script_change",
    parser: "AWS.CloudTrail",
    severity: "High",
    tactic: "Persistence",
    technique: "Boot or Logon Initialization Scripts",
    techniqueId: "T1037",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_eks_public_endpoint",
    parser: "AWS.CloudTrail",
    severity: "High",
    tactic: "Initial Access",
    technique: "Exploit Public-Facing Application",
    techniqueId: "T1190",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_guardduty_disabled",
    parser: "AWS.CloudTrail",
    severity: "High",
    tactic: "Defense Evasion",
    technique: "Impair Defenses",
    techniqueId: "T1562",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_guardduty_high_severity_finding",
    parser: "AWS.GuardDuty",
    severity: "High",
    tactic: "",
    technique: "",
    techniqueId: "",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_guardduty_ip_allowlist_created",
    parser: "AWS.CloudTrail",
    severity: "High",
    tactic: "Defense Evasion",
    technique: "Impair Defenses",
    techniqueId: "T1562",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_guardduty_settings_modified",
    parser: "AWS.CloudTrail",
    severity: "Medium",
    tactic: "Defense Evasion",
    technique: "Impair Defenses",
    techniqueId: "T1562",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_iam_access_key_created",
    parser: "AWS.CloudTrail",
    severity: "High",
    tactic: "Persistence",
    technique: "Account Manipulation",
    techniqueId: "T1098",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_iam_account_enumeration",
    parser: "AWS.CloudTrail",
    severity: "Medium",
    tactic: "Discovery",
    technique: "Account Discovery",
    techniqueId: "T1087",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_iam_identity_provider_changed",
    parser: "AWS.CloudTrail",
    severity: "Medium",
    tactic: "Persistence",
    technique: "Modify Authentication Process",
    techniqueId: "T1556",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_iam_privesc_policy_attached",
    parser: "AWS.CloudTrail",
    severity: "High",
    tactic: "Privilege Escalation",
    technique: "Account Manipulation",
    techniqueId: "T1098",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_vpc_flow_port_scan",
    parser: "AWS.VPCFlow",
    severity: "Medium",
    tactic: "Discovery",
    technique: "Network Service Discovery",
    techniqueId: "T1046",
    pack: "Amazon Web Services",
  },
  {
    name: "aws_s3_public_bucket_policy",
    parser: "AWS.CloudTrail",
    severity: "High",
    tactic: "Exfiltration",
    technique: "Transfer Data to Cloud Account",
    techniqueId: "T1537",
    pack: "Amazon Web Services",
  },
  {
    name: "okta_mfa_deactivated",
    parser: "Okta.SystemLog",
    severity: "High",
    tactic: "Defense Evasion",
    technique: "Impair Defenses",
    techniqueId: "T1562",
    pack: "Okta Identity",
  },
  {
    name: "okta_admin_role_assigned",
    parser: "Okta.SystemLog",
    severity: "Medium",
    tactic: "Privilege Escalation",
    technique: "Account Manipulation",
    techniqueId: "T1098",
    pack: "Okta Identity",
  },
  {
    name: "okta_impossible_travel",
    parser: "Okta.SystemLog",
    severity: "High",
    tactic: "Initial Access",
    technique: "Valid Accounts",
    techniqueId: "T1078",
    pack: "Okta Identity",
  },
  {
    name: "entra_conditional_access_modified",
    parser: "AzureAD.SignInLogs",
    severity: "High",
    tactic: "Defense Evasion",
    technique: "Impair Defenses",
    techniqueId: "T1562",
    pack: "Microsoft Entra ID",
  },
  {
    name: "entra_legacy_auth_success",
    parser: "AzureAD.SignInLogs",
    severity: "Medium",
    tactic: "Initial Access",
    technique: "Valid Accounts",
    techniqueId: "T1078",
    pack: "Microsoft Entra ID",
  },
  {
    name: "gcp_service_account_key_created",
    parser: "GCP.AuditLog",
    severity: "Medium",
    tactic: "Persistence",
    technique: "Account Manipulation",
    techniqueId: "T1098",
    pack: "Google Cloud Platform",
  },
  {
    name: "gcp_firewall_rule_deleted",
    parser: "GCP.AuditLog",
    severity: "Medium",
    tactic: "Defense Evasion",
    technique: "Impair Defenses",
    techniqueId: "T1562",
    pack: "Google Cloud Platform",
  },
  {
    name: "github_org_member_removed",
    parser: "GitHub.AuditLog",
    severity: "Low",
    tactic: "Impact",
    technique: "Account Access Removal",
    techniqueId: "T1531",
    pack: "GitHub",
  },
  {
    name: "github_branch_protection_disabled",
    parser: "GitHub.AuditLog",
    severity: "High",
    tactic: "Defense Evasion",
    technique: "Impair Defenses",
    techniqueId: "T1562",
    pack: "GitHub",
  },
  {
    name: "k8s_privileged_pod_created",
    parser: "Kubernetes.Audit",
    severity: "High",
    tactic: "Privilege Escalation",
    technique: "Escape to Host",
    techniqueId: "T1611",
    pack: "Kubernetes",
  },
  {
    name: "slack_admin_role_change",
    parser: "Slack.AuditLogs",
    severity: "Medium",
    tactic: "Privilege Escalation",
    technique: "Account Manipulation",
    techniqueId: "T1098",
    pack: "Slack",
  },
  {
    name: "slack_data_export_enabled",
    parser: "Slack.AuditLogs",
    severity: "High",
    tactic: "Collection",
    technique: "Data from Information Repositories",
    techniqueId: "T1213",
    pack: "Slack",
  },
]
