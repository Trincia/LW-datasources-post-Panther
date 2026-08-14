import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const ROW_WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-2/5", "w-4/6"]

/**
 * Table-shaped skeleton with a shimmer sweep, shown in place of a preview table
 * while it loads or is replaced with new data. `panes` renders side-by-side
 * columns (e.g. input/output previews); size the height via `className`.
 */
export function PreviewSkeleton({
  className,
  panes = 1,
  rows = 5,
}: {
  className?: string
  panes?: number
  rows?: number
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "skeleton-sweep grid border-y border-input",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${panes}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: panes }).map((_, paneIndex) => (
        <div
          key={paneIndex}
          className={cn(
            "flex min-w-0 flex-col",
            paneIndex < panes - 1 && "border-r border-input"
          )}
        >
          <div className="flex h-8 shrink-0 items-center gap-2 px-2">
            <Skeleton className="size-3.5 shrink-0 rounded" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex h-6 shrink-0 items-center border-y border-input px-2">
            <Skeleton className="h-3 w-16" />
          </div>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex h-6 min-w-0 shrink-0 items-center gap-2 border-b border-input px-2"
            >
              <Skeleton className="size-3 shrink-0 rounded" />
              <Skeleton
                className={cn("h-3", ROW_WIDTHS[rowIndex % ROW_WIDTHS.length])}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
