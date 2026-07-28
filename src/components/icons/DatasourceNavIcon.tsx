import * as React from "react"

import { cn } from "@/lib/utils"

export interface DatasourceNavIconProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number
}

/**
 * Lakewatch datasource navigation icon from Figma node 2540:48418.
 * Its exported vector layers and exact Figma geometry inherit the
 * surrounding DuBois semantic text color.
 */
export const DatasourceNavIcon = React.forwardRef<
  HTMLSpanElement,
  DatasourceNavIconProps
>(({ size = 16, className, style, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden
    className={cn("relative inline-block shrink-0", className)}
    style={{
      width: size,
      height: size,
      ...style,
    }}
    {...props}
  >
    <span
      className="absolute bg-current"
      style={{
        inset: "0 0 0 7.14%",
        WebkitMask:
          "url('/lakewatch/icons/datasource-path-outline.svg') center / 100% 100% no-repeat",
        mask:
          "url('/lakewatch/icons/datasource-path-outline.svg') center / 100% 100% no-repeat",
      }}
    />
    <span
      className="absolute bg-current"
      style={{
        inset: "28.57% 13.27% 28.57% 50%",
        WebkitMask:
          "url('/lakewatch/icons/datasource-path-arrow.svg') center / 100% 100% no-repeat",
        mask:
          "url('/lakewatch/icons/datasource-path-arrow.svg') center / 100% 100% no-repeat",
      }}
    />
    <span className="absolute bg-current" style={{ inset: "21.43% 57.14% 70.41% 0" }} />
    <span className="absolute bg-current" style={{ inset: "37.76% 57.14% 54.08% 0" }} />
    <span className="absolute bg-current" style={{ inset: "54.08% 57.14% 37.76% 0" }} />
    <span className="absolute bg-current" style={{ inset: "70.41% 64.29% 21.43% 0" }} />
  </span>
))

DatasourceNavIcon.displayName = "DatasourceNavIcon"
