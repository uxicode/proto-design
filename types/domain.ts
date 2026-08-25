export const PROJECT_STEPS = {
  input: "input",
  concept: "concept",
  palette: "palette",
  wireframe: "wireframe",
  components: "components",
  prototype: "prototype",
} as const

export type ProjectStep = (typeof PROJECT_STEPS)[keyof typeof PROJECT_STEPS]

export const GENERATION_STEPS = [
  "concept",
  "palette",
  "wireframe",
  "components",
  "prototype",
] as const

export type GenerationStep = (typeof GENERATION_STEPS)[number]

export const ARTIFACT_STATUS = {
  candidate: "candidate",
  committed: "committed",
  superseded: "superseded",
  stale: "stale",
} as const

export type ArtifactStatus =
  (typeof ARTIFACT_STATUS)[keyof typeof ARTIFACT_STATUS]

export const DOMAIN_KEYS = {
  healthcare: "healthcare",
  fintech: "fintech",
  ecommerce: "ecommerce",
  education: "education",
  saas_internal: "saas_internal",
  other: "other",
} as const

export type DomainKey = (typeof DOMAIN_KEYS)[keyof typeof DOMAIN_KEYS]

export const SWATCH_ROLES = [
  "primary",
  "secondary",
  "background",
  "text",
  "accent",
] as const

export type SwatchRole = (typeof SWATCH_ROLES)[number]

export interface Swatch {
  role: SwatchRole
  hex: string
}

export interface Concept {
  id: string
  generationId: string
  title: string
  summary: string
  visualHints: string[]
  visualPreviewUrl?: string
  status: ArtifactStatus
  committedAt?: string
}

export interface Palette {
  id: string
  generationId: string
  sourceConceptId: string
  name: string
  swatches: Swatch[]
  status: ArtifactStatus
  committedAt?: string
}

export interface WireframeBlock {
  id: string
  role: "nav" | "hero" | "form" | "list" | "footer" | "sidebar" | "content"
  notes: string
}

export interface Wireframe {
  id: string
  generationId: string
  sourceConceptId: string
  sourcePaletteId: string
  title: string
  structureNotes: string
  blocks: WireframeBlock[]
  layoutPreviewUrl?: string
  status: ArtifactStatus
  committedAt?: string
}

export interface ComponentItem {
  role: "button" | "input" | "card" | "navigation" | "badge" | "tabs"
  variant: string
  notes: string
}

export interface ComponentSet {
  id: string
  generationId: string
  sourceConceptId: string
  sourcePaletteId: string
  sourceWireframeId: string
  title: string
  items: ComponentItem[]
  previewUrl?: string
  status: ArtifactStatus
  committedAt?: string
}

export interface PrototypeSnapshot {
  conceptId: string
  paletteId: string
  wireframeId: string
  componentSetId: string
  domainKey: string
  keywords: string[]
  briefVersion: number
}

export interface PrototypeAsset {
  id: string
  generationId: string
  imageUrl: string
  width?: number
  height?: number
  snapshot: PrototypeSnapshot
  createdAt: string
}

export const CANVAS_COMPONENT_TYPES = [
  "button",
  "input",
  "textarea",
  "label",
  "card",
  "badge",
  "alert",
  "separator",
  "radio-group",
  "tabs",
  "checkbox",
  "switch",
  "avatar",
  "select",
] as const

export type CanvasComponentType = (typeof CANVAS_COMPONENT_TYPES)[number]

export type ShadcnButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"

export type ShadcnButtonSize = "default" | "sm" | "lg"

export type ShadcnBadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive"

export interface CanvasButtonProps {
  label: string
  variant: ShadcnButtonVariant
  size: ShadcnButtonSize
  disabled: boolean
}

export interface CanvasInputProps {
  placeholder: string
  value: string
  disabled: boolean
}

export interface CanvasTextareaProps {
  placeholder: string
  value: string
  disabled: boolean
}

