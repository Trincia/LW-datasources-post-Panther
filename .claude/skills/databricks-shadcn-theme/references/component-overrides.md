# DuBois Component Overrides for shadcn/ui

Per-component guidance for making shadcn/ui components match the DuBois design system.
Apply these after running `npx shadcn@latest add <component>`.

**Priority legend:**
- **P0** — Must fix for visual correctness. These are the most visible differences.
- **P1** — Important for density and layout consistency.
- **P2** — Polish; noticeable to designers but won't break the experience.

---

## P0 — Button (`components/ui/button.tsx`)

DuBois buttons have tighter sizing, 4px radius, and different variant names than shadcn.

### Sizes
| DuBois Size | Height | shadcn class | Notes |
|-------------|--------|--------------|-------|
| Default     | 32px   | `h-8` (`sm`) | DuBois default — **no 40px size** |
| Small       | 24px   | `h-6` (`xs`) | Add as new "xs" variant |
| Icon default| 32px   | `h-8 w-8` (`icon-sm`) | |
| Icon small  | 24px   | `h-6 w-6` (`icon-xs`) | |

### Variants mapping
| DuBois Variant | Description | shadcn origin |
|----------------|-------------|---------------|
| `primary` | Filled blue — was `default` in shadcn | Renamed |
| `default` | Bordered button — was `outline` in shadcn | Renamed |
| `ghost` | No border, transparent | Unchanged |
| `destructive` | Red background | Unchanged |
| `link` | Blue underline text | Unchanged |

> **Migration:** `variant="default"` → `variant="primary"` · `variant="outline"` → `variant="default"` · `variant="secondary"` → removed (use `variant="default"`)

### Key changes to `buttonVariants` in `button.tsx`

```tsx
const buttonVariants = cva(
  // Base classes — DuBois specific
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:     "bg-primary text-primary-foreground hover:bg-blue-700",
        outline:     "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost:       "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-white hover:bg-red-700",
        link:        "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm:        "h-8 px-3 has-[>svg]:px-2.5",   // 32px — DuBois default
        xs:        "h-6 px-2 has-[>svg]:px-1.5",   // 24px
        "icon-sm": "h-8 w-8",
        "icon-xs": "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",   // 32px is the DuBois default, not 40px
    },
  }
);
```

**Key diffs from shadcn default:**
- `rounded` (4px) instead of `rounded-md` (6px)
- `font-semibold` (600) instead of `font-medium` (500)
- `disabled:opacity-40` instead of `disabled:opacity-50`
- No `default`/`lg` 40px size — DuBois default is 32px (`sm`)
- No `ring-offset` on focus ring (inset)

---

## P0 — Input (`components/ui/input.tsx`)

```tsx
// Replace className in <input>:
className={cn(
  "flex h-8 w-full rounded border border-input bg-background px-3 py-1",
  "text-sm",                                                  // 13px via text-sm
  "placeholder:text-muted-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "aria-[invalid=true]:border-destructive",
  className
)}
```

**Key diffs:**
- `h-8` (32px height) — DuBois uses 32px, not 40px
- No `ring-offset` — DuBois focus ring is inset, no gap
- `border-input` → grey100/grey700 (set by globals.css)
- `opacity-40` disabled state (not 50%)
- `aria-[invalid=true]` for error state border

---

## P0 — Badge (`components/ui/badge.tsx`)

Add DuBois secondary color variants. Each uses light background + darker text.

```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded border border-transparent px-1 py-0 text-sm leading-5 font-normal w-fit whitespace-nowrap shrink-0 gap-1",
  {
    variants: {
      variant: {
        default:     "bg-primary text-primary-foreground",
        secondary:   "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-white",
        // DuBois categorical tag palette — use CSS variables from globals.css
        default_tag: "bg-[var(--tag-bg-default)] text-[var(--tag-text-default)]",
        charcoal:    "bg-[var(--tag-bg-charcoal)] text-[var(--tag-text-charcoal)]",
        coral:       "bg-[var(--tag-bg-coral)] text-[var(--tag-text-coral)]",
        brown:       "bg-[var(--tag-bg-brown)] text-[var(--tag-text-brown)]",
        indigo:      "bg-[var(--tag-bg-indigo)] text-[var(--tag-text-indigo)]",
        lemon:       "bg-[var(--tag-bg-lemon)] text-[var(--tag-text-lemon)]",
        lime:        "bg-[var(--tag-bg-lime)] text-[var(--tag-text-lime)]",
        pink:        "bg-[var(--tag-bg-pink)] text-[var(--tag-text-pink)]",
        purple:      "bg-[var(--tag-bg-purple)] text-[var(--tag-text-purple)]",
        teal:        "bg-[var(--tag-bg-teal)] text-[var(--tag-text-teal)]",
        turquoise:   "bg-[var(--tag-bg-turquoise)] text-[var(--tag-text-turquoise)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);
```

