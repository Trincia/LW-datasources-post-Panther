import * as React from "react"

import { cn } from "@/lib/utils"

export interface DetectionNavIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

/**
 * Lakewatch detection rules navigation icon from Figma node 2747:65001.
 * Rebuilt as an inline SVG so the whole glyph inherits the surrounding DuBois
 * semantic text color (muted by default, primary when active).
 */
export const DetectionNavIcon = React.forwardRef<
  SVGSVGElement,
  DetectionNavIconProps
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
    <path
      d="M13.026 7.99956C13.0259 5.06923 10.6496 2.69375 7.71925 2.69375C4.78898 2.69388 2.41356 5.0693 2.41344 7.99956C2.41344 10.9299 4.78891 13.3062 7.71925 13.3063V14.72L7.37412 14.7107C3.82343 14.531 0.99978 11.5949 0.99978 7.99956C0.999904 4.28856 4.00824 1.28022 7.71925 1.2801C11.4304 1.2801 14.4395 4.28848 14.4396 7.99956L14.4304 8.34562C14.2504 11.8961 11.3144 14.72 7.71925 14.72V13.3063C10.6497 13.3063 13.026 10.93 13.026 7.99956Z"
      fill="currentColor"
    />
    <path
      d="M10.6207 7.99965C10.6206 6.3975 9.32114 5.09874 7.71897 5.09874C6.11689 5.09885 4.81816 6.39757 4.81805 7.99965C4.81805 9.60183 6.11682 10.9013 7.71897 10.9014V12.1825L7.50378 12.1767C5.29408 12.0646 3.53691 10.2372 3.53691 7.99965C3.53702 5.69002 5.40933 3.81771 7.71897 3.8176C10.0287 3.8176 11.9017 5.68995 11.9019 7.99965L11.896 8.21484C11.7841 10.4247 9.95667 12.1825 7.71897 12.1825V10.9014C9.32121 10.9014 10.6207 9.6019 10.6207 7.99965Z"
      fill="currentColor"
    />
    <path
      d="M14.0547 2.91461L14.89 4.04261L8.97968 8.41941L8.14436 7.29141L14.0547 2.91461Z"
      fill="currentColor"
    />
    <circle cx="7.71993" cy="7.99996" r="1.61182" fill="currentColor" />
  </svg>
))

DetectionNavIcon.displayName = "DetectionNavIcon"
