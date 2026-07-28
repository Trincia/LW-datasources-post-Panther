"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

type NavGroup = { group: string; items: { id: string; label: string }[] }

const navGroups: NavGroup[] = [
  {
    group: "Foundations",
    items: [
      { id: "colors",     label: "Colors" },
      { id: "typography", label: "Typography" },
      { id: "spacing",    label: "Spacing" },
      { id: "icons",      label: "Icons" },
    ],
  },
  {
    group: "Actions",
    items: [
      { id: "buttons",      label: "Buttons" },
      { id: "split-button", label: "Split Button" },
    ],
  },
  {
    group: "Form & Input",
    items: [
      { id: "forms",      label: "Form Controls" },
      { id: "hint",       label: "Hint" },
      { id: "slider",     label: "Slider" },
      { id: "radio-tile", label: "Radio Tile" },
      { id: "segmented",  label: "Segmented Control" },
    ],
  },
  {
    group: "Feedback & Status",
    items: [
      { id: "alerts",   label: "Alerts" },
      { id: "spinner",  label: "Spinner" },
      { id: "progress", label: "Progress" },
      { id: "stepper",  label: "Stepper" },
      { id: "empty",    label: "Empty State" },
    ],
  },
  {
    group: "Data Display",
    items: [
      { id: "badges",    label: "Badges & Tags" },
      { id: "tables",    label: "Tables" },
      { id: "cards",     label: "Cards" },
      { id: "list-item", label: "List Item" },
    ],
  },
  {
    group: "Navigation",
    items: [
      { id: "tabs-demo",  label: "Tabs" },
      { id: "breadcrumb", label: "Breadcrumb" },
      { id: "pagination", label: "Pagination" },
      { id: "tree",       label: "Tree" },
    ],
  },
  {
    group: "Overlays",
    items: [
      { id: "dialogs", label: "Dialogs & Sheets" },
    ],
  },
  {
    group: "AI",
    items: [
      { id: "ai", label: "AI Components" },
    ],
  },
  {
    group: "Shell & Pages",
    items: [
      { id: "shell",         label: "Shell" },
      { id: "notebook-cell", label: "Notebook Cell" },
    ],
  },
  {
    group: "Misc",
    items: [
      { id: "misc", label: "Misc" },
    ],
  },
];

const patternItems = [
  { id: "data-table",    label: "Data Table" },
  { id: "form-layout",   label: "Form Layout" },
  { id: "metric-cards",  label: "Metric Cards" },
  { id: "settings-panel", label: "Settings Panel" },
  { id: "empty-state",   label: "Empty State" },
  { id: "confirm-delete", label: "Confirm Delete" },
  { id: "page-header",   label: "Page Header" },
];

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isComponents = pathname === "/design-system";
  const isPatterns = pathname === "/design-system/patterns";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-52 shrink-0 border-r border-border overflow-y-auto py-6 px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-1 text-hint font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">←</span>
            Design System
          </Link>
          <ThemeToggle />
        </div>
        <nav className="flex flex-col gap-0.5">
          <Link
            href="/design-system"
            className={`rounded px-2 py-1.5 text-sm transition-colors ${
              isComponents
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            Components
          </Link>
          <Link
            href="/design-system/patterns"
            className={`rounded px-2 py-1.5 text-sm transition-colors ${
              isPatterns
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            Patterns
          </Link>
          {isComponents && (
            <>
              <div className="my-1.5 border-t border-border" />
              {navGroups.map((group) => (
                <div key={group.group} className="mb-3">
                  <p className="mb-0.5 px-2 text-hint font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {group.group}
                  </p>
                  {group.items.map((item) => (
                    <a
                      key={item.id}
                      href={`/design-system#${item.id}`}
                      className="block rounded px-2 py-1 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ))}
            </>
          )}
          {isPatterns && (
            <>
              <div className="my-1.5 border-t border-border" />
              {patternItems.map((item) => (
                <a
                  key={item.id}
                  href={`/design-system/patterns#${item.id}`}
                  className="block rounded px-2 py-1 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 px-10 py-10 max-w-4xl">
        {children}
      </main>
    </div>
  );
}
