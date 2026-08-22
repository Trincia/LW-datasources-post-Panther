import * as React from "react"

import { cn } from "@/lib/utils"

export interface NormalizersNavIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

/**
 * Lakewatch normalizers navigation icon from Figma node 31:279 ("normalizers 7").
 * Two columns of data rows with a down-arrow knob funneling each column,
 * representing normalization. Lines and arrows inherit the DuBois text color.
 */
export const NormalizersNavIcon = React.forwardRef<
  SVGSVGElement,
  NormalizersNavIconProps
>(({ size = 16, className, ...props }, ref) => {
  return (
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
      <g stroke="currentColor" strokeWidth="1.08333">
        {/* Left column rows */}
        <path d="M1 2.63H6.41667" />
        <path d="M1 4.25H6.41667" />
        <path d="M1 11.75H6.41667" />
        <path d="M1 13.38H6.41667" />
        <path d="M1 15H6.41667" />
        {/* Right column rows */}
        <path d="M9.66667 1H15.0833" />
        <path d="M9.66667 2.63H15.0833" />
        <path d="M9.66667 4.25H15.0833" />
        <path d="M9.66667 11.75H15.0833" />
        <path d="M9.66667 13.38H15.0833" />
        <path d="M9.66667 15H15.0833" />
      </g>
      {/* Left knob (down arrow) */}
      <path
        transform="translate(2.08 6)"
        d="M2.23837 1.60153L1.75601 2.08389L1.75601 0L1.00989 0L1.00989 2.08389L0.52754 1.60153L0 2.12906L1.38295 3.51201L2.7659 2.12906L2.23837 1.60153Z"
        fill="currentColor"
      />
      {/* Right knob (down arrow) */}
      <path
        transform="translate(10.75 6)"
        d="M2.23836 1.60153L1.756 2.08389L1.756 0L1.00988 0L1.00988 2.08389L0.52753 1.60153L0 2.12906L1.38294 3.51201L2.76589 2.12906L2.23836 1.60153Z"
        fill="currentColor"
      />
    </svg>
  )
})

NormalizersNavIcon.displayName = "NormalizersNavIcon"
