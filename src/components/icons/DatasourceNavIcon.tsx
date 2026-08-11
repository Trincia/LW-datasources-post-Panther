import * as React from "react"

import { cn } from "@/lib/utils"

export interface DatasourceNavIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

/**
 * Lakewatch datasource navigation icon from Figma node 2739:54872.
 * Rebuilt as an inline SVG so every shape inherits the surrounding DuBois
 * semantic text color (muted by default, primary when active).
 */
export const DatasourceNavIcon = React.forwardRef<
  SVGSVGElement,
  DatasourceNavIconProps
>(({ size = 16, className, ...props }, ref) => (
  <svg
    ref={ref}
    aria-hidden
    width={size}
    height={size}
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("shrink-0", className)}
    {...props}
  >
    <path
      transform="translate(1 0)"
      d="M1.5 1.5H11.5V12.5H1.5L1.5 11.4585L0 11.4585L8.34465e-07 13.25C8.34465e-07 13.6642 0.335788 14 0.750001 14L12.25 14C12.4489 14 12.6397 13.921 12.7803 13.7803C12.921 13.6397 13 13.4489 13 13.25V0.75C13 0.551088 12.921 0.360322 12.7803 0.21967C12.6397 0.0790177 12.4489 0 12.25 0L0.75 0C0.335787 0 3.57628e-07 0.335786 3.57628e-07 0.749999L0 2.64303H1.5L1.5 1.5Z"
      fill="currentColor"
    />
    <path
      transform="translate(6.72 4)"
      d="M5.14286 3L2.20724 0L1.43467 0.789509L3.05144 2.44173L0 2.44173V3.55827L3.05144 3.55827L1.43467 5.21049L2.20724 6L5.14286 3Z"
      fill="currentColor"
    />
    <rect x="0" y="3.71" width="5" height="1.14" fill="currentColor" />
    <rect x="0" y="6.43" width="5" height="1.14" fill="currentColor" />
    <rect x="0" y="9.15" width="5" height="1.14" fill="currentColor" />
  </svg>
))

DatasourceNavIcon.displayName = "DatasourceNavIcon"
