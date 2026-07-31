export type StoredSchemaRow = {
  name: string
  description: string
  managedBy: "Databricks" | "User"
  fieldDiscovery: "Enabled" | "Disabled"
  datasourceCount: number
}

const CUSTOM_SCHEMAS_STORAGE_KEY = "lakewatch-custom-schemas"

export function readCustomSchemas(): StoredSchemaRow[] {
  if (typeof window === "undefined") return []

  try {
    const stored = window.localStorage.getItem(CUSTOM_SCHEMAS_STORAGE_KEY)
    return stored ? (JSON.parse(stored) as StoredSchemaRow[]) : []
  } catch {
    return []
  }
}

export function saveCustomSchema(schema: StoredSchemaRow) {
  const schemas = readCustomSchemas()
  const nextSchemas = [schema, ...schemas.filter((item) => item.name !== schema.name)]
  window.localStorage.setItem(CUSTOM_SCHEMAS_STORAGE_KEY, JSON.stringify(nextSchemas))
}
