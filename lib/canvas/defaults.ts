import type { KitKind } from "@/lib/ai/preview-theme"
import type {
  CanvasBadgeProps,
  CanvasButtonProps,
  CanvasComponentType,
  CanvasInstance,
  CanvasInstanceProps,
  ShadcnBadgeVariant,
  ShadcnButtonSize,
  ShadcnButtonVariant,
} from "@/types/domain"

export const RADIO_ITEM_MIN = 2
export const RADIO_ITEM_MAX = 4
export const TABS_LABEL_MIN = 2
export const TABS_LABEL_MAX = 4
export const SELECT_OPTION_MIN = 2
export const SELECT_OPTION_MAX = 5

export function radioGroupBox(
  count: number,
  orientation: "horizontal" | "vertical"
): { width: number; height: number } {
  const items = Math.max(count, RADIO_ITEM_MIN)
  if (orientation === "horizontal") {
    return { width: Math.max(240, items * 96), height: 32 }
  }
  return { width: 200, height: items * 32 }
}

const BUTTON_VARIANTS: ShadcnButtonVariant[] = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
]
const BUTTON_SIZES: ShadcnButtonSize[] = ["default", "sm", "lg"]
const BADGE_VARIANTS: ShadcnBadgeVariant[] = [
  "default",
  "secondary",
  "outline",
  "destructive",
]

export const MIN_BOX: Record<CanvasComponentType, { width: number; height: number }> = {
  button: { width: 80, height: 24 },
  input: { width: 120, height: 28 },
  textarea: { width: 120, height: 48 },
  label: { width: 48, height: 16 },
  card: { width: 160, height: 80 },
  badge: { width: 48, height: 16 },
  alert: { width: 160, height: 48 },
  separator: { width: 40, height: 4 },
  "radio-group": { width: 120, height: 24 },
  tabs: { width: 160, height: 28 },
  checkbox: { width: 80, height: 20 },
  switch: { width: 80, height: 20 },
  avatar: { width: 24, height: 24 },
  select: { width: 120, height: 28 },
}

export function defaultPropsForType(
  type: CanvasComponentType,
  kit: KitKind
): CanvasInstanceProps {
  const buttonVariant: ShadcnButtonVariant = kit === "soft" ? "secondary" : "default"
  const buttonSize: ShadcnButtonSize = kit === "compact" ? "sm" : "default"
  const badgeVariant: ShadcnBadgeVariant = kit === "soft" ? "secondary" : "default"

  switch (type) {
    case "button":
      return {
        label: "버튼",
        variant: buttonVariant,
        size: buttonSize,
        disabled: false,
      }
    case "input":
      return { placeholder: "입력하세요", value: "", disabled: false }
    case "textarea":
      return { placeholder: "내용을 입력하세요", value: "", disabled: false }
    case "label":
      return { text: "레이블" }
    case "card":
      return { title: "카드 제목", description: "설명", body: "본문을 입력하세요" }
    case "badge":
      return { label: "배지", variant: badgeVariant }
    case "alert":
      return { title: "알림", description: "설명을 입력하세요" }
    case "separator":
      return { orientation: "horizontal" }
    case "radio-group":
      return { items: ["옵션 1", "옵션 2"], value: "옵션 1", orientation: "vertical" }
    case "tabs":
      return { labels: ["탭 1", "탭 2"], activeIndex: 0 }
    case "checkbox":
      return { label: "동의", checked: false }
    case "switch":
      return { label: "켜기", checked: false }
    case "avatar":
      return { alt: "아바타", src: "" }
    case "select":
      return { options: ["항목 1", "항목 2"], value: "항목 1", placeholder: "선택" }
  }
}

export function defaultBoxForType(
  type: CanvasComponentType,
  kit: KitKind,
  props: CanvasInstanceProps = defaultPropsForType(type, kit)
): { width: number; height: number } {
  switch (type) {
    case "button":
      return { width: 136, height: kit === "compact" ? 32 : 40 }
    case "input":
      return { width: 240, height: 36 }
    case "textarea":
      return { width: 240, height: 88 }
    case "label":
      return { width: 160, height: 24 }
    case "card":
      return { width: 280, height: 176 }
    case "badge":
      return { width: 88, height: 24 }
    case "alert":
      return { width: 320, height: 88 }
    case "separator": {
      const orientation =
        "orientation" in props ? props.orientation : "horizontal"
      return orientation === "vertical"
        ? { width: 8, height: 120 }
        : { width: 240, height: 8 }
    }
    case "radio-group": {
      const count = "items" in props ? props.items.length : 2
      const orientation =
        "orientation" in props && props.orientation === "horizontal"
          ? "horizontal"
          : "vertical"
      return radioGroupBox(count, orientation)
    }
    case "tabs":
      return { width: 320, height: 40 }
    case "checkbox":
      return { width: 180, height: 24 }
    case "switch":
      return { width: 180, height: 24 }
    case "avatar":
      return { width: 40, height: 40 }
    case "select":
      return { width: 220, height: 36 }
  }
}

export function clampBox(
  type: CanvasComponentType,
  width: number,
  height: number
): { width: number; height: number } {
  const min = MIN_BOX[type]
  return {
    width: Math.max(width, min.width),
    height: Math.max(height, min.height),
  }
}

