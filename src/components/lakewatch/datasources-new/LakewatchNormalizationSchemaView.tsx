"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { MoreHorizontal, X } from "lucide-react"

import {
  BranchIcon,
  CatalogIcon,
  ChevronDownIcon,
  CodeIcon,
} from "@/components/icons"
import { LakewatchWarehouseSelector } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"

type PreviewValue = string | number | null
type PreviewEvent = Record<string, PreviewValue>

type NormalizationSchemaDefinition = {
  title: string
  previewName: string
  events: PreviewEvent[]
}

type NormalizationField = {
  name: string
  type: "string" | "bigint" | "double"
  description: string
  indicator?: string
}

const NORMALIZATION_SCHEMA_DATA: Record<string, NormalizationSchemaDefinition> = {
  "Schematized_AWS.VPCFlow": {
    title: "AWS.VPCFlow",
    previewName: "vpc_flow_events_schematized_4",
    events: [
      {
        version: 2,
        account_id: "296062572198",
        interface_id: "eni-0a12bc34de56f7890",
        srcaddr: "10.0.1.24",
        dstaddr: "52.95.128.17",
        srcport: 49152,
        dstport: 443,
        protocol: 6,
        packets: 18,
        bytes: 14268,
        action: "ACCEPT",
        log_status: "OK",
      },
      {
        version: 2,
        account_id: "296062572198",
        interface_id: "eni-0a12bc34de56f7890",
        srcaddr: "10.0.2.61",
        dstaddr: "10.0.8.19",
        srcport: 53214,
        dstport: 5432,
        protocol: 6,
        packets: 42,
        bytes: 31540,
        action: "ACCEPT",
        log_status: "OK",
      },
      {
        version: 2,
        account_id: "296062572198",
        interface_id: "eni-04fb12a76cc8e2104",
        srcaddr: "198.51.100.42",
        dstaddr: "10.0.3.12",
        srcport: 60124,
        dstport: 22,
        protocol: 6,
        packets: 3,
        bytes: 180,
        action: "REJECT",
        log_status: "OK",
      },
      {
        version: 2,
        account_id: "296062572198",
        interface_id: "eni-078d91e22a9100ab3",
        srcaddr: "10.0.4.8",
        dstaddr: "169.254.169.254",
        srcport: 39012,
        dstport: 80,
        protocol: 6,
        packets: 8,
        bytes: 3276,
        action: "ACCEPT",
        log_status: "OK",
      },
    ],
  },
  "Schematized_AWS.ALB": {
    title: "AWS.ALB",
    previewName: "alb_access_events_schematized_4",
    events: [
      {
        type: "https",
        time: "2026-07-28T04:25:11.102Z",
        elb: "app/prod-api/50dc6c495c0c9188",
        client_ip: "203.0.113.18",
        client_port: 54231,
        target_ip: "10.0.3.41",
        target_port: 8080,
        request_processing_time: 0.001,
        target_processing_time: 0.032,
        response_processing_time: 0.001,
        elb_status_code: 200,
        target_status_code: 200,
        received_bytes: 842,
        sent_bytes: 2841,
        request: "POST https://api.acme.internal:443/v1/auth/token HTTP/1.1",
      },
      {
        type: "https",
        time: "2026-07-28T04:25:09.847Z",
        elb: "app/prod-api/50dc6c495c0c9188",
        client_ip: "198.51.100.72",
        client_port: 49318,
        target_ip: "10.0.3.57",
        target_port: 8080,
        request_processing_time: 0.002,
        target_processing_time: 0.018,
        response_processing_time: 0.001,
        elb_status_code: 200,
        target_status_code: 200,
        received_bytes: 516,
        sent_bytes: 1284,
        request: "GET https://api.acme.internal:443/v1/session HTTP/1.1",
      },
      {
        type: "https",
        time: "2026-07-28T04:24:58.219Z",
        elb: "app/prod-api/50dc6c495c0c9188",
        client_ip: "192.0.2.34",
        client_port: 59103,
        target_ip: "10.0.3.41",
        target_port: 8080,
        request_processing_time: 0.001,
        target_processing_time: 0.004,
        response_processing_time: 0,
        elb_status_code: 401,
        target_status_code: 401,
        received_bytes: 291,
        sent_bytes: 182,
        request: "POST https://api.acme.internal:443/v1/auth/token HTTP/1.1",
      },
      {
        type: "https",
        time: "2026-07-28T04:24:51.613Z",
        elb: "app/prod-api/50dc6c495c0c9188",
        client_ip: "203.0.113.91",
        client_port: 51002,
        target_ip: "10.0.3.57",
        target_port: 8080,
        request_processing_time: 0.001,
        target_processing_time: 0.067,
        response_processing_time: 0.001,
        elb_status_code: 500,
        target_status_code: 500,
        received_bytes: 634,
        sent_bytes: 392,
        request: "POST https://api.acme.internal:443/v1/login HTTP/1.1",
      },
    ],
  },
  "Schematized_AWS.S3ServerAccess": {
    title: "AWS.S3ServerAccess",
    previewName: "s3_access_events_schematized_4",
    events: [
      {
        bucket_owner: "79a59df900b949e55d96a1e698f0ee",
        bucket: "audit-logs-7830bcf",
        time: "28/Jul/2026:04:25:17 +0000",
        remote_ip: "10.0.4.18",
        requester: "arn:aws:iam::296062572198:role/lakewatch-ingestion",
        request_id: "3E57427F3EXAMPLE",
        operation: "REST.GET.OBJECT",
        key: "AWSLogs/296062572198/CloudTrail/2026/07/28/events.json.gz",
        http_status: 200,
        bytes_sent: 184932,
        object_size: 184932,
        total_time_ms: 37,
        tls_version: "TLSv1.3",
      },
      {
        bucket_owner: "79a59df900b949e55d96a1e698f0ee",
        bucket: "audit-logs-7830bcf",
        time: "28/Jul/2026:04:25:03 +0000",
        remote_ip: "10.0.4.18",
        requester: "arn:aws:iam::296062572198:role/lakewatch-ingestion",
        request_id: "891CE47D7EXAMPLE",
        operation: "REST.HEAD.OBJECT",
        key: "AWSLogs/296062572198/vpcflow/2026/07/28/flow.log.gz",
        http_status: 200,
        bytes_sent: 0,
        object_size: 97214,
        total_time_ms: 12,
        tls_version: "TLSv1.3",
      },
      {
        bucket_owner: "79a59df900b949e55d96a1e698f0ee",
        bucket: "audit-logs-7830bcf",
        time: "28/Jul/2026:04:24:56 +0000",
        remote_ip: "198.51.100.8",
        requester: null,
        request_id: "4C91A18C2EXAMPLE",
        operation: "REST.GET.OBJECT",
        key: "AWSLogs/296062572198/elasticloadbalancing/latest.log.gz",
        http_status: 403,
        bytes_sent: 243,
        object_size: 0,
        total_time_ms: 8,
        tls_version: "TLSv1.2",
      },
      {
        bucket_owner: "79a59df900b949e55d96a1e698f0ee",
        bucket: "audit-logs-7830bcf",
        time: "28/Jul/2026:04:24:41 +0000",
        remote_ip: "10.0.4.18",
        requester: "arn:aws:iam::296062572198:role/lakewatch-ingestion",
        request_id: "A23B47D90EXAMPLE",
        operation: "REST.GET.BUCKET",
        key: null,
        http_status: 200,
        bytes_sent: 4226,
        object_size: 0,
        total_time_ms: 23,
        tls_version: "TLSv1.3",
      },
    ],
  },
}

