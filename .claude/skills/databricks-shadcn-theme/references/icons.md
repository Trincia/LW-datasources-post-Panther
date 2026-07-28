# DuBois Icons Integration for shadcn/ui

DuBois ships 413 custom SVG icons in a 16×16 viewBox, using `currentColor` for theming.
shadcn/ui uses **Lucide React** as its default icon set (also 24×24, `currentColor`-based).

This guide covers three integration strategies, from simplest to most complete.

## Table of Contents

1. [Strategy A: Use Lucide with DuBois Mapping](#strategy-a-lucide-mapping)
2. [Strategy B: Extract DuBois SVGs as Standalone Components](#strategy-b-standalone-components)
3. [Strategy C: Hybrid — Lucide defaults + DuBois for Databricks-specific icons](#strategy-c-hybrid)
4. [Icon Styling Conventions](#icon-styling-conventions)
5. [DuBois → Lucide Mapping Table](#dubois--lucide-mapping-table)
6. [Databricks-Specific Icons (No Lucide Equivalent)](#databricks-specific-icons)

---

## Strategy A: Lucide Mapping

**Best for**: Teams that want to stay on shadcn/ui defaults with minimal custom work.

Most DuBois icons have Lucide equivalents. Use the [mapping table](#dubois--lucide-mapping-table)
below and import from `lucide-react` as usual. The main trade-off: some Databricks-specific
icons (catalog, notebook, pipeline, etc.) don't exist in Lucide.

```tsx
// Instead of:
import { SearchIcon } from '@databricks/design-system';
// Use:
import { Search } from 'lucide-react';
```

Sizing: DuBois icons are 16×16 by default. In shadcn/Lucide, set `size={16}` or use `className="h-4 w-4"`.

---

## Strategy B: Standalone Components

**Best for**: Teams that need exact visual parity with DuBois and/or use Databricks-specific icons.

Extract DuBois SVGs into standalone React components that work without `@databricks/design-system`
or Ant Design dependencies.

### Extraction Script

Run this script to extract all 413 DuBois icons into a `components/icons/` directory:

```bash
node scripts/extract-dubois-icons.js
```

This produces components like:

```tsx
// components/icons/SearchIcon.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export const SearchIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 16, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 ..."
        fill="currentColor"
      />
    </svg>
  )
);
SearchIcon.displayName = "SearchIcon";
```

### Usage in shadcn components

```tsx
import { SearchIcon } from "@/components/icons/SearchIcon";
import { Button } from "@/components/ui/button";

// Works seamlessly — icons inherit text color via currentColor
<Button variant="outline">
  <SearchIcon className="mr-2 h-4 w-4" />
  Search
</Button>
```

---

## Strategy C: Hybrid (Recommended)

**Best for**: Most teams. Maximum compatibility with shadcn ecosystem + Databricks identity.

1. Use **Lucide** for generic/universal icons (arrows, check, close, settings, etc.)
2. Extract **DuBois-only icons** for Databricks-specific concepts
3. Wrap both in a unified icon API

### Unified Icon Component

```tsx
// components/ui/db-icon.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type IconColor = "default" | "danger" | "warning" | "success" | "ai";

interface DbIconProps {
  /** Lucide icon component OR DuBois SVG component */
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  size?: number;
  color?: IconColor;
  className?: string;
}

const colorMap: Record<IconColor, string> = {
  default: "",
  danger: "text-destructive",
  warning: "text-[hsl(var(--warning))]",
  success: "text-[hsl(var(--success))]",
  ai: "", // handled separately with gradient
};

export const DbIcon = forwardRef<SVGSVGElement, DbIconProps>(
  ({ icon: Icon, size = 16, color = "default", className, ...props }, ref) => {
    if (color === "ai") {
      return (
        <span className={cn("inline-flex items-center", className)}>
          <Icon
            ref={ref}
            width={size}
            height={size}
            className="[&_*]:fill-[url(#db-ai-gradient)]"
            {...props}
          />
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="db-ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="20.5%" stopColor="#4299E0" />
                <stop offset="46.91%" stopColor="#CA42E0" />
                <stop offset="79.5%" stopColor="#FF5F46" />
              </linearGradient>
            </defs>
          </svg>
        </span>
      );
    }

    return (
      <Icon
        ref={ref}
        width={size}
        height={size}
        className={cn("shrink-0", colorMap[color], className)}
        {...props}
      />
    );
  }
);
DbIcon.displayName = "DbIcon";
```

Usage:
```tsx
import { Search, Settings } from "lucide-react";
import { NotebookIcon } from "@/components/icons/NotebookIcon";
import { DbIcon } from "@/components/ui/db-icon";

<DbIcon icon={Search} />                          {/* Lucide generic */}
<DbIcon icon={NotebookIcon} />                     {/* DuBois specific */}
<DbIcon icon={SparkleIcon} color="ai" size={20} /> {/* AI gradient */}
<DbIcon icon={DangerIcon} color="danger" />        {/* Semantic color */}
```

---

## Icon Styling Conventions

### Sizing
DuBois uses 16×16 as its standard icon size (with some 24×24 for larger contexts).

| Context         | Size   | Tailwind class |
|-----------------|--------|----------------|
| Inline with text| 16px   | `h-4 w-4`     |
| Button icon     | 16px   | `h-4 w-4`     |
| Navigation      | 20px   | `h-5 w-5`     |
| Page header     | 24px   | `h-6 w-6`     |

### Colors
Icons inherit text color via `currentColor`. Use semantic classes:
- Default: inherits from parent (usually `textPrimary`)
- Secondary: `text-muted-foreground` (maps to grey500/grey350)
- Interactive: `text-primary` (maps to blue600/blue500)
- Danger: `text-destructive`
- AI: Use the gradient pattern from the DbIcon component above

### Spacing
When pairing icons with text in buttons or labels:
- `gap-2` (8px) between icon and text — matches DuBois `spacing.sm`

---

## DuBois → Lucide Mapping Table

Common icons with direct Lucide equivalents. Use Lucide for these unless you need
pixel-exact DuBois parity.

| DuBois Icon            | Lucide Equivalent          | Notes                        |
|------------------------|----------------------------|------------------------------|
| `ArrowDownIcon`        | `ArrowDown`                |                              |
| `ArrowLeftIcon`        | `ArrowLeft`                |                              |
| `ArrowRightIcon`       | `ArrowRight`               |                              |
| `ArrowUpIcon`          | `ArrowUp`                  |                              |
| `BookIcon`             | `Book`                     |                              |
| `BookmarkIcon`         | `Bookmark`                 |                              |
| `BookmarkFillIcon`     | `BookmarkCheck`            | Lucide doesn't have filled   |
| `BrushIcon`            | `Paintbrush`               |                              |
| `BugIcon`              | `Bug`                      |                              |
| `CalendarIcon`         | `Calendar`                 |                              |
| `CalendarClockIcon`    | `CalendarClock`            |                              |
| `CalendarRangeIcon`    | `CalendarRange`            |                              |
| `CameraIcon`           | `Camera`                   |                              |
| `CheckIcon`            | `Check`                    |                              |
| `CheckCircleIcon`      | `CheckCircle`              |                              |
| `CheckCircleFillIcon`  | `CheckCircle2`             | Closest filled variant       |
| `ChevronDownIcon`      | `ChevronDown`              |                              |
| `ChevronLeftIcon`      | `ChevronLeft`              |                              |
| `ChevronRightIcon`     | `ChevronRight`             |                              |
| `ChevronUpIcon`        | `ChevronUp`                |                              |
| `ClipboardIcon`        | `Clipboard`                |                              |
| `ClockIcon`            | `Clock`                    |                              |
| `CloseIcon`            | `X`                        |                              |
| `CloudIcon`            | `Cloud`                    |                              |
| `CloudDownloadIcon`    | `CloudDownload`            |                              |
| `CloudUploadIcon`      | `CloudUpload`              |                              |
| `CodeIcon`             | `Code`                     |                              |
| `CopyIcon`             | `Copy`                     |                              |
| `CreditCardIcon`       | `CreditCard`               |                              |
| `DangerIcon`           | `AlertTriangle`            |                              |
| `DangerFillIcon`       | `AlertTriangle`            | No filled Lucide variant     |
| `DashboardIcon`        | `LayoutDashboard`          |                              |
| `DatabaseIcon`         | `Database`                 |                              |
| `DollarIcon`           | `DollarSign`               |                              |
| `DownloadIcon`         | `Download`                 |                              |
| `DragIcon`             | `GripVertical`             |                              |
| `FileIcon`             | `File`                     |                              |
| `FileCodeIcon`         | `FileCode`                 |                              |
| `FileDocumentIcon`     | `FileText`                 |                              |
| `FileImageIcon`        | `FileImage`                |                              |
| `FilterIcon`           | `Filter`                   |                              |
| `FolderIcon`           | `Folder`                   |                              |
| `FolderOpenIcon`       | `FolderOpen`               |                              |
| `FullscreenIcon`       | `Maximize`                 |                              |
| `FullscreenExitIcon`   | `Minimize`                 |                              |
| `GearIcon`             | `Settings`                 |                              |
| `GiftIcon`             | `Gift`                     |                              |
| `GlobeIcon`            | `Globe`                    |                              |
| `GridIcon`             | `Grid3x3`                  |                              |
| `HashIcon`             | `Hash`                     |                              |
| `HistoryIcon`          | `History`                  |                              |
| `HomeIcon`             | `Home`                     |                              |
| `ImageIcon`            | `Image`                    |                              |
| `InfoIcon`             | `Info`                     |                              |
| `InfoFillIcon`         | `Info`                     | No filled Lucide variant     |
| `ItalicIcon`           | `Italic`                   |                              |
| `KeyIcon`              | `Key`                      |                              |
| `KeyboardIcon`         | `Keyboard`                 |                              |
| `LightbulbIcon`        | `Lightbulb`                |                              |
| `LightningIcon`        | `Zap`                      |                              |
| `LinkIcon`             | `Link`                     |                              |
| `LinkOffIcon`          | `LinkOff` / `Unlink`       |                              |
| `ListIcon`             | `List`                     |                              |
| `LockIcon`             | `Lock`                     |                              |
| `LockUnlockedIcon`     | `Unlock`                   |                              |
| `MailIcon`             | `Mail`                     |                              |
| `MapIcon`              | `Map`                      |                              |
| `MegaphoneIcon`        | `Megaphone`                |                              |
| `MenuIcon`             | `Menu`                     |                              |
| `MinusCircleIcon`      | `MinusCircle`              |                              |
| `MoonIcon`             | `Moon`                     |                              |
| `NotificationIcon`     | `Bell`                     |                              |
| `NotificationOffIcon`  | `BellOff`                  |                              |
| `OverflowIcon`         | `MoreHorizontal`           |                              |
| `PauseIcon`            | `Pause`                    |                              |
| `PencilIcon`           | `Pencil`                   |                              |
| `PieChartIcon`         | `PieChart`                 |                              |
| `PlayIcon`             | `Play`                     |                              |
| `PlusIcon`             | `Plus`                     |                              |
| `PlusCircleIcon`       | `PlusCircle`               |                              |
| `QuestionMarkIcon`     | `HelpCircle`               |                              |
| `RedoIcon`             | `Redo`                     |                              |
| `RefreshIcon`          | `RefreshCw`                |                              |
| `RocketIcon`           | `Rocket`                   |                              |
| `SaveIcon`             | `Save`                     |                              |
| `SchoolIcon`           | `GraduationCap`            |                              |
| `SearchIcon`           | `Search`                   |                              |
| `SendIcon`             | `Send`                     |                              |
| `ShareIcon`            | `Share2`                    |                              |
| `ShieldIcon`           | `Shield`                   |                              |
| `ShieldCheckIcon`      | `ShieldCheck`              |                              |
| `SlidersIcon`          | `SlidersHorizontal`        |                              |
| `SparkleIcon`          | `Sparkles`                 |                              |
| `SpeechBubbleIcon`     | `MessageSquare`            |                              |
| `StarIcon`             | `Star`                     |                              |
| `StarFillIcon`         | `Star` (filled)            | Use `fill="currentColor"`    |
| `StopIcon`             | `Square`                   |                              |
| `SunIcon`              | `Sun`                      |                              |
| `TableIcon`            | `Table`                    |                              |
| `TagIcon`              | `Tag`                      |                              |
| `TerminalIcon`         | `Terminal`                 |                              |
| `ThreeDotsIcon`        | `MoreVertical`             |                              |
| `ThumbsDownIcon`       | `ThumbsDown`               |                              |
| `ThumbsUpIcon`         | `ThumbsUp`                 |                              |
| `TrashIcon`            | `Trash2`                   |                              |
| `UndoIcon`             | `Undo`                     |                              |
| `UploadIcon`           | `Upload`                   |                              |
| `UserIcon`             | `User`                     |                              |
| `UserGroupIcon`        | `Users`                    |                              |
| `VisibleIcon`          | `Eye`                      |                              |
| `VisibleOffIcon`       | `EyeOff`                   |                              |
| `WarningIcon`          | `AlertTriangle`            |                              |
| `WarningFillIcon`      | `AlertTriangle`            |                              |
| `WrenchIcon`           | `Wrench`                   |                              |
| `ZoomInIcon`           | `ZoomIn`                   |                              |
| `ZoomOutIcon`          | `ZoomOut`                  |                              |

---

## Databricks-Specific Icons (No Lucide Equivalent)

These icons are unique to Databricks product concepts. **Always extract these from DuBois**
when building Databricks UIs — there are no good Lucide substitutes.

### Data & Catalog
`CatalogIcon`, `CatalogCloudIcon`, `CatalogGearIcon`, `CatalogHIcon`, `CatalogHomeIcon`,
`CatalogOffIcon`, `CatalogSharedIcon`, `DatabaseClockIcon`, `DatabaseImportIcon`,
`DataIcon`, `ErdIcon`, `SchemaIcon`, `StoredProcedureIcon`, `TableClockIcon`,
`TableCombineIcon`, `TableGlassesIcon`, `TableGlobeIcon`, `TableLightningIcon`,
`TableMeasureIcon`, `TableModelIcon`, `TableStreamIcon`, `TableVectorIcon`, `TableViewIcon`

### Notebooks & Pipelines
`NotebookIcon`, `NotebookPipelineIcon`, `PipelineIcon`, `PipelineCodeIcon`,
`PipelineCubeIcon`, `WorkflowsIcon`, `WorkflowCodeIcon`, `WorkflowCubeIcon`

### ML & AI
`AssistantIcon`, `ModelsIcon`, `FileModelIcon`, `CloudModelIcon`, `RobotIcon`,
`SparkleDoubleFillIcon`, `SparkleDoubleIcon`, `SparkleFillIcon`, `SparkleRectangleIcon`,
`PencilSparkleIcon`, `WrenchSparkleIcon`, `UserSparkleIcon`,
`SpeechBubbleStarIcon`, `SpeechBubbleQuestionMarkIcon`

### Databricks-Specific UI
`QueryEditorIcon`, `QueryIcon`, `CustomAppIcon`, `WorkspacesIcon`, `ReaderModeIcon`,
`StorefrontIcon`, `SidebarAutoIcon`, `SidebarCollapseIcon`, `SidebarExpandIcon`,
`SidebarSyncIcon`, `NeonProjectIcon`, `ResourceStatusIndicator`-related icons

### Git & Branching
`BranchIcon`, `BranchCheckIcon`, `BranchResetIcon`, `GitCommitIcon`, `PullRequestIcon`,
`FolderBranchIcon`, `FolderBranchFillIcon`, `FolderOpenBranchIcon`

### Charts & Visualization
`BarChartIcon`, `BarGroupedIcon`, `BarStackedIcon`, `BarStackedPercentageIcon`,
`BarsAscendingHorizontalIcon`, `BarsAscendingVerticalIcon`,
`BarsDescendingHorizontalIcon`, `BarsDescendingVerticalIcon`,
`ChartLineIcon`, `TrendingIcon`

### Sorting (Rich Set)
`SortAscendingIcon`, `SortDescendingIcon`, `SortUnsortedIcon`,
`SortHorizontalAscendingIcon`, `SortHorizontalDescendingIcon`,
`SortVerticalAscendingIcon`, `SortVerticalDescendingIcon`,
`SortLetterHorizontalAscendingIcon`, `SortLetterHorizontalDescendingIcon`,
`SortLetterVerticalAscendingIcon`, `SortLetterVerticalDescendingIcon`,
`SortLetterUnsortedIcon`, `SortCustomHorizontalIcon`, `SortCustomVerticalIcon`
