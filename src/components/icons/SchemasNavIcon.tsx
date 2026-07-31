import * as React from "react"

import { cn } from "@/lib/utils"

export interface SchemasNavIconProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number
}

/**
 * Lakewatch schemas navigation icon from Figma node 2638:25939.
 * Exported vector layers are used as masks so the icon inherits the
 * surrounding DuBois semantic text color.
 */
export const SchemasNavIcon = React.forwardRef<
  HTMLSpanElement,
  SchemasNavIconProps
>(({ size = 16, className, style, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden
    className={cn("relative inline-block shrink-0", className)}
    style={{ width: size, height: size, ...style }}
    {...props}
  >
    <span className="absolute bg-current" style={{ inset: "31.25% 62.5% 61.61% 0" }} />
    <span className="absolute bg-current" style={{ inset: "45.54% 62.5% 47.32% 0" }} />
    <span className="absolute bg-current" style={{ inset: "59.82% 62.5% 33.04% 0" }} />

    <span
      className="absolute border border-current"
      style={{ inset: "0 0 75% 68.75%" }}
    />
    <span
      className="absolute border border-current"
      style={{ inset: "37.5% 0 37.5% 68.75%" }}
    />
    <span
      className="absolute border border-current"
      style={{ inset: "75% 0 0 68.75%" }}
    />

    <span
      className="absolute bg-current"
      style={{
        inset: "12.5% 25% 50% 43.75%",
        WebkitMask:
          "url('/lakewatch/icons/schemas-nav-arrow.svg') center / 100% 100% no-repeat",
        mask:
          "url('/lakewatch/icons/schemas-nav-arrow.svg') center / 100% 100% no-repeat",
      }}
    />
    <span
      className="absolute -scale-y-100 bg-current"
      style={{
        inset: "50% 25% 12.5% 43.75%",
        WebkitMask:
          "url('/lakewatch/icons/schemas-nav-arrow.svg') center / 100% 100% no-repeat",
        mask:
          "url('/lakewatch/icons/schemas-nav-arrow.svg') center / 100% 100% no-repeat",
      }}
    />
    <span
      className="absolute bg-current"
      style={{
        inset: "50% 31.25% 50% 43.75%",
        WebkitMask:
          "url('/lakewatch/icons/schemas-nav-line.svg') center / 100% 100% no-repeat",
        mask:
          "url('/lakewatch/icons/schemas-nav-line.svg') center / 100% 100% no-repeat",
      }}
    />
  </span>
))

SchemasNavIcon.displayName = "SchemasNavIcon"
