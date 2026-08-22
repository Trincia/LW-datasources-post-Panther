export type DatasourceSchemaRow = { path: string; schema: string }

export const DATASOURCE_SCHEMAS: readonly DatasourceSchemaRow[] = [
  {
    path: "s3://audit-logs-7830bcf/vpc-",
    schema: "AWS.VPCFlow",
  },
  {
    path: "s3://audit-logs-7830bcf/AWSLogs/2960625/elasticloadbalancing",
    schema: "AWS.ALB",
  },
  {
    path: "s3://audit-logs-7830bcf/",
    schema: "AWS.S3ServerAccess",
  },
  {
    path: "s3://audit-logs-7830bcf/AWSLogs/2960625/CloudTrail",
    schema: "AWS.CloudTrail",
  },
] as const

export const DESTINATION_TABLES: Record<string, string[]> = {
  "AWS.VPCFlow": ["lakewatch.default.aws_vpcflow"],
  "AWS.ALB": ["lakewatch.default.aws_alb"],
  "AWS.S3ServerAccess": ["lakewatch.default.aws_s3serveraccess"],
  "AWS.CloudTrail": ["lakewatch.default.aws_cloudtrail"],
}

/** Slugifies a parser name into a Unity Catalog table name segment. */
export function toTableName(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "parser"
  )
}

// The built-in parsers surfaced by an API connector, mirroring the cards shown
// on the connector's "Parsers" step (Audit Logs / Access Logs / Events).
export const CONNECTOR_PARSER_SUFFIXES = ["Audit Logs", "Access Logs", "Events"] as const

export function buildConnectorSchemas(family: string): DatasourceSchemaRow[] {
  return CONNECTOR_PARSER_SUFFIXES.map((suffix) => ({
    schema: `${family} ${suffix}`,
    path: "",
  }))
}

export function buildConnectorDestinations(family: string): Record<string, string[]> {
  const tables: Record<string, string[]> = {}
  for (const suffix of CONNECTOR_PARSER_SUFFIXES) {
    const name = `${family} ${suffix}`
    tables[name] = [`lakewatch.default.${toTableName(name)}`]
  }
  return tables
}
