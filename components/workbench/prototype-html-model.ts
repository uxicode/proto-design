import { resolveKitKind, type KitKind } from "@/lib/ai/preview-theme"
import { getDomainLabel } from "@/lib/config/domains"
import type { ComponentSet, Concept, Project, Wireframe } from "@/types/domain"

export interface PrototypeHtmlModel {
  brand: string
  title: string
  summary: string
  hints: string[]
  keywords: string[]
  primaryCta: string
  secondaryCta: string
  wireTitle: string
  wireNotes: string
  kitTitle: string
  kit: KitKind
  buttonVariant: "default" | "secondary"
  buttonSize: "default" | "sm"
  badgeVariant: "default" | "secondary"
}

export interface PrototypeRow {
  title: string
  meta: string
  badge: string
}

export function buildPrototypeHtmlModel(
  project: Project,
  concept: Concept | undefined,
  wireframe: Wireframe | undefined,
  componentSet: ComponentSet | undefined
): PrototypeHtmlModel {
  const kit = resolveKitKind({
    title: componentSet?.title,
    items: componentSet?.items,
  })
  return {
    brand: getDomainLabel(project.domainKey, project.domainCustom) || "서비스",
    title: concept?.title ?? (getDomainLabel(project.domainKey, project.domainCustom) || "서비스"),
    summary: concept?.summary ?? wireframe?.structureNotes ?? "",
    hints: concept?.visualHints ?? [],
    keywords: project.keywords,
    primaryCta: project.keywords[0] ?? "시작하기",
    secondaryCta: project.keywords[1] ?? "둘러보기",
    wireTitle: wireframe?.title ?? "레이아웃",
    wireNotes: wireframe?.structureNotes ?? "",
    kitTitle: componentSet?.title ?? "컴포넌트",
    kit,
    buttonVariant: kit === "soft" ? "secondary" : "default",
    buttonSize: kit === "compact" ? "sm" : "default",
    badgeVariant: kit === "soft" ? "secondary" : "default",
  }
}

export function prototypeRows(model: PrototypeHtmlModel): PrototypeRow[] {
  const extras = model.hints.length > 0 ? model.hints : model.keywords
  return [
    { title: model.primaryCta, meta: model.summary, badge: extras[0] ?? "진행" },
    { title: model.secondaryCta, meta: model.wireNotes || model.kitTitle, badge: extras[1] ?? "대기" },
    { title: extras[2] ?? model.wireTitle, meta: model.kitTitle, badge: "완료" },
    { title: model.brand, meta: model.title, badge: extras[0] ?? "활성" },
  ]
}
