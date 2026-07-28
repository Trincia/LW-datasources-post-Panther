"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { FileTextIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single source icon descriptor: either a favicon URL or a ReactNode icon. */
export type SourceIcon = { favicon?: string; icon?: ReactNode; className?: string };

// ─── Sources (root) ───────────────────────────────────────────────────────────

export type SourcesProps = ComponentProps<"div">;

export const Sources = ({ className, ...props }: SourcesProps) => (
  <Collapsible className={cn("not-prose relative", className)} {...props} />
);

// ─── SourcesTrigger ──────────────────────────────────────────────────────────

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  /** Total source count — drives the label text */
  count: number;
  /** Up to 3 source icons shown as stacked avatars */
  icons?: SourceIcon[];
};

export const SourcesTrigger = ({
  className,
  count,
  icons = [],
  children,
  ...props
}: SourcesTriggerProps) => {
  const visibleIcons = icons.slice(0, 3);

  return (
    <CollapsibleTrigger
      className={cn(
        "inline-flex items-center gap-1 rounded-full pl-px pr-2 py-px",
        "text-xs text-muted-foreground transition-colors",
        "hover:bg-primary/[0.08] data-[state=open]:bg-primary/[0.16]",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          {/* Stacked favicon avatars */}
          {visibleIcons.length > 0 && (
            <div className="flex items-center pr-1">
              {visibleIcons.map((src, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-background bg-secondary",
                    i > 0 && "-ml-1",
                    src.className
                  )}
                >
                  {src.favicon ? (
                    <img
                      src={src.favicon}
                      alt=""
                      className="h-4 w-4 object-contain"
                    />
                  ) : src.icon ? (
                    src.icon
                  ) : (
                    <FileTextIcon className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          )}
          <span className="leading-5">
            {count === 1 ? "1 source" : `${count} sources`}
          </span>
        </>
      )}
    </CollapsibleTrigger>
  );
};

// ─── SourcesContent ───────────────────────────────────────────────────────────

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export const SourcesContent = ({
  className,
  ...props
}: SourcesContentProps) => (
  <CollapsibleContent
    className={cn(
      "absolute top-full left-0 z-50 mt-1 flex w-max flex-col gap-px",
      "rounded-md border border-border bg-background p-1 shadow-[var(--shadow-db-sm)]",
      "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
      className
    )}
    {...props}
  />
);

// ─── Source ───────────────────────────────────────────────────────────────────

export type SourceProps = ComponentProps<"a"> & {
  favicon?: string;
  icon?: ReactNode;
};

export const Source = ({
  href,
  title,
  favicon,
  icon,
  children,
  className,
  ...props
}: SourceProps) => (
  <a
    className={cn(
      "flex items-center gap-2 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
      className
    )}
    href={href}
    rel="noreferrer"
    target="_blank"
    {...props}
  >
    {children ?? (
      <>
        <div className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-sm">
          {favicon ? (
            <img src={favicon} alt="" className="h-4 w-4 object-contain" />
          ) : icon ? (
            icon
          ) : (
            <FileTextIcon className="h-3.5 w-3.5" />
          )}
        </div>
        <span className="truncate">{title}</span>
      </>
    )}
  </a>
);
