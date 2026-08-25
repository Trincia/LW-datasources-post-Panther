// Shared data model for the Normalizer studio + list.
// These types are consumed by both the (client) studio component and the
// (pure data) blueprint definitions so the two stay in sync.

export type SourceField = {
  path: string
  type: string
  sample: string
  /** Nested fields for struct-typed columns. */
  children?: SourceField[]
  /** When true the column is entirely null (0 distinct / 0% populated). */
  nullable?: boolean
}

export type SourceDataset = {
  id: string
  kind: "parsed" | "raw"
  name: string
  table: string
  records: string
  fields: SourceField[]
}

export type TargetField = {
  path: string
  requirement: "required" | "recommended" | "optional"
}

export type TargetClass = {
  id: string
  name: string
  category: string
  classUid: number
  fields: TargetField[]
}

export type Mapping = {
  id: string
  source: string
  target: string
  expression: string
  origin: "system" | "manual" | "genie"
}

/** A fully-authored normalizer: list metadata + everything the studio needs to
 * render its completed (100% mapped) state. */
export type NormalizerBlueprint = {
  identifier: string
  displayName: string
  /** Name shown in the studio "Normalizer name" input. */
  name: string
  sourceParser: string
  targetEventClass: string
  targetGroupId: string
  type: "built-in" | "custom"
  latestVersion: string
  creator: "Databricks" | "You"
  source: SourceDataset
  target: TargetClass
  mappings: Mapping[]
}

export type NormalizerRow = {
  identifier: string
  displayName: string
  sourceParser: string
  targetEventClass: string
  type: "built-in" | "custom"
  latestVersion: string
  creator: "Databricks" | "You"
}

export type NormalizerGroup = {
  id: string
  name: string
  classUid: number
  category: string
  rows: NormalizerRow[]
}