export function nextListLabel(values: string[], fallbackPrefix: string): string {
  let index = values.length + 1
  let label = `${fallbackPrefix} ${index}`
  while (values.includes(label)) {
    index += 1
    label = `${fallbackPrefix} ${index}`
  }
  return label
}

export function addListItem(values: string[], max: number, fallbackPrefix: string): string[] {
  if (values.length >= max) return values
  return [...values, nextListLabel(values, fallbackPrefix)]
}

export function removeListItemAt(values: string[], index: number, min: number): string[] {
  if (values.length <= min || index < 0 || index >= values.length) return values
  return values.filter((_, itemIndex) => itemIndex !== index)
}

export function updateListItem(values: string[], index: number, next: string): string[] {
  if (index < 0 || index >= values.length) return values
  return values.map((item, itemIndex) => (itemIndex === index ? next : item))
}

export function resizeStringList(
  values: string[],
  count: number,
  min: number,
  max: number,
  fallbackPrefix: string
): string[] {
  const nextCount = Math.min(max, Math.max(min, Math.trunc(count)))
  if (!Number.isFinite(nextCount)) return values
  if (nextCount === values.length) return values
  if (nextCount < values.length) return values.slice(0, nextCount)
  const next = [...values]
  while (next.length < nextCount) {
    next.push(nextListLabel(next, fallbackPrefix))
  }
  return next
}

export function clampStringList(
  values: string[],
  min: number,
  max: number,
  fallbackPrefix: string
): string[] {
  const limited = values.slice(0, max).map((item, index) => {
    const trimmed = item.trim()
    return trimmed || `${fallbackPrefix} ${index + 1}`
  })
  const next = [...limited]
  while (next.length < min) {
    next.push(nextListLabel(next, fallbackPrefix))
  }
  return next
}

function pick<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return typeof value === "string" && (allowed as string[]).includes(value)
    ? (value as T)
    : fallback
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

export function sanitizeProps(
  type: CanvasComponentType,
  raw: unknown,
  kit: KitKind = "solid"
): CanvasInstanceProps {
  const fallback = defaultPropsForType(type, kit)
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}

  switch (type) {
    case "button":
      return {
        label: asString(record.label, (fallback as CanvasButtonProps).label),
        variant: pick(record.variant, BUTTON_VARIANTS, (fallback as CanvasButtonProps).variant),
        size: pick(record.size, BUTTON_SIZES, (fallback as CanvasButtonProps).size),
        disabled: asBoolean(record.disabled, false),
      }
    case "input":
      return {
        placeholder: asString(record.placeholder, "입력하세요"),
        value: asString(record.value, ""),
        disabled: asBoolean(record.disabled, false),
      }
    case "textarea":
      return {
        placeholder: asString(record.placeholder, "내용을 입력하세요"),
        value: asString(record.value, ""),
        disabled: asBoolean(record.disabled, false),
      }
    case "label":
      return { text: asString(record.text, "레이블") }
    case "card":
      return {
        title: asString(record.title, "카드 제목"),
        description: asString(record.description, "설명"),
        body: asString(record.body, "본문을 입력하세요"),
      }
    case "badge":
      return {
        label: asString(record.label, "배지"),
        variant: pick(record.variant, BADGE_VARIANTS, (fallback as CanvasBadgeProps).variant),
      }
    case "alert":
      return {
        title: asString(record.title, "알림"),
        description: asString(record.description, "설명을 입력하세요"),
      }
    case "separator":
      return {
        orientation: record.orientation === "vertical" ? "vertical" : "horizontal",
      }
    case "radio-group": {
      const items = clampStringList(asStringArray(record.items), RADIO_ITEM_MIN, RADIO_ITEM_MAX, "옵션")
      const value = asString(record.value, items[0])
      return {
        items,
        value: items.includes(value) ? value : items[0],
        orientation: record.orientation === "horizontal" ? "horizontal" : "vertical",
      }
    }
    case "tabs": {
      const labels = clampStringList(asStringArray(record.labels), TABS_LABEL_MIN, TABS_LABEL_MAX, "탭")
      const activeIndex = Math.min(
        Math.max(Math.trunc(asNumber(record.activeIndex, 0)), 0),
        labels.length - 1
      )
      return { labels, activeIndex }
    }
    case "checkbox":
      return {
        label: asString(record.label, "동의"),
        checked: asBoolean(record.checked, false),
      }
    case "switch":
      return {
        label: asString(record.label, "켜기"),
        checked: asBoolean(record.checked, false),
      }
    case "avatar":
      return {
        alt: asString(record.alt, "아바타"),
        src: asString(record.src, ""),
      }
    case "select": {
      const options = clampStringList(
        asStringArray(record.options),
        SELECT_OPTION_MIN,
        SELECT_OPTION_MAX,
        "항목"
      )
      const value = asString(record.value, options[0])
      return {
        options,
        value: options.includes(value) ? value : options[0],
        placeholder: asString(record.placeholder, "선택"),
      }
    }
  }
}

export function mergeInstancePatch(
  instance: CanvasInstance,
  patch: Partial<CanvasInstanceProps>,
  box?: { width?: number; height?: number }
): CanvasInstance {
  const nextProps = sanitizeProps(instance.type, { ...instance.props, ...patch })
  const width = box?.width ?? instance.width
  const height = box?.height ?? instance.height
  const clamped = clampBox(instance.type, width, height)
  return { ...instance, props: nextProps, width: clamped.width, height: clamped.height }
}