export interface CanvasLabelProps {
  text: string
}

export interface CanvasCardProps {
  title: string
  description: string
  body: string
}

export interface CanvasBadgeProps {
  label: string
  variant: ShadcnBadgeVariant
}

export interface CanvasAlertProps {
  title: string
  description: string
}

export interface CanvasSeparatorProps {
  orientation: "horizontal" | "vertical"
}

export interface CanvasRadioGroupProps {
  items: string[]
  value: string
}

export interface CanvasTabsProps {
  labels: string[]
  activeIndex: number
}

export interface CanvasCheckboxProps {
  label: string
  checked: boolean
}

export interface CanvasSwitchProps {
  label: string
  checked: boolean
}

export interface CanvasAvatarProps {
  alt: string
  src: string
}

export interface CanvasSelectProps {
  options: string[]
  value: string
  placeholder: string
}

export type CanvasInstanceProps =
  | CanvasButtonProps
  | CanvasInputProps
  | CanvasTextareaProps
  | CanvasLabelProps
  | CanvasCardProps
  | CanvasBadgeProps
  | CanvasAlertProps
  | CanvasSeparatorProps
  | CanvasRadioGroupProps
  | CanvasTabsProps
  | CanvasCheckboxProps
  | CanvasSwitchProps
  | CanvasAvatarProps
  | CanvasSelectProps

export interface CanvasInstance {
  id: string
  type: CanvasComponentType
  x: number
  y: number
  width: number
  height: number
  props: CanvasInstanceProps
  zIndex: number
}

export interface Project {
  id: string
  name: string
  domainKey: DomainKey | null
  domainCustom: string | null
  keywords: string[]
  briefVersion: number
  currentStep: ProjectStep
  concepts: Concept[]
  palettes: Palette[]
  wireframes: Wireframe[]
  componentSets: ComponentSet[]
  prototype: PrototypeAsset | null
  canvasInstances: CanvasInstance[]
  createdAt: string
  updatedAt: string
}

export interface BriefInput {
  domainKey: DomainKey
  domainCustom: string | null
  keywords: string[]
}

export interface CommittedConceptRef {
  id: string
  title: string
  summary: string
  visualHints: string[]
  status: ArtifactStatus
}

export interface CommittedPaletteRef {
  id: string
  name: string
  swatches: Swatch[]
  status: ArtifactStatus
}

export interface CommittedWireframeRef {
  id: string
  title: string
  structureNotes: string
  blocks: WireframeBlock[]
  status: ArtifactStatus
}

export interface CommittedComponentSetRef {
  id: string
  title: string
  items: ComponentItem[]
  status: ArtifactStatus
}

export interface InputSnapshot {
  projectId: string
  briefVersion: number
  domainKey: DomainKey
  domainLabel: string
  keywords: string[]
  entropy?: string
  avoidTitles?: string[]
  committedConcept?: CommittedConceptRef
  committedPalette?: CommittedPaletteRef
  committedWireframe?: CommittedWireframeRef
  committedComponentSet?: CommittedComponentSetRef
}

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  STEP_LOCKED: "STEP_LOCKED",
  STEP_STALE: "STEP_STALE",
  GENERATION_IN_FLIGHT: "GENERATION_IN_FLIGHT",
  SAFETY_BLOCKED: "SAFETY_BLOCKED",
  GENERATION_FAILED: "GENERATION_FAILED",
  GENERATION_TIMEOUT: "GENERATION_TIMEOUT",
  NOT_FOUND: "NOT_FOUND",
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

export interface AppErrorBody {
  code: ErrorCode
  message: string
}

export const GENERATION_STATUS = {
  queued: "queued",
  running: "running",
  succeeded: "succeeded",
  failed: "failed",
} as const

export type GenerationStatus =
  (typeof GENERATION_STATUS)[keyof typeof GENERATION_STATUS]
