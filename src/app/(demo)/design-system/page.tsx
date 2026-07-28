"use client";

import { useState, useEffect } from "react";
import { AiElementsTab } from "./ai-elements-tab";
import {
  Settings,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  X,
} from "lucide-react";
import {
  SearchIcon,
  ChevronDownIcon,
  InfoFillIcon,
  DangerFillIcon,
  WarningFillIcon,
} from "@/components/icons";
import Link from "next/link";
import { TopBar } from "@/components/shell/TopBar";
import { Sidebar } from "@/components/shell/Sidebar";
import { PageHeader } from "@/components/shell/PageHeader";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Empty } from "@/components/ui/empty";
import { SegmentedControl, SegmentedItem } from "@/components/ui/segmented-control";
import { ListItem } from "@/components/ui/list-item";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";

import { Hint } from "@/components/ui/hint";
import { Slider } from "@/components/ui/slider";
import { RadioTile, RadioTileGroup } from "@/components/ui/radio-tile";
import { Stepper } from "@/components/ui/stepper";
import { SplitButton } from "@/components/ui/split-button";
import { NotebookCell } from "@/components/ui/notebook-cell";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Tree, type TreeNode as TreeNodeType } from "@/components/ui/tree";

import * as Icons from "@/components/icons";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-6">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function DemoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

// ─── Color Swatch ─────────────────────────────────────────────────────────────

function Swatch({ color, label, hex, cssVar }: { color: string; label: string; hex: string; cssVar?: string }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[80px]">
      <div
        className="h-10 w-full rounded border border-black/10"
        style={{ background: color }}
      />
      <div>
        <div className="text-xs font-semibold text-foreground">{label}</div>
        <div className="text-hint text-muted-foreground font-mono">{hex}</div>
        {cssVar && <div className="text-hint text-muted-foreground font-mono truncate">{cssVar}</div>}
      </div>
    </div>
  );
}

// ─── Table sample data ────────────────────────────────────────────────────────

const tableData = [
  { name: "main", type: "Notebook", status: "Running",  updated: "2 min ago" },
  { name: "etl-pipeline", type: "Pipeline",  status: "Success",  updated: "1 hr ago" },
  { name: "analytics", type: "Notebook", status: "Idle",     updated: "3 hrs ago" },
  { name: "model-train", type: "Job",      status: "Failed",   updated: "5 hrs ago" },
  { name: "data-ingest", type: "Pipeline",  status: "Running",  updated: "12 min ago" },
];

const statusColor: Record<string, string> = {
  Running: "teal",
  Success: "lime",
  Idle:    "secondary",
  Failed:  "destructive",
};

// ─── Tree sample data ─────────────────────────────────────────────────────────