> **Breaking change:** `outline`, `ghost`, and `link` variants were removed. Use `default_tag` or a named color variant (`charcoal`, `coral`, etc.) instead.

**Key diffs from shadcn default:** `rounded` (4px) not `rounded-full`. 13px (`text-sm`) not 12px (`text-xs`). Tag variants use `--tag-*` CSS variables for dark mode support.

---

## P1 — Dialog (`components/ui/dialog.tsx`)

DuBois dialogs use generous 40px padding and remove header/footer dividers.

```tsx
// DialogContent — replace padding and remove border from header area
const DialogContent = React.forwardRef<...>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
        "gap-0 rounded-md border bg-background shadow-db-lg duration-200",  // gap-0, rounded-md (8px)
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));

// DialogHeader — 40px top padding, 20px bottom, NO border-bottom
const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1 px-10 pt-10 pb-5", className)}
    {...props}
  />
);

// DialogFooter — 40px bottom/side padding, NO border-top
const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-10 pb-10 pt-5", className)}
    {...props}
  />
);

// DialogBody (add this custom section between Header and Footer)
const DialogBody = ({ className, ...props }) => (
  <div
    className={cn("px-10 py-0", className)}
    {...props}
  />
);
```

---

## P1 — Table (`components/ui/table.tsx`)

```tsx
// TableRow — add DuBois hover/selected states
const TableRow = React.forwardRef<...>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border transition-colors",
      "hover:bg-[rgba(68,83,95,0.04)] dark:hover:bg-[rgba(189,205,219,0.04)]",  // DuBois row hover
      "data-[state=selected]:bg-[rgba(68,83,95,0.08)] dark:data-[state=selected]:bg-[rgba(189,205,219,0.08)]",
      className
    )}
    {...props}
  />
));

// TableHead — 13px font, medium weight
const TableHead = React.forwardRef<...>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-3 text-left align-middle text-xs font-semibold text-muted-foreground",
      "[&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));

// TableCell — tighter padding, 13px font
const TableCell = React.forwardRef<...>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-3 py-2 align-middle text-sm",   // py-2 = 8px, tighter than shadcn's py-4
      "[&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
```

---

## P1 — Alert (`components/ui/alert.tsx`)

DuBois alerts use a **full border** with a light tinted background per severity. Description text inherits the variant color — do NOT add `text-muted-foreground` to `AlertDescription`.

Requires these CSS vars in `globals.css` `:root` and `.dark`:
```css
--border-danger: #fbd0d8;   --background-danger: #fff5f7;
--border-warning: #f8d4a5;  --background-warning: #fff9eb;
--border-success: #a3d9b6;  --background-success: #f0faf4;
```

```tsx
const alertVariants = cva(
  // Full border, tinted bg, icon grid layout, 4px radius
  "relative w-full rounded border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default:     "border-border bg-secondary text-foreground",
        info:        "border-border bg-secondary text-foreground [&>svg]:text-primary",
        destructive: "border-[var(--border-danger)] bg-[var(--background-danger)] text-destructive [&>svg]:text-destructive",
        warning:     "border-[var(--border-warning)] bg-[var(--background-warning)] text-[var(--warning)] [&>svg]:text-[var(--warning)]",
        success:     "border-[var(--border-success)] bg-[var(--background-success)] text-[var(--success)] [&>svg]:text-[var(--success)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

// AlertDescription — no text-muted-foreground, inherits variant color
function AlertDescription({ className, ...props }) {
  return (
    <div className={cn("col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed", className)} {...props} />
  );
}
```

---

## P2 — Tabs (`components/ui/tabs.tsx`)

DuBois has two tab styles. Add a `variant` prop to support both:

