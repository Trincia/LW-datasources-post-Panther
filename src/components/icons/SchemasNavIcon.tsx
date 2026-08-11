import * as React from "react"

import { cn } from "@/lib/utils"

export interface SchemasNavIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

/**
 * Lakewatch ingestion templates navigation icon from Figma node 2748:65470.
 * Rebuilt as an inline SVG so every stroke inherits the surrounding DuBois
 * semantic text color (muted by default, primary when active).
 */
export const SchemasNavIcon = React.forwardRef<
  SVGSVGElement,
  SchemasNavIconProps
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
    {...props}
  >
    <g transform="translate(0 15.6079) scale(1 -1)">
      <path
        d="M7.8252 4.23821V4.01531C7.8252 2.91074 8.72063 2.01531 9.8252 2.01531H10.507"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7.8252 4.06992V10.8733"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7.8252 10.7543V10.9772C7.8252 12.0818 8.72063 12.9772 9.8252 12.9772H10.507"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <mask id="ingestion-tpl-rect-1" fill="white">
        <rect x="10.2207" y="10.8732" width="5.7793" height="4.34466" rx="0.5" />
      </mask>
      <rect
        x="10.2207"
        y="10.8732"
        width="5.7793"
        height="4.34466"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="3"
        mask="url(#ingestion-tpl-rect-1)"
      />
      <mask id="ingestion-tpl-rect-2" fill="white">
        <rect x="10.2207" y="5.4367" width="5.7793" height="4.34466" rx="0.5" />
      </mask>
      <rect
        x="10.2207"
        y="5.4367"
        width="5.7793"
        height="4.34466"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="3"
        mask="url(#ingestion-tpl-rect-2)"
      />
      <mask id="ingestion-tpl-rect-3" fill="white">
        <rect x="10.2207" width="5.7793" height="4.34466" rx="0.5" />
      </mask>
      <rect
        x="10.2207"
        width="5.7793"
        height="4.34466"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="3"
        mask="url(#ingestion-tpl-rect-3)"
      />
      <line
        x1="0.76123"
        y1="4.42962"
        x2="3.71875"
        y2="4.42962"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <line
        x1="0.76123"
        y1="7.59429"
        x2="3.71875"
        y2="7.59429"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <line
        x1="0.75"
        y1="10.7075"
        x2="3.70752"
        y2="10.7075"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <line
        x1="6.4502"
        y1="7.59428"
        x2="9.4707"
        y2="7.59428"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </g>
  </svg>
))

SchemasNavIcon.displayName = "SchemasNavIcon"
