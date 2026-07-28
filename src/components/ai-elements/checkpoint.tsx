"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LucideProps } from "lucide-react";
import { FlagIcon } from "lucide-react";
import type { ComponentProps, HTMLAttributes } from "react";

export type CheckpointProps = HTMLAttributes<HTMLDivElement>;

export const Checkpoint = ({
  className,
  children,
  ...props
}: CheckpointProps) => (
  <div
    className={cn(
      "flex w-full items-center justify-between gap-2 text-muted-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type CheckpointLabelProps = HTMLAttributes<HTMLDivElement>;

export const CheckpointLabel = ({
  className,
  children,
  ...props
}: CheckpointLabelProps) => (
  <div
    className={cn("flex items-center gap-1.5 text-sm", className)}
    {...props}
  >
    {children}
  </div>
);

export type CheckpointIconProps = LucideProps;

export const CheckpointIcon = ({
  className,
  children,
  ...props
}: CheckpointIconProps) =>
  children ?? (
    <FlagIcon className={cn("size-4 shrink-0", className)} {...props} />
  );

export type CheckpointActionsProps = HTMLAttributes<HTMLDivElement>;

export const CheckpointActions = ({
  className,
  children,
  ...props
}: CheckpointActionsProps) => (
  <div className={cn("flex items-center gap-1", className)} {...props}>
    {children}
  </div>
);

export type CheckpointTriggerProps = ComponentProps<typeof Button> & {
  tooltip?: string;
};

export const CheckpointTrigger = ({
  children,
  variant = "ghost",
  size = "sm",
  tooltip,
  ...props
}: CheckpointTriggerProps) =>
  tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size={size} type="button" variant={variant} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start" side="bottom">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  ) : (
    <Button size={size} type="button" variant={variant} {...props}>
      {children}
    </Button>
  );