- **`variant="line"`** — blue bottom indicator underline style (most common in Databricks UIs)
- **`variant="default"`** — contained/pill style with background highlight

```tsx
// TabsList — supports variant prop
const TabsList = React.forwardRef<..., { variant?: "default" | "line" }>(
  ({ className, variant = "default", ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        variant === "line"
          ? "inline-flex items-center border-b border-border w-full h-auto gap-0 bg-transparent p-0 rounded-none"
          : "inline-flex h-9 items-center justify-center rounded bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
);

// TabsTrigger — line variant uses bottom indicator
const TabsTrigger = React.forwardRef<..., { variant?: "default" | "line" }>(
  ({ className, variant = "default", ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-40",
        variant === "line"
          ? "px-4 py-2 font-normal text-muted-foreground hover:text-foreground border-b-2 border-transparent -mb-px data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:border-primary"
          : "rounded px-3 py-1 font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  )
);
```

Usage:
```tsx
<Tabs>
  <TabsList variant="line">
    <TabsTrigger variant="line" value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger variant="line" value="tab2">Tab 2</TabsTrigger>
  </TabsList>
</Tabs>
```

---

## P2 — Tooltip (`components/ui/tooltip.tsx`)

DuBois tooltips: grey800 bg, 12px font, no arrow.

```tsx
const TooltipContent = React.forwardRef<...>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded px-3 py-1.5 text-xs",
      "bg-grey-800 text-white dark:bg-grey-100 dark:text-grey-800",   // DuBois: dark bg in light mode
      "animate-in fade-in-0 zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
```

---

## P2 — Card (`components/ui/card.tsx`)

DuBois cards: 8px radius, `bg-background` (white, not card), 24px uniform padding (`p-6`), subtle shadow. Child sections (header/content/footer) have no extra padding — `p-6` on Card itself provides it.

```tsx
function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-background text-foreground flex flex-col gap-4 rounded-md border p-6 shadow-[var(--shadow-db-sm)]",
        className
      )}
      {...props}
    />
  );
}

// CardHeader — no extra padding (Card provides p-6)
function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

// CardContent — no padding
function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn("", className)} {...props} />;
}

// CardFooter — no padding
function CardFooter({ className, ...props }) {
  return (
    <div data-slot="card-footer" className={cn("flex items-center [.border-t]:pt-6", className)} {...props} />
  );
}
```

---

## P1 — Select (`components/ui/select.tsx`)

DuBois Select has the same height and radius as Input — 32px, 4px radius, no size variants.

```tsx
// SelectTrigger — match Input height
function SelectTrigger({ className, ...props }) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-8 w-full items-center justify-between rounded border border-input bg-background px-3 py-1 text-sm",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "[&>span]:line-clamp-1",
        className
      )}
      {...props}
    />
  );
}
```

---

## Component Override Summary

| Priority | Component | Done? | Key changes |
|----------|-----------|-------|-------------|
| P0 | `button.tsx` | ☑ | 4px radius, 32px default / 24px xs, font-semibold, no 40px size |
| P0 | `input.tsx` | ☑ | 32px h, 13px font, 4px radius, inset focus ring |
| P0 | `badge.tsx` | ☑ | 4px radius (`rounded`), 9 secondary color variants |
| P1 | `dialog.tsx` | ☑ | 40px padding, 8px radius, no header/footer borders |
| P1 | `select.tsx` | ☑ | 32px height, 4px radius, no size variants |
| P1 | `table.tsx` | ☑ | DuBois hover/selected colors, tighter cells |
| P1 | `alert.tsx` | ☑ | Full border + tinted bg per variant, description inherits variant color |
| P2 | `tabs.tsx` | ☑ | `variant="line"` for blue underline style |
| P2 | `tooltip.tsx` | ☑ | grey800 bg, 12px font |
| P2 | `card.tsx` | ☑ | 8px radius, bg-background, p-6 uniform, db-sm shadow |

---

## Tips for Applying Overrides with Claude Code

Ask Claude one component at a time with this prompt pattern:

```
Open src/components/ui/button.tsx and apply the DuBois overrides from
.claude/skills/databricks-shadcn-theme/references/component-overrides.md.
Read the component-overrides.md file first, then update button.tsx.
```

This ensures Claude reads the reference file and applies the exact changes, rather than
guessing from memory.
