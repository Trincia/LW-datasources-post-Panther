export type TemplateVersion = { version: string; created: string }

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function formatDateTime(date: Date): string {
  const month = MONTH_LABELS[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const ampm = date.getHours() >= 12 ? "PM" : "AM"
  const hour12 = date.getHours() % 12 || 12
  return `${month} ${day}, ${year}, ${hour12}:${minutes} ${ampm}`
}

/**
 * Deterministically builds a version history for a template (newest first) so
 * each template shows a stable set of versions and matching creation timestamps.
 */
export function buildVersions(name: string): TemplateVersion[] {
  const seed = hashString(name)
  const count = 3 + (seed % 3)
  const base = new Date(2026, 7, 6, 9, 0)
  const versions: TemplateVersion[] = []
  for (let i = 0; i < count; i += 1) {
    const versionNumber = count - i
    const daysBack = i * (4 + (seed % 6)) + (seed % 4)
    const hour = 8 + ((seed >> (i + 1)) % 9)
    const minute = (seed * (i + 3)) % 60
    const date = new Date(base)
    date.setDate(date.getDate() - daysBack)
    date.setHours(hour, minute)
    versions.push({ version: `v${versionNumber}`, created: formatDateTime(date) })
  }
  return versions
}
