import * as React from "react"

import { cn } from "@/lib/utils"

export interface LakewatchAlertIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

/**
 * Lakewatch "Alerts" navigation icon from Figma (LakewatchAlert) — a circled
 * exclamation. The circle sits inset 1px inside the 16px frame and the
 * exclamation bar is centered; both inherit the surrounding DuBois text color.
 */
export const LakewatchAlertIcon = React.forwardRef<
  SVGSVGElement,
  LakewatchAlertIconProps
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.3125 8C2.3125 4.85888 4.85888 2.3125 8 2.3125C11.1411 2.3125 13.6875 4.85888 13.6875 8C13.6875 11.1411 11.1411 13.6875 8 13.6875C4.85888 13.6875 2.3125 11.1411 2.3125 8ZM8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 8.66667V4H9V8.66667H7ZM8 12C8.55228 12 9 11.5523 9 11C9 10.4477 8.55228 10 8 10C7.44772 10 7 10.4477 7 11C7 11.5523 7.44772 12 8 12Z"
        fill="currentColor"
      />
    </svg>
  )
})

LakewatchAlertIcon.displayName = "LakewatchAlertIcon"
