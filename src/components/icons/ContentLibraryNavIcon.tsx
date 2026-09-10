import * as React from "react"

import { cn } from "@/lib/utils"

export interface ContentLibraryNavIconProps
  extends React.SVGProps<SVGSVGElement> {
  size?: number
}

/**
 * Lakewatch Content library navigation icon — three book spines, the last
 * leaning in toward the others without overlapping. Drawn as inline strokes
 * so the glyph inherits the surrounding DuBois semantic text color.
 */
export const ContentLibraryNavIcon = React.forwardRef<
  SVGSVGElement,
  ContentLibraryNavIconProps
>(({ size = 16, className, ...props }, ref) => (
  <svg
    ref={ref}
    aria-hidden
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("shrink-0", className)}
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="1.6" y="2.8" width="2.5" height="10.4" rx="0.55" />
    <rect x="5.4" y="2.8" width="2.5" height="10.4" rx="0.55" />
    {/* Sheared spine sitting on the same baseline, leaning toward the others. */}
    <path d="M11.15 13.2H13.65L11.95 2.8H9.45Z" />
  </svg>
))

ContentLibraryNavIcon.displayName = "ContentLibraryNavIcon"
