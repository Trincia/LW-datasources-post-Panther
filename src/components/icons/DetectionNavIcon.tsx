import * as React from "react"

import { cn } from "@/lib/utils"

export interface DetectionNavIconProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number
}

/**
 * Lakewatch detection rules navigation icon from Figma node 2550:36690.
 * Use the exported artwork as a mask so the entire icon inherits the same
 * semantic color as the surrounding navigation icons.
 */
export const DetectionNavIcon = React.forwardRef<
  HTMLSpanElement,
  DetectionNavIconProps
>(({ size = 16, className, style, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden
    className={cn("inline-block shrink-0 bg-current", className)}
    style={{
      width: size,
      height: size,
      WebkitMaskImage: "url('/lakewatch/icons/detection-nav-icon-v2.svg')",
      maskImage: "url('/lakewatch/icons/detection-nav-icon-v2.svg')",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskSize: "contain",
      maskSize: "contain",
      ...style,
    }}
    {...props}
  />
))

DetectionNavIcon.displayName = "DetectionNavIcon"