const FALLBACK_SCHEMA = NORMALIZATION_SCHEMA_DATA["Schematized_AWS.VPCFlow"]

const NORMALIZATION_FIELDS: Record<string, NormalizationField[]> = {
  "AWS.VPCFlow": [
    {
      name: "version",
      type: "bigint",
      description:
        "The VPC Flow Logs version. The default format uses version 2; custom formats use version 3.",
    },
    {
      name: "account",
      type: "string",
      indicator: "AWS Account ID",
      description:
        "The AWS account ID for the flow log. This field is called account_id in Parquet exports.",
    },
    {
      name: "interfaceId",
      type: "string",
      description:
        "The ID of the network interface for which the traffic is recorded.",
    },
    {
      name: "srcAddr",
      type: "string",
      indicator: "IP Address",
      description: "The source address for incoming traffic.",
    },
    {
      name: "dstAddr",
      type: "string",
      indicator: "IP Address",
      description: "The destination address for outgoing traffic.",
    },
    {
      name: "srcPort",
      type: "bigint",
      description: "The source port of the traffic.",
    },
    {
      name: "dstPort",
      type: "bigint",
      description: "The destination port of the traffic.",
    },
    {
      name: "protocol",
      type: "bigint",
      description: "The IANA protocol number of the traffic.",
    },
    {
      name: "packets",
      type: "bigint",
      description: "The number of packets transferred during the flow.",
    },
    {
      name: "bytes",
      type: "bigint",
      description: "The number of bytes transferred during the flow.",
    },
    {
      name: "action",
      type: "string",
      description: "The action associated with the traffic: ACCEPT or REJECT.",
    },
    {
      name: "logStatus",
      type: "string",
      description: "The logging status reported for the flow record.",
    },
  ],
  "AWS.ALB": [
    {
      name: "type",
      type: "string",
      description: "The protocol used by the load balancer listener.",
    },
    {
      name: "time",
      type: "string",
      description: "The time the load balancer generated the response.",
    },
    {
      name: "elb",
      type: "string",
      description: "The resource ID of the Application Load Balancer.",
    },
    {
      name: "clientIp",
      type: "string",
      indicator: "IP Address",
      description: "The IP address of the requesting client.",
    },
    {
      name: "clientPort",
      type: "bigint",
      description: "The source port used by the requesting client.",
    },
    {
      name: "targetIp",
      type: "string",
      indicator: "IP Address",
      description: "The IP address of the target that handled the request.",
    },
    {
      name: "targetPort",
      type: "bigint",
      description: "The port of the target that handled the request.",
    },
    {
      name: "requestProcessingTime",
      type: "double",
      description: "Seconds from receiving the request until sending it to a target.",
    },
    {
      name: "targetProcessingTime",
      type: "double",
      description: "Seconds the target spent processing the request.",
    },
    {
      name: "responseProcessingTime",
      type: "double",
      description: "Seconds from receiving the target response until responding to the client.",
    },
    {
      name: "elbStatusCode",
      type: "bigint",
      description: "The HTTP status code returned by the load balancer.",
    },
    {
      name: "targetStatusCode",
      type: "bigint",
      description: "The HTTP status code returned by the target.",
    },
    {
      name: "receivedBytes",
      type: "bigint",
      description: "The size of the request received from the client.",
    },
    {
      name: "sentBytes",
      type: "bigint",
      description: "The size of the response sent to the client.",
    },
    {
      name: "request",
      type: "string",
      description: "The HTTP request method, URL, and protocol.",
    },
  ],
  "AWS.S3ServerAccess": [
    {
      name: "bucketOwner",
      type: "string",
      indicator: "AWS Account ID",
      description: "The canonical user ID of the source bucket owner.",
    },
    {
      name: "bucket",
      type: "string",
      description: "The name of the S3 bucket that received the request.",
    },
    {
      name: "time",
      type: "string",
      description: "The time the S3 request was received.",
    },
    {
      name: "remoteIp",
      type: "string",
      indicator: "IP Address",
      description: "The apparent internet address of the requester.",
    },
    {
      name: "requester",
      type: "string",
      description: "The IAM identity or anonymous requester that made the request.",
    },
    {
      name: "requestId",
      type: "string",
      description: "The request identifier generated by Amazon S3.",
    },
    {
      name: "operation",
      type: "string",
      description: "The S3 operation performed by the request.",
    },
    {
      name: "key",
      type: "string",
      description: "The object key requested from the bucket.",
    },
    {
      name: "httpStatus",
      type: "bigint",
      description: "The numeric HTTP response status.",
    },
    {
      name: "bytesSent",
      type: "bigint",
      description: "The number of response bytes sent.",
    },
    {
      name: "objectSize",
      type: "bigint",
      description: "The total size of the requested object.",
    },
    {
      name: "totalTimeMs",
      type: "bigint",
      description: "The total request processing time in milliseconds.",
    },
    {
      name: "tlsVersion",
      type: "string",
      description: "The TLS version negotiated for the request.",
    },
  ],
}

