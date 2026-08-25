import { CANVAS_COMPONENT_TYPES, type CanvasComponentType } from "@/types/domain"

export interface ShadcnCatalogItem {
  type: CanvasComponentType
  label: string
  importPath: string
}

export const SHADCN_CATALOG: ShadcnCatalogItem[] = [
  { type: "button", label: "버튼", importPath: "@/components/ui/button" },
  { type: "input", label: "입력", importPath: "@/components/ui/input" },
  { type: "textarea", label: "텍스트영역", importPath: "@/components/ui/textarea" },
  { type: "label", label: "레이블", importPath: "@/components/ui/label" },
  { type: "card", label: "카드", importPath: "@/components/ui/card" },
  { type: "badge", label: "배지", importPath: "@/components/ui/badge" },
  { type: "alert", label: "알림", importPath: "@/components/ui/alert" },
  { type: "separator", label: "구분선", importPath: "@/components/ui/separator" },
  { type: "radio-group", label: "라디오", importPath: "@/components/ui/radio-group" },
  { type: "tabs", label: "탭", importPath: "@/components/ui/tabs" },
  { type: "checkbox", label: "체크박스", importPath: "@/components/ui/checkbox" },
  { type: "switch", label: "스위치", importPath: "@/components/ui/switch" },
  { type: "avatar", label: "아바타", importPath: "@/components/ui/avatar" },
  { type: "select", label: "셀렉트", importPath: "@/components/ui/select" },
]

export const CANVAS_DND_MIME = "application/x-protomatch-canvas-type"
export const CANVAS_SOFT_WARN_COUNT = 50

export function catalogItem(type: CanvasComponentType): ShadcnCatalogItem {
  const item = SHADCN_CATALOG.find((entry) => entry.type === type)
  if (!item) {
    throw new Error(`Unknown canvas type: ${type}`)
  }
  return item
}

export function isCanvasComponentType(value: unknown): value is CanvasComponentType {
  return (
    typeof value === "string" &&
    (CANVAS_COMPONENT_TYPES as readonly string[]).includes(value)
  )
}