const DEMO_TREE: TreeNodeType[] = [
  {
    id: "notebooks",
    label: "Notebooks",
    icon: Icons.FolderIcon,
    defaultExpanded: true,
    children: [
      { id: "nb-1", label: "analysis.py", icon: Icons.NotebookIcon },
      { id: "nb-2", label: "etl_pipeline.sql", icon: Icons.QueryEditorIcon },
    ],
  },
  { id: "queries", label: "Queries", icon: Icons.FolderIcon },
  { id: "dashboards", label: "Dashboards", icon: Icons.FolderIcon },
]

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState("dubois");
  const [iconSearch, setIconSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [segTab, setSegTab] = useState("table");
  const [segTime, setSegTime] = useState("day");
  const [radioTile, setRadioTile] = useState("standard");
  const [sliderVal, setSliderVal] = useState([40]);
  const [treeSelected, setTreeSelected] = useState("nb-1");

  useEffect(() => {
    if (window.location.hash === "#aiElements") setActiveTab("ai-elements");
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value === "ai-elements" ? "aiElements" : "";
  };

  const iconEntries = Object.entries(Icons) as [string, React.ComponentType<{ size?: number; className?: string }>][];
  const filteredIcons = iconEntries.filter(([name]) =>
    name.toLowerCase().includes(iconSearch.toLowerCase())
  );

  return (
    <div>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList variant="line" className="mb-8">
          <TabsTrigger value="dubois">DuBois</TabsTrigger>
          <TabsTrigger value="ai-elements">AI Elements</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-elements">
          <AiElementsTab />
        </TabsContent>

        <TabsContent value="dubois">
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-foreground">
            Databricks UI — Component Reference
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            DuBois design tokens applied to shadcn/ui. Browse components and copy patterns.
          </p>
        </div>


        <Section id="colors" title="Colors" description="DuBois primitive palette. Always use semantic CSS variables in components, not raw hex.">
          <div className="flex flex-col gap-10">

            {/* ── Full ramps ── */}
            {[
              {
                label: "Blue",
                stops: [
                  { step: "100", hex: "#F0F8FF" },
                  { step: "200", hex: "#D7EDFE" },
                  { step: "300", hex: "#BAE1FC" },
                  { step: "400", hex: "#8ACAFF" },
                  { step: "500", hex: "#4299E0" },
                  { step: "600", hex: "#2272B4", tag: "--primary" },
                  { step: "700", hex: "#0E538B" },
                  { step: "800", hex: "#04355D" },
                ],
              },
              {
                label: "Neutral (warm grey)",
                stops: [
                  { step: "050", hex: "#F7F7F7", tag: "--secondary/--muted" },
                  { step: "100", hex: "#EBEBEB", tag: "--border" },
                  { step: "200", hex: "#D8D8D8" },
                  { step: "300", hex: "#CBCBCB", tag: "--input" },
                  { step: "350", hex: "#A2A2A2" },
                  { step: "400", hex: "#939393" },
                  { step: "500", hex: "#6F6F6F", tag: "--muted-fg" },
                  { step: "600", hex: "#525252" },
                  { step: "650", hex: "#424242" },
                  { step: "700", hex: "#262626" },
                  { step: "800", hex: "#161616", tag: "--foreground" },
                ],
              },
              {
                label: "Grey (blue-tinted)",
                stops: [
                  { step: "050", hex: "#F6F7F9" },
                  { step: "100", hex: "#E8ECF0" },
                  { step: "200", hex: "#D1D9E1" },
                  { step: "300", hex: "#C0CDD8" },
                  { step: "350", hex: "#92A4B3" },
                  { step: "400", hex: "#8396A5" },
                  { step: "500", hex: "#5F7281" },
                  { step: "600", hex: "#445461" },
                  { step: "650", hex: "#37444F", tag: "dark --input" },
                  { step: "700", hex: "#1F272D", tag: "dark --secondary" },
                  { step: "800", hex: "#11171C", tag: "dark --background" },
                ],
              },
              {
                label: "Red",
                stops: [
                  { step: "100", hex: "#FFF5F7" },
                  { step: "200", hex: "#FDE2E8" },
                  { step: "300", hex: "#FBD0D8" },
                  { step: "400", hex: "#F792A6" },
                  { step: "500", hex: "#E65B77", tag: "dark --destructive" },
                  { step: "600", hex: "#C82D4C", tag: "--destructive" },
                  { step: "700", hex: "#9E102C" },
                  { step: "800", hex: "#630316" },
                ],
              },
              {
                label: "Green",
                stops: [
                  { step: "100", hex: "#F3FCF6" },
                  { step: "200", hex: "#D4F7DF" },
                  { step: "300", hex: "#B1ECC5" },
                  { step: "400", hex: "#8DDDA8" },
                  { step: "500", hex: "#3BA65E", tag: "dark --success" },
                  { step: "600", hex: "#277C43", tag: "--success" },
                  { step: "700", hex: "#115026" },
                  { step: "800", hex: "#093919" },
                ],
              },
              {
                label: "Yellow",
                stops: [
                  { step: "100", hex: "#FFF9EB" },
                  { step: "200", hex: "#FCEACA" },
                  { step: "300", hex: "#F8D4A5" },
                  { step: "400", hex: "#F2BE88" },
                  { step: "500", hex: "#DE7921", tag: "dark --warning" },
                  { step: "600", hex: "#BE501E", tag: "--warning" },
                  { step: "700", hex: "#93320B" },
                  { step: "800", hex: "#5F1B02" },
                ],
              },
            ].map(({ label, stops }) => (
              <div key={label} className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                <div className="flex gap-1">
                  {stops.map(({ step, hex, tag }) => (
                    <div key={step} className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div
                        className="h-8 w-full rounded-sm border border-black/[0.06]"
                        style={{ background: hex }}
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-hint font-semibold text-foreground font-mono leading-none">{step}</span>
                        <span className="text-hint text-muted-foreground font-mono leading-none">{hex}</span>
                        {tag && <span className="text-hint text-primary font-mono leading-none truncate">{tag}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* ── Brand & misc ── */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Brand &amp; Misc</span>
              <div className="flex gap-4 flex-wrap">
                {[
                  { label: "brand-red", hex: "#FF3621", tag: "--color-brand-red" },
                  { label: "star",      hex: "#FACB66", tag: "--color-star" },
                ].map(({ label, hex, tag }) => (
                  <div key={label} className="flex flex-col gap-1.5 w-20">
                    <div className="h-8 w-full rounded-sm border border-black/[0.06]" style={{ background: hex }} />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-hint font-semibold text-foreground font-mono">{label}</span>
                      <span className="text-hint text-muted-foreground font-mono">{hex}</span>
                      <span className="text-hint text-primary font-mono">{tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Secondary palette — 3 stops each ── */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Secondary — Tags &amp; Categorical</span>
              <div className="flex flex-col gap-3">
                {[
                  { name: "coral",     stops: ["#FDECE9", "#E86247", "#C0411E"] },
                  { name: "brown",     stops: ["#F3ECE6", "#A0694A", "#7A4930"] },
                  { name: "indigo",    stops: ["#EBF0FD", "#5B7BE8", "#3557C7"] },
                  { name: "lemon",     stops: ["#FDF9E6", "#D4A800", "#9C7C00"] },
                  { name: "lime",      stops: ["#EEF9E6", "#6CBF3C", "#4A8C22"] },
                  { name: "pink",      stops: ["#FDE8F8", "#D966C5", "#B03EA0"] },
                  { name: "purple",    stops: ["#F0EAFD", "#9B6AE8", "#7040C8"] },
                  { name: "teal",      stops: ["#E5F7F5", "#2DB0A0", "#1A8578"] },
                  { name: "turquoise", stops: ["#E5F8FB", "#22B8CF", "#138B9E"] },
                ].map(({ name, stops }) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-hint text-muted-foreground font-mono w-16 shrink-0">{name}</span>
                    <div className="flex gap-1">
                      {stops.map((hex, i) => {
                        const step = i === 0 ? "100" : i === 1 ? "500" : "700"
                        return (
                          <div key={hex} className="flex flex-col gap-1 items-center">
                            <div
                              className="h-7 w-14 rounded-sm border border-black/[0.06]"
                              style={{ background: hex }}
                            />
                            <span className="text-hint text-muted-foreground font-mono">{step}</span>
                            <span className="text-hint text-muted-foreground font-mono">{hex}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </Section>


        <Section id="typography" title="Typography" description="Base: 13px / 20px line-height. Bold = 600 (never 700). System font (SF Pro on macOS).">
          <div className="flex flex-col gap-4 border border-border rounded-md p-6">
            <div className="flex items-baseline gap-4 border-b border-border pb-4">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">h1 / 32px</span>
              <h1>Databricks Platform</h1>
            </div>
            <div className="flex items-baseline gap-4 border-b border-border pb-4">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">h2 / 22px</span>
              <h2>Workspace Overview</h2>
            </div>
            <div className="flex items-baseline gap-4 border-b border-border pb-4">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">h3 / 18px</span>
              <h3>Catalog Explorer</h3>
            </div>
            <div className="flex items-baseline gap-4 border-b border-border pb-4">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">h4 / 15px</span>
              <h4>Table Properties</h4>
            </div>
            <div className="flex items-baseline gap-4 border-b border-border pb-4">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">body / 13px</span>
              <p>The quick brown fox jumps over the lazy dog. Base font size is 13px with 20px line-height.</p>
            </div>
            <div className="flex items-baseline gap-4 border-b border-border pb-4">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">hint / 12px</span>
              <p className="text-hint text-muted-foreground">Secondary metadata, timestamps, helper text</p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">code / 13px</span>
              <code>SELECT * FROM catalog.schema.table</code>
            </div>
          </div>
        </Section>

        {/* ── Spacing ────────────────────────────────────────────────────── */}

        <Section id="spacing" title="Spacing" description="Base unit: 8px. xs=4px · sm=8px · md=16px · lg=24px · xl=32px">
          <div className="flex flex-col gap-3">
            {[
              { token: "xs",  px: 4  },
              { token: "sm",  px: 8  },
              { token: "md",  px: 16 },
              { token: "lg",  px: 24 },
              { token: "xl",  px: 32 },
              { token: "2xl", px: 48 },
            ].map(({ token, px }) => (
              <div key={token} className="flex items-center gap-4">
                <span className="w-8 text-xs text-muted-foreground font-mono">{token}</span>
                <div
                  className="h-6 bg-primary/20 rounded border-l-2 border-primary"
                  style={{ width: px }}
                />
                <span className="text-xs text-muted-foreground">{px}px</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Buttons ────────────────────────────────────────────────────── */}

        <Section id="icons" title="Icons" description={`${iconEntries.length} Databricks-specific DuBois icons. All 16×16, currentColor.`}>
          <div className="mb-3">
            <Input
              placeholder="Search icons..."
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
          {filteredIcons.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No icons match &ldquo;{iconSearch}&rdquo;</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-1">
              {filteredIcons.map(([name, Icon]) => (
                <Tooltip key={name}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-2 rounded p-3 hover:bg-secondary cursor-default transition-colors">
                      <Icon size={16} className="text-foreground shrink-0" />
                      <span className="text-hint text-muted-foreground text-center leading-tight truncate w-full text-center">
                        {name.replace("Icon", "")}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{name}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </Section>

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}

        <Section id="buttons" title="Buttons" description="DuBois heights: 32px (sm, default) · 24px (xs). All use 4px radius, weight 600.">
          <div className="flex flex-col gap-6">
            <DemoRow label="Primary">
              <Button variant="primary">Primary</Button>
              <Button variant="primary" size="xs">Primary xs</Button>
              <Button variant="primary" size="icon-sm"><Plus className="h-4 w-4" /></Button>
              <Button variant="primary" size="icon-xs"><Plus className="h-4 w-4" /></Button>
            </DemoRow>
            <DemoRow label="Default">
              <Button variant="default">Default</Button>
              <Button variant="default" size="xs">Default xs</Button>
              <Button variant="default" size="icon-sm"><Settings className="h-4 w-4" /></Button>
            </DemoRow>
            <DemoRow label="Ghost">
              <Button variant="ghost">Ghost</Button>
              <Button variant="ghost" size="xs">Ghost xs</Button>
              <Button variant="ghost" size="icon-sm"><Trash2 className="h-4 w-4" /></Button>
            </DemoRow>
            <DemoRow label="Destructive">
              <Button variant="destructive">Delete</Button>
              <Button variant="destructive" size="sm">Delete sm</Button>
            </DemoRow>
            <DemoRow label="Link">
              <Button variant="link">Link button</Button>
            </DemoRow>
            <DemoRow label="Leading icon">
              <Button variant="primary"><Plus className="h-4 w-4" />New notebook</Button>
              <Button variant="default"><SearchIcon size={16} />Search</Button>
            </DemoRow>
            <DemoRow label="Trailing icon (menu)">
              <Button variant="primary">Actions<ChevronDownIcon size={16} /></Button>
              <Button variant="default">Options<ChevronDownIcon size={16} /></Button>
            </DemoRow>
            <DemoRow label="Both icons">
              <Button variant="primary"><Plus className="h-4 w-4" />New<ChevronDownIcon size={16} /></Button>
              <Button variant="default"><SearchIcon size={16} />Search<ChevronDownIcon size={16} /></Button>
            </DemoRow>
            <DemoRow label="States">
              <Button disabled>Disabled</Button>
              <Button variant="default" disabled>Disabled</Button>
              <Button variant="ghost" disabled>Disabled</Button>
            </DemoRow>
          </div>
        </Section>

        {/* ── Form Controls ──────────────────────────────────────────────── */}
        <Separator className="my-8" />

        {/* ── Split Button ───────────────────────────────────────────────── */}
        <Section id="split-button" title="Split Button" description="Primary action with attached dropdown arrow. Used in list-page toolbars (e.g. Jobs &amp; Pipelines). Import from @/components/ui/split-button.">
          <div className="flex flex-col gap-5">
            <Group label="Variants">
              <div className="flex flex-wrap items-center gap-3">
                <SplitButton variant="primary">Create</SplitButton>
                <SplitButton variant="default">Options</SplitButton>
                <SplitButton variant="destructive">Delete</SplitButton>
              </div>
            </Group>
            <Group label="Disabled">
              <SplitButton disabled>Create</SplitButton>
            </Group>
          </div>
        </Section>


        <Section id="forms" title="Form Controls" description="32px input height (h-8), 4px radius, 2px solid focus ring, hover border turns blue.">
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <Group label="Text Input">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="demo-input">Cluster name</Label>
                  <Input id="demo-input" placeholder="my-cluster" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="demo-disabled">Disabled</Label>
                  <Input id="demo-disabled" placeholder="Cannot edit" disabled />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="demo-error">Error state</Label>
                  <Input id="demo-error" placeholder="Invalid value" aria-invalid />
                  <span className="text-xs text-destructive">This field is required</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="demo-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="demo-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="pr-9"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </Group>
            </div>

            <div className="flex flex-col gap-4">
              <Group label="Select">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="demo-select">Node type</Label>
                  <Select>
                    <SelectTrigger id="demo-select">
                      <SelectValue placeholder="Select node type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard_DS3_v2</SelectItem>
                      <SelectItem value="memory">Standard_E8s_v3</SelectItem>
                      <SelectItem value="compute">Standard_F8s_v2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Disabled</Label>
                  <Select disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Cannot select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="x">Option</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Group>

              <Group label="Textarea">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="demo-textarea">Description</Label>
                  <Textarea id="demo-textarea" placeholder="Add a description..." rows={3} />
                </div>
              </Group>

              <Group label="Checkbox">
                <div className="flex flex-col gap-2">
                  {["Enable autoscaling", "Spot instances", "Single node"].map((label) => (
                    <div key={label} className="flex items-center gap-2">
                      <Checkbox id={label} />
                      <Label htmlFor={label} className="font-normal cursor-pointer">{label}</Label>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Checkbox id="disabled-check" disabled />
                    <Label htmlFor="disabled-check" className="font-normal opacity-40">Disabled option</Label>
                  </div>
                </div>
              </Group>

              <Group label="Radio">
                <div className="flex flex-col gap-2">
                  <RadioGroup defaultValue="standard">
                    {["Standard", "Single node", "High concurrency"].map((label) => (
                      <div key={label} className="flex items-center gap-2">
                        <RadioGroupItem id={`radio-${label}`} value={label.toLowerCase().replace(/ /g, "-")} />
                        <Label htmlFor={`radio-${label}`} className="font-normal cursor-pointer">{label}</Label>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="radio-disabled" value="disabled" disabled />
                      <Label htmlFor="radio-disabled" className="font-normal opacity-40">Disabled option</Label>
                    </div>
                  </RadioGroup>
                </div>
              </Group>

              <Group label="Switch">
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Auto-termination", id: "sw1", checked: true },
                    { label: "Spot fallback", id: "sw2", checked: false },
                  ].map(({ label, id, checked }) => (
                    <div key={id} className="flex items-center justify-between">
                      <Label htmlFor={id} className="font-normal cursor-pointer">{label}</Label>
                      <Switch id={id} defaultChecked={checked} />
                    </div>
                  ))}
                </div>
              </Group>
            </div>
          </div>
        </Section>

        {/* ── Badges ─────────────────────────────────────────────────────── */}
        <Separator className="my-8" />

        {/* ── Hint ──────────────────────────────────────────────────────────── */}
        <Section id="hint" title="Hint" description="Helper text below form fields — 12px/16px, muted-foreground. Import from @/components/ui/hint.">
          <div className="flex flex-col gap-6">
            <Group label="Above input (DuBois: Hint precedes the control)">
              {/* DuBois pattern: label+hint flush (no gap), then control (gap-2 / 8px) */}
              <div className="flex flex-col gap-2 max-w-xs">
                <div className="flex flex-col">
                  <Label htmlFor="hint-demo">Cluster name</Label>
                  <Hint>Must be lowercase and contain no spaces.</Hint>
                </div>
                <Input id="hint-demo" placeholder="my-cluster" />
              </div>
            </Group>
            <Group label="Above select">
              <div className="flex flex-col gap-2 max-w-xs">
                <div className="flex flex-col">
                  <Label>Runtime version</Label>
                  <Hint>LTS versions receive security patches for 2 years.</Hint>
                </div>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select a version" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14">14.3 LTS (Scala 2.12)</SelectItem>
                    <SelectItem value="15">15.4 LTS (Scala 2.12)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Group>
          </div>
        </Section>

        <Separator className="my-8" />

        {/* ── Slider ────────────────────────────────────────────────────────── */}
        <Section id="slider" title="Slider" description="Range input — Radix-based, 3px track, 20px thumb, primary fill. Import from @/components/ui/slider.">
          <div className="flex flex-col gap-6">
            <Group label="Default">
              <div className="flex flex-col gap-4 max-w-xs">
                <Slider
                  value={sliderVal}
                  onValueChange={setSliderVal}
                  min={0}
                  max={100}
                />
                <p className="text-hint text-muted-foreground">Value: {sliderVal[0]}</p>
              </div>
            </Group>
            <Group label="Disabled">
              <div className="max-w-xs">
                <Slider defaultValue={[60]} disabled />
              </div>
            </Group>
          </div>
        </Section>

        <Separator className="my-8" />

        {/* ── Radio Tile ────────────────────────────────────────────────────── */}
        <Section id="radio-tile" title="Radio Tile" description="Card-style radio button with optional icon and description. Import from @/components/ui/radio-tile.">
          <div className="flex flex-col gap-6">
            <Group label="Basic">
              <RadioTileGroup value={radioTile} onValueChange={setRadioTile} className="gap-2">
                <RadioTile value="standard" label="Standard" description="General purpose cluster for all workloads." />
                <RadioTile value="single" label="Single node" description="Lightweight driver-only cluster." />
                <RadioTile value="high-concurrency" label="High concurrency" description="Optimized for concurrent SQL queries." />
              </RadioTileGroup>
            </Group>
            <Group label="Disabled">
              <RadioTileGroup value="standard">
                <RadioTile value="standard" label="Standard" disabled />
                <RadioTile value="single" label="Single node" disabled />
              </RadioTileGroup>
            </Group>
          </div>
        </Section>


        <Section id="segmented" title="Segmented Control" description="Toggle button group for exclusive selection. Active item: blue tint bg + border.">
          <div className="flex flex-col gap-5">
            <Group label="Default">
              <SegmentedControl value={segTab} onValueChange={setSegTab}>
                <SegmentedItem value="table">Table</SegmentedItem>
                <SegmentedItem value="schema">Schema</SegmentedItem>
                <SegmentedItem value="lineage">Lineage</SegmentedItem>
              </SegmentedControl>
            </Group>
            <Group label="Time range">
              <SegmentedControl value={segTime} onValueChange={setSegTime}>
                <SegmentedItem value="day">Day</SegmentedItem>
                <SegmentedItem value="week">Week</SegmentedItem>
                <SegmentedItem value="month">Month</SegmentedItem>
                <SegmentedItem value="custom">Custom</SegmentedItem>
              </SegmentedControl>
            </Group>
          </div>
        </Section>

        {/* ── ListItem ───────────────────────────────────────────────────── */}

        <Section id="alerts" title="Alerts" description="Full border with tinted background. Three severity levels plus a neutral default.">
          <div className="flex flex-col gap-3">
            <Alert>
              <InfoFillIcon />
              <AlertTitle>Cluster is starting</AlertTitle>
              <AlertDescription>Your cluster is being provisioned. This may take a few minutes.</AlertDescription>
            </Alert>
            <Alert variant="warning">
              <WarningFillIcon />
              <AlertTitle>High memory usage</AlertTitle>
              <AlertDescription>Cluster memory is at 87%. Consider scaling up or optimizing queries.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <DangerFillIcon />
              <AlertTitle>Job failed</AlertTitle>
              <AlertDescription>Task "transform_data" failed after 3 retries. Check the logs for details.</AlertDescription>
            </Alert>
            <Alert variant="destructive" action={<Button size="sm" variant="default">View logs</Button>}>
              <DangerFillIcon />
              <AlertTitle>Job failed</AlertTitle>
              <AlertDescription>Action below description.</AlertDescription>
            </Alert>
            <Alert variant="destructive" rightAction={<Button size="sm" variant="default">View logs</Button>} onDismiss={() => {}}>
              <DangerFillIcon />
              <AlertTitle>Job failed</AlertTitle>
              <AlertDescription>Action on the right, with dismiss.</AlertDescription>
            </Alert>
          </div>
        </Section>

        {/* ── Tables ─────────────────────────────────────────────────────── */}

        <Section id="spinner" title="Spinner" description="Loading indicator. Three sizes: small (16px) · default (24px) · large (32px). Defaults to muted-foreground; use inheritColor for parent color.">
          <div className="flex flex-col gap-5">
            <Group label="Sizes">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="small" />
                  <span className="text-hint text-muted-foreground">small</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="default" />
                  <span className="text-hint text-muted-foreground">default</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="large" />
                  <span className="text-hint text-muted-foreground">large</span>
                </div>
              </div>
            </Group>
            <Group label="Color inherit">
              <div className="flex items-center gap-4">
                <span className="text-primary flex items-center gap-1.5 text-sm">
                  <Spinner size="small" inheritColor />
                  Loading…
                </span>
                <span className="text-destructive flex items-center gap-1.5 text-sm">
                  <Spinner size="small" inheritColor />
                  Retrying…
                </span>
              </div>
            </Group>
            <Group label="In a button">
              <div className="flex items-center gap-2">
                <Button disabled>
                  <Spinner size="small" inheritColor />
                  Saving…
                </Button>
                <Button variant="default" disabled>
                  <Spinner size="small" inheritColor />
                  Loading
                </Button>
              </div>
            </Group>
          </div>
        </Section>

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        <Separator className="my-8" />

        {/* ── Progress ───────────────────────────────────────────────────── */}
        <Section id="progress" title="Progress" description="Linear progress bar. Primary fill, 8px (h-2) track height. Import from @/components/ui/progress.">
          <div className="flex flex-col gap-5 max-w-sm">
            <Group label="Values">
              <div className="flex flex-col gap-3">
                <Progress value={20} />
                <Progress value={50} />
                <Progress value={80} />
                <Progress value={100} />
              </div>
            </Group>
            <Group label="With label">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Uploading…</span>
                  <span className="text-hint text-muted-foreground">65%</span>
                </div>
                <Progress value={65} />
              </div>
            </Group>
          </div>
        </Section>

        <Separator className="my-8" />

        {/* ── Stepper ───────────────────────────────────────────────────────── */}
        <Section id="stepper" title="Stepper" description="Step progress indicator with 5 statuses: upcoming · completed · loading · error · warning. Import from @/components/ui/stepper.">
          <div className="flex flex-col gap-8">
            <Group label="Horizontal — step 2 active">
              <Stepper
                currentStepIndex={1}
                steps={[
                  { title: "Configure", status: "completed" },
                  { title: "Libraries", status: "upcoming" },
                  { title: "Review", status: "upcoming" },
                ]}
              />
            </Group>
            <Group label="Horizontal — with descriptions">
              <Stepper
                currentStepIndex={1}
                steps={[
                  { title: "Cluster", description: "Choose compute type", status: "completed" },
                  { title: "Libraries", description: "Add dependencies", status: "upcoming" },
                  { title: "Review", description: "Confirm and launch", status: "upcoming" },
                ]}
              />
            </Group>
            <Group label="Horizontal — error & warning">
              <Stepper
                currentStepIndex={1}
                steps={[
                  { title: "Configure", status: "error" },
                  { title: "Libraries", status: "warning" },
                  { title: "Review", status: "upcoming" },
                ]}
              />
            </Group>
            <Group label="Vertical">
              <Stepper
                direction="vertical"
                currentStepIndex={1}
                steps={[
                  { title: "Configure cluster", description: "Choose compute type and size.", status: "completed" },
                  { title: "Add libraries", description: "Install packages and dependencies.", status: "upcoming" },
                  { title: "Review & launch", description: "Confirm settings before starting.", status: "upcoming" },
                ]}
              />
            </Group>
          </div>
        </Section>


        <Section id="empty" title="Empty State" description="Centered empty placeholder. 64px icon slot (defaults to InboxIcon), optional title, description, and action.">
          <div className="flex flex-col gap-6">
            <Group label="With title + action">
              <div className="border border-border rounded-md py-12">
                <Empty
                  title="No pipelines yet"
                  description="Create a pipeline to start ingesting and transforming data."
                  action={<Button size="sm"><Plus className="h-4 w-4" />Create pipeline</Button>}
                />
              </div>
            </Group>
            <Group label="Description only">
              <div className="border border-border rounded-md py-12">
                <Empty description="No results match your search criteria. Try adjusting your filters." />
              </div>
            </Group>
          </div>
        </Section>

        {/* ── SegmentedControl ───────────────────────────────────────────── */}

        <Section id="badges" title="Badges & Tags" description="Rectangular (4px radius). Background and text use exact RGBA CSS tokens from DuBois semantics.">
          <div className="flex flex-col gap-5">
            <Group label="Semantic">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Error</Badge>
                <Badge variant="default_tag">Default tag</Badge>
              </div>
            </Group>
            <Group label="DuBois Tag Palette (RGBA tokens)">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default_tag">Default</Badge>
                <Badge variant="charcoal">Charcoal</Badge>
                <Badge variant="coral">Coral</Badge>
                <Badge variant="brown">Brown</Badge>
                <Badge variant="indigo">Indigo</Badge>
                <Badge variant="lemon">Lemon</Badge>
                <Badge variant="lime">Lime</Badge>
                <Badge variant="pink">Pink</Badge>
                <Badge variant="purple">Purple</Badge>
                <Badge variant="teal">Teal</Badge>
                <Badge variant="turquoise">Turquoise</Badge>
              </div>
            </Group>
            <Group label="In context">
              <div className="flex flex-wrap gap-2">
                <Badge variant="lime">Running</Badge>
                <Badge variant="teal">Streaming</Badge>
                <Badge variant="secondary">Idle</Badge>
                <Badge variant="destructive">Failed</Badge>
                <Badge variant="indigo">Scheduled</Badge>
                <Badge variant="lemon">Pending</Badge>
                <Badge variant="coral">Deprecated</Badge>
                <Badge variant="purple">Beta</Badge>
                <Badge variant="charcoal">Archived</Badge>
              </div>
            </Group>
          </div>
        </Section>

        {/* ── Alerts ─────────────────────────────────────────────────────── */}

        <Section id="tables" title="Tables" description="DuBois row hover (rgba 4%) and selected (rgba 8%) states. Semibold column headers.">
          <div className="border border-border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">{row.type}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor[row.status] as Parameters<typeof Badge>[0]["variant"]}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.updated}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>

        {/* ── Cards ──────────────────────────────────────────────────────── */}

        <Section id="cards" title="Cards" description="8px radius, db-sm shadow. Tighter padding than shadcn defaults.">
          <div className="grid grid-cols-3 gap-4">
            {/* Metric card */}
            <Card>
              <CardHeader>
                <CardDescription>Active clusters</CardDescription>
                <CardTitle className="text-2xl font-semibold">14</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">↑ 3 from yesterday</p>
              </CardContent>
            </Card>

            {/* Status card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>etl-prod-v2</CardTitle>
                  <Badge variant="lime">Running</Badge>
                </div>
                <CardDescription>Last run 2 min ago</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">124 tasks · 0 errors</p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">View logs</Button>
                <Button variant="ghost" size="sm">Stop</Button>
              </CardFooter>
            </Card>

            {/* Skeleton card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ── Dialogs ────────────────────────────────────────────────────── */}

        <Section id="list-item" title="List Item" description="Selectable panel row (32px). Active: blue-tinted bg. Actions appear on hover/selected.">
          <div className="flex flex-col gap-5">
            <Group label="States">
              <div className="border border-border rounded-md overflow-hidden w-72">
                <ListItem
                  icon={<Icons.NotebookIcon size={16} />}
                  selected
                >
                  analysis-notebook
                </ListItem>
                <ListItem icon={<Icons.PipelineIcon size={16} />}>
                  etl-pipeline
                </ListItem>
                <ListItem icon={<Icons.WorkflowsIcon size={16} />}>
                  daily-workflow
                </ListItem>
                <ListItem icon={<Icons.QueryEditorIcon size={16} />}>
                  sql-query
                </ListItem>
              </div>
            </Group>
          </div>
        </Section>

        {/* ── Icons ──────────────────────────────────────────────────────── */}

        <Section id="tabs-demo" title="Tabs">
          <div className="flex flex-col gap-6">
            <Group label="Line variant (DuBois style)">
              <Tabs defaultValue="tab1">
                <TabsList variant="line">
                  <TabsTrigger value="tab1">Overview</TabsTrigger>
                  <TabsTrigger value="tab2">Schema</TabsTrigger>
                  <TabsTrigger value="tab3">Sample data</TabsTrigger>
                  <TabsTrigger value="tab4">Permissions</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="pt-4">
                  <p className="text-sm text-muted-foreground">Table overview and metadata.</p>
                </TabsContent>
                <TabsContent value="tab2" className="pt-4">
                  <p className="text-sm text-muted-foreground">Column definitions and types.</p>
                </TabsContent>
                <TabsContent value="tab3" className="pt-4">
                  <p className="text-sm text-muted-foreground">First 100 rows of data.</p>
                </TabsContent>
                <TabsContent value="tab4" className="pt-4">
                  <p className="text-sm text-muted-foreground">Access control settings.</p>
                </TabsContent>
              </Tabs>
            </Group>

            <Group label="Pill variant">
              <Tabs defaultValue="a">
                <TabsList>
                  <TabsTrigger value="a">Notebooks</TabsTrigger>
                  <TabsTrigger value="b">Pipelines</TabsTrigger>
                  <TabsTrigger value="c">Jobs</TabsTrigger>
                </TabsList>
                <TabsContent value="a" className="pt-4">
                  <p className="text-sm text-muted-foreground">Your notebooks.</p>
                </TabsContent>
                <TabsContent value="b" className="pt-4">
                  <p className="text-sm text-muted-foreground">Your pipelines.</p>
                </TabsContent>
                <TabsContent value="c" className="pt-4">
                  <p className="text-sm text-muted-foreground">Your jobs.</p>
                </TabsContent>
              </Tabs>
            </Group>
          </div>
        </Section>

        {/* ── Avatar + Misc ──────────────────────────────────────────────── */}

        <Section id="breadcrumb" title="Breadcrumb" description="Navigation trail. Links use text-primary, current page uses text-muted-foreground, separator is a small ChevronRight.">
          <div className="flex flex-col gap-4">
            <Group label="Default">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Catalog</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>main</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Group>

            <Group label="Deeper path">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Data Engineering</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Pipelines</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">prod-etl</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Settings</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Group>

            <Group label="With ellipsis">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbEllipsis />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">prod-etl</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Settings</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Group>
          </div>
        </Section>

        {/* ── AI Components ──────────────────────────────────────────────── */}
        <Separator className="my-8" />

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        <Section id="pagination" title="Pagination" description="Page navigation with Previous / Next / numbered links. Import from @/components/ui/pagination.">
          <div className="flex flex-col gap-5">
            <Group label="Default">
              <Pagination>
                <PaginationContent>
                  <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                  <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationEllipsis /></PaginationItem>
                  <PaginationItem><PaginationLink href="#">8</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationNext href="#" /></PaginationItem>
                </PaginationContent>
              </Pagination>
            </Group>
            <Group label="Simple (jobs-style ghost buttons)">
              <div className="flex items-center justify-end gap-1 w-full">
                <Button variant="ghost" size="xs" className="gap-1">
                  <Icons.ChevronLeftIcon size={12} /> Previous
                </Button>
                <Button variant="ghost" size="xs" className="gap-1">
                  Next <Icons.ChevronRightIcon size={12} />
                </Button>
              </div>
            </Group>
          </div>
        </Section>

        <Separator className="my-8" />

        {/* ── Tree ───────────────────────────────────────────────────────── */}
        <Section id="tree" title="Tree" description="File-tree navigation with expand/collapse and selection. Import from @/components/ui/tree.">
          <div className="flex flex-col gap-5">
            <Group label="With icons">
              <div className="w-64 overflow-hidden rounded border border-border">
                <Tree
                  nodes={DEMO_TREE}
                  selectedId={treeSelected}
                  onSelect={setTreeSelected}
                />
              </div>
            </Group>
          </div>
        </Section>


        <Section id="dialogs" title="Dialogs & Sheets" description="40px padding, no header/footer dividers. 8px radius.">
          <div className="flex flex-wrap gap-3">
            {/* Confirm dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default">Confirm dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete cluster?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete <strong>my-cluster-01</strong> and all associated data. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive">Delete cluster</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Form dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create notebook</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create notebook</DialogTitle>
                  <DialogDescription>Add a new notebook to your workspace.</DialogDescription>
                </DialogHeader>
                <DialogBody className="py-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="nb-name">Name</Label>
                      <Input id="nb-name" placeholder="my-analysis" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="nb-lang">Default language</Label>
                      <Input id="nb-lang" placeholder="Python" />
                    </div>
                  </div>
                </DialogBody>
                <DialogFooter>
                  <Button>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Tabs inside dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default">Tabbed dialog</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Cluster settings</DialogTitle>
                </DialogHeader>
                <DialogBody className="py-2">
                  <Tabs defaultValue="config">
                    <TabsList variant="line">
                      <TabsTrigger value="config">Configuration</TabsTrigger>
                      <TabsTrigger value="libs">Libraries</TabsTrigger>
                      <TabsTrigger value="logs">Logs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="config" className="pt-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                          <Label>Cluster name</Label>
                          <Input placeholder="my-cluster" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label>Node type</Label>
                          <Input placeholder="Standard_DS3_v2" />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="libs" className="pt-4">
                      <p className="text-sm text-muted-foreground">No libraries installed.</p>
                    </TabsContent>
                    <TabsContent value="logs" className="pt-4">
                      <p className="text-sm text-muted-foreground">No recent logs.</p>
                    </TabsContent>
                  </Tabs>
                </DialogBody>
                <DialogFooter>
                  <Button>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Tooltip demos */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-muted-foreground">Tooltips:</span>
              {(["top", "bottom", "left", "right"] as const).map((side) => (
                <Tooltip key={side}>
                  <TooltipTrigger asChild>
                    <Button variant="default" size="xs">{side}</Button>
                  </TooltipTrigger>
                  <TooltipContent side={side}>
                    Tooltip on {side}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}

        <Section id="ai" title="AI Components" description="Databricks AI gradient: #4299E0 → #CA42E0 → #FF5F46 at 135°">
          <div className="flex flex-col gap-6">
            <Group label="AI Gradient Background">
              <div className="h-16 rounded-md bg-ai-gradient" />
            </Group>

            <Group label="AI Gradient Text">
              <p className="text-2xl font-semibold text-ai-gradient">
                Databricks AI / BI
              </p>
            </Group>

<Group label="AI Sparkle Button">
              <Button className="bg-ai-gradient text-white hover:opacity-90 border-0">
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            </Group>

            <Group label="Inline AI indicator">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className="inline-flex h-2 w-2 rounded-full bg-ai-gradient"
                />
                <span className="text-muted-foreground">AI-generated content</span>
              </div>
            </Group>
          </div>
        </Section>

        <Separator className="my-8" />

        {/* ── Shell ──────────────────────────────────────── */}
        <Section id="shell" title="Shell" description="App-level layout components: PageHeader, TopBar, Sidebar.">
          <div className="flex flex-col gap-8">

            <Group label="PageHeader — full">
              <div className="rounded-md border border-border p-6">
                <PageHeader
                  breadcrumbs={
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="#">Data Engineering</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Pipelines</BreadcrumbPage></BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  }
                  title="prod-etl-v2"
                  badge={<Badge variant="lime">Running</Badge>}
                  description="Delta Live Tables pipeline · Last run 2 min ago · 124 tasks"
                  actions={
                    <>
                      <Button variant="ghost" size="icon-xs"><Settings className="h-4 w-4" /></Button>
                      <Button variant="default" size="sm">View logs</Button>
                      <Button size="sm">Start</Button>
                    </>
                  }
                />
              </div>
            </Group>

            <Group label="PageHeader — minimal">
              <div className="rounded-md border border-border p-6">
                <PageHeader title="SQL Warehouses" description="Serverless compute for running SQL queries." actions={<Button size="sm">Create warehouse</Button>} />
              </div>
            </Group>

            <Group label="TopBar">
              <div className="overflow-hidden rounded-md border border-border">
                <TopBar sidebarOpen={true} workspace="Production" userInitial="N" />
              </div>
              <div className="overflow-hidden rounded-md border border-border mt-2">
                <TopBar sidebarOpen={false} workspace="Production" userInitial="N" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Top: sidebar open · Bottom: sidebar collapsed</p>
            </Group>

            <Group label="Sidebar — expanded">
              <div className="overflow-hidden rounded-md border border-border" style={{ height: 480 }}>
                <Sidebar open={true} activeItem="workspace" />
              </div>
            </Group>


            <Group label="Full shell">
              <div className="text-sm text-muted-foreground">
                Visit{" "}
                <Link href="/shell" className="text-primary underline underline-offset-2">
                  /shell
                </Link>{" "}
                to see the full AppShell with TopBar + Sidebar + demo content.
              </div>
            </Group>
          </div>
        </Section>

        <Separator className="my-8" />

        {/* ── Notebook Cell ──────────────────────────────────────────────── */}
        <Section id="notebook-cell" title="Notebook Cell" description="Editor cell with gutter, run button, language badge, and action toolbar. Import from @/components/ui/notebook-cell.">
          <div className="flex flex-col gap-5">
            <Group label="Python cell">
              <NotebookCell language="Python" lineCount={3}>
                <span className="text-muted-foreground">{"# Example cell content"}</span>
              </NotebookCell>
            </Group>
            <Group label="SQL cell">
              <NotebookCell language="SQL" lineCount={2} />
            </Group>
          </div>
        </Section>


        <Section id="misc" title="Misc Components">
          <div className="flex flex-col gap-6">
            <Group label="Avatars">
              <div className="flex items-center gap-3">
                {["JD", "AS", "MK", "RW", "TN"].map((initials) => (
                  <Avatar key={initials}>
                    <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </Group>

            <Group label="Separator">
              <div className="flex flex-col gap-3 w-64">
                <Separator />
                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <Separator className="flex-1" />
                </div>
              </div>
            </Group>

            <Group label="Skeleton">
              <div className="flex flex-col gap-2 w-72">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-56" />
              </div>
            </Group>
          </div>
        </Section>

        {/* ── Spinner ────────────────────────────────────────────────────── */}
        <Separator className="my-8" />
        <p className="text-xs text-muted-foreground pb-8">
          Databricks Designer Starter Kit · DuBois tokens on shadcn/ui · Tailwind v4
        </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