function HeaderControls() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="default"
        size="sm"
        className="min-w-[213px] justify-between gap-2 font-normal"
      >
        <span className="flex items-center gap-2">
          <CatalogIcon size={16} className="text-muted-foreground" aria-hidden />
          <span className="text-foreground">group_7_demo</span>
        </span>
        <ChevronDownIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
      </Button>
      <LakewatchWarehouseSelector />
      <Button variant="ghost" size="icon-sm" aria-label="Schema options">
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  )
}

function SchemaDefinitionPanel({
  definition,
}: {
  definition: NormalizationSchemaDefinition
}) {
  const [view, setView] = React.useState<"tree" | "code">("tree")
  const fields = NORMALIZATION_FIELDS[definition.title] ?? NORMALIZATION_FIELDS["AWS.VPCFlow"]
  const schemaCode = JSON.stringify(
    {
      schema: definition.title,
      fields: fields.map((field) => ({
        name: field.name,
        type: field.type,
        description: field.description,
        ...(field.indicator ? { indicators: [field.indicator] } : {}),
      })),
    },
    null,
    2
  )

  return (
    <section aria-label={`${definition.title} field definitions`} className="relative min-h-full">
      <div className="sticky top-0 z-10 flex justify-end bg-background py-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Show schema tree"
            aria-pressed={view === "tree"}
            className={view === "tree" ? "bg-muted text-foreground" : undefined}
            onClick={() => setView("tree")}
          >
            <BranchIcon
              size={16}
              className={view === "tree" ? "text-foreground" : "text-muted-foreground"}
            />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Show schema code"
            aria-pressed={view === "code"}
            className={view === "code" ? "bg-muted text-foreground" : undefined}
            onClick={() => setView("code")}
          >
            <CodeIcon
              size={16}
              className={view === "code" ? "text-foreground" : "text-muted-foreground"}
            />
          </Button>
        </div>
      </div>

      {view === "tree" ? (
        <div className="flex flex-col gap-3 pb-6">
          {fields.map((field) => (
            <div key={field.name}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-foreground">{field.name}</span>
                <Badge
                  variant="charcoal"
                  className="border border-input bg-secondary text-hint text-foreground"
                >
                  {field.type}
                </Badge>
                {field.indicator ? (
                  <span className="text-hint text-foreground">
                    Indicators:{" "}
                    <span className="text-[var(--success)]">{field.indicator}</span>
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-hint italic leading-4 text-muted-foreground">
                {field.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <pre className="overflow-auto pb-6 font-mono text-hint leading-5 text-foreground">
          {schemaCode}
        </pre>
      )}
    </section>
  )
}

function NormalizationPreview({
  definition,
}: {
  definition: NormalizationSchemaDefinition
}) {
  const [expanded, setExpanded] = React.useState(true)
  const [visible, setVisible] = React.useState(true)

  if (!visible) return null

  return (
    <section
      aria-label={`${definition.title} data preview`}
      className="shrink-0 border-t border-border bg-background"
    >
      <div className="flex h-8 items-center justify-between border-b border-border px-2">
        <h2 className="min-w-0 truncate text-hint font-semibold text-foreground">
          {definition.previewName}
        </h2>
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={expanded ? "Collapse data preview" : "Expand data preview"}
            onClick={() => setExpanded((current) => !current)}
          >
            <ChevronDownIcon
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                expanded ? "" : "-rotate-90"
              }`}
            />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close data preview"
            onClick={() => setVisible(false)}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="h-[197px] overflow-hidden">
          <div className="flex h-6 items-center border-b border-input px-2">
            <span className="text-sm font-semibold leading-5 text-foreground">data</span>
          </div>
          {definition.events.map((event, index) => (
            <div
              key={`${definition.previewName}-${index}`}
              className="flex h-6 min-w-0 items-center border-b border-input"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Expand preview row ${index + 1}`}
                className="shrink-0"
              >
                <ChevronDownIcon className="h-4 w-4 -rotate-90 text-muted-foreground" />
              </Button>
              <span className="min-w-0 flex-1 truncate pr-2 text-hint leading-4 text-foreground">
                {JSON.stringify(event)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export function LakewatchNormalizationSchemaView() {
  const params = useParams<{ sourceId: string; schemaName: string }>()
  const sourceName = decodeURIComponent(params.sourceId ?? "lakewatch-account-us-west-2")
  const schemaName = decodeURIComponent(params.schemaName ?? "Schematized_AWS.VPCFlow")
  const definition = NORMALIZATION_SCHEMA_DATA[schemaName] ?? FALLBACK_SCHEMA

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-6 p-5">
        <div className="min-w-0">
          <Breadcrumb className="mb-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/lakewatch/datasources">Datasources</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/lakewatch/datasources/${encodeURIComponent(sourceName)}`}>
                    {sourceName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className={`${PAGE_TITLE_SEMIBOLD} truncate`}>{definition.title}</h1>
          <Badge variant="default_tag" className="mt-1">
            Lakewatch managed
          </Badge>
        </div>

        <div className="flex flex-col items-end gap-3">
          <HeaderControls />
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm">
              Test schema
            </Button>
            <Button variant="primary" size="sm">
              Clone
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-background px-5">
        <SchemaDefinitionPanel definition={definition} />
      </div>
      <NormalizationPreview definition={definition} />
    </div>
  )
}
