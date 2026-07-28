/**
 * tailwind-extend.js — DuBois token extensions for Tailwind CSS
 *
 * Merge this into your tailwind.config.ts theme.extend block.
 *
 * Usage in tailwind.config.ts:
 *
 *   import duboisExtend from "./.claude/skills/databricks-shadcn-theme/references/tailwind-extend";
 *
 *   const config: Config = {
 *     theme: {
 *       extend: {
 *         ...duboisExtend,
 *       },
 *     },
 *   };
 *
 * These extensions add DuBois primitive colors as Tailwind utilities
 * (e.g. `text-blue-600`, `bg-grey-050`) alongside semantic aliases.
 * Always prefer semantic CSS variables (via shadcn's design tokens) over
 * these primitives when styling components.
 */

/** @type {import('tailwindcss').Config['theme']['extend']} */
const duboisExtend = {
  // ── Colors ──────────────────────────────────────────────────────────────────
  colors: {
    // DuBois Blue — primary action palette
    blue: {
      400: "#4BA3D6",
      500: "#2E86C1",
      600: "#2272B4", // primary default
      700: "#0E538B", // primary hover
      800: "#04355D", // primary press
    },

    // DuBois Grey — neutral/surface palette
    grey: {
      "050": "#F6F7F9", // background secondary, muted
      100: "#E8ECF0",   // borders, dividers
      200: "#D1DCE5",
      300: "#BDCDD9",
      400: "#8D9FAD",
      500: "#5F7281",   // text secondary
      600: "#44535F",
      700: "#2A3A45",   // dark mode borders/surfaces
      800: "#11171C",   // text primary, dark mode background
    },

    // DuBois Red — destructive actions
    red: {
      400: "#F06E87",
      500: "#E83A5F",   // dark mode destructive
      600: "#C82D4C",   // light mode destructive
      700: "#9E1D38",
    },

    // DuBois Green — success states
    green: {
      400: "#59C47A",
      500: "#3CA45E",
      600: "#277C43",   // success
      700: "#1A5C30",
    },

    // DuBois Yellow/Amber — warning states
    yellow: {
      500: "#DC6222",
      600: "#BE501E",   // warning
      700: "#8F3C14",
    },

    // ── DuBois Secondary Palette (for tags, badges, categorical color coding) ──
    // Use these for non-semantic categorization. Each has 100 (bg), 500 (icon/border),
    // 700 (text) variants for accessible combinations.

    coral: {
      100: "#FDECE9",
      500: "#E86247",
      700: "#C0411E",
      DEFAULT: "#E86247",
    },
    brown: {
      100: "#F3ECE6",
      500: "#A0694A",
      700: "#7A4930",
      DEFAULT: "#A0694A",
    },
    indigo: {
      100: "#EBF0FD",
      500: "#5B7BE8",
      700: "#3557C7",
      DEFAULT: "#5B7BE8",
    },
    lemon: {
      100: "#FDF9E6",
      500: "#D4A800",
      700: "#9C7C00",
      DEFAULT: "#D4A800",
    },
    lime: {
      100: "#EEF9E6",
      500: "#6CBF3C",
      700: "#4A8C22",
      DEFAULT: "#6CBF3C",
    },
    pink: {
      100: "#FDE8F8",
      500: "#D966C5",
      700: "#B03EA0",
      DEFAULT: "#D966C5",
    },
    purple: {
      100: "#F0EAFD",
      500: "#9B6AE8",
      700: "#7040C8",
      DEFAULT: "#9B6AE8",
    },
    teal: {
      100: "#E5F7F5",
      500: "#2DB0A0",
      700: "#1A8578",
      DEFAULT: "#2DB0A0",
    },
    turquoise: {
      100: "#E5F8FB",
      500: "#22B8CF",
      700: "#138B9E",
      DEFAULT: "#22B8CF",
    },
  },

  // ── Typography ──────────────────────────────────────────────────────────────
  // DuBois base font is 13px, not 16px. All sizes are absolute px.
  fontSize: {
    xs:   ["11px", { lineHeight: "16px" }],
    sm:   ["12px", { lineHeight: "16px" }],
    base: ["13px", { lineHeight: "20px" }],  // DuBois default
    md:   ["13px", { lineHeight: "20px" }],
    lg:   ["18px", { lineHeight: "24px" }],
    xl:   ["22px", { lineHeight: "28px" }],
    "2xl": ["32px", { lineHeight: "40px" }],
  },

  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600", // DuBois "bold" — capped at 600, never 700+
    bold: "600",
  },

  // ── Spacing ─────────────────────────────────────────────────────────────────
  // DuBois spacing uses an 8px base unit. Named tokens:
  // xs=4, sm=8, md=16, lg=24, xl=32, 2xl=48
  // These extend the default Tailwind spacing (1=4px, 2=8px, etc.).
  spacing: {
    "db-xs": "4px",
    "db-sm": "8px",
    "db-md": "16px",
    "db-lg": "24px",
    "db-xl": "32px",
    "db-2xl": "48px",
  },

  // ── Border Radius ────────────────────────────────────────────────────────────
  // DuBois uses tighter radii than shadcn defaults.
  // Override borderRadius entirely so `rounded` = 4px (not 8px).
  borderRadius: {
    none: "0",
    sm: "4px",          // buttons, inputs, badges — borderRadiusSm
    DEFAULT: "4px",     // `rounded` → 4px
    md: "8px",          // cards, modals — borderRadiusMd
    lg: "12px",         // larger surfaces — borderRadiusLg
    xl: "16px",
    "2xl": "20px",
    full: "9999px",     // pills, avatars — borderRadiusFull
  },

  // ── Shadows ──────────────────────────────────────────────────────────────────
  // DuBois shadow scale. More subtle than shadcn defaults.
  boxShadow: {
    xs: "0px 1px 0px 0px rgba(0,0,0,0.05)",
    sm: "0px 2px 3px -1px rgba(0,0,0,0.05), 0px 1px 0px 0px rgba(0,0,0,0.02)",
    DEFAULT: "0px 3px 6px 0px rgba(0,0,0,0.05)",
    md: "0px 3px 6px 0px rgba(0,0,0,0.05)",
    lg: "0px 2px 16px 0px rgba(0,0,0,0.08)",
    xl: "0px 8px 40px 0px rgba(0,0,0,0.13)",
    // Named aliases used in component overrides
    "db-xs": "0px 1px 0px 0px rgba(0,0,0,0.05)",
    "db-sm": "0px 2px 3px -1px rgba(0,0,0,0.05), 0px 1px 0px 0px rgba(0,0,0,0.02)",
    "db-md": "0px 3px 6px 0px rgba(0,0,0,0.05)",
    "db-lg": "0px 2px 16px 0px rgba(0,0,0,0.08)",
    "db-xl": "0px 8px 40px 0px rgba(0,0,0,0.13)",
    // Dark mode variants (slightly brighter for visibility)
    "db-dark-sm": "0px 2px 3px -1px rgba(0,0,0,0.2), 0px 1px 0px 0px rgba(0,0,0,0.1)",
    "db-dark-md": "0px 3px 6px 0px rgba(0,0,0,0.25)",
    "db-dark-lg": "0px 2px 16px 0px rgba(0,0,0,0.35)",
    "db-dark-xl": "0px 8px 40px 0px rgba(0,0,0,0.5)",
  },

  // ── Animation ────────────────────────────────────────────────────────────────
  // DuBois uses faster transitions than shadcn defaults (150ms vs 200ms)
  transitionDuration: {
    DEFAULT: "150ms",
    fast: "100ms",
    slow: "250ms",
  },

  transitionTimingFunction: {
    DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
    "db-ease": "cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

module.exports = duboisExtend;
