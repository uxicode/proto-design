import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { CanvasShell } from "@/components/workbench/canvas/canvas-shell"
import { canRenderCanvasMock, getDisplayArtifact } from "@/lib/canvas/guards"
import { canGenerate as canGenerateStep } from "@/lib/generation/state-machine"
import type { ComponentSet, Project } from "@/types/domain"

interface PrototypeResultProps {
  project: Project
  isLoading: boolean
  canGenerate: boolean
  onGenerate: () => void
  chrome?: ReactNode
}

export function PrototypeResult({
  project,
  isLoading,
  canGenerate,
  onGenerate,
  chrome,
}: PrototypeResultProps) {
  const concept = getDisplayArtifact(project.concepts)
  const palette = getDisplayArtifact(project.palettes)
  const wireframe = getDisplayArtifact(project.wireframes)
  const componentSet = getDisplayArtifact(project.componentSets)
  const guard = canGenerateStep(project, "prototype")
  const isReady = canRenderCanvasMock(project)

  const header = (
    <>
      {chrome}
      <PrototypeHeader
        isLoading={isLoading}
        canGenerate={canGenerate}
        hasPrototype={Boolean(project.prototype)}
        onGenerate={onGenerate}
      />
    </>
  )

  if (isReady && concept && palette && wireframe && componentSet) {
    return (
      <>
        <CanvasShell project={project} chrome={header} />
        <SpecCard title="컴포넌트" body={componentSet.title}>
          <ComponentItemList items={componentSet.items} />
        </SpecCard>
      </>
    )
  }

  return (
    <CanvasShell
      project={project}
      chrome={header}
      stage={
        <PrototypeEmptyState
          message={
            guard.message ?? "아직 최종 화면이 없습니다. 네 단계를 확정한 뒤 생성하세요."
          }
        />
      }
    />
  )
}

function PrototypeHeader({
  isLoading,
  canGenerate,
  hasPrototype,
  onGenerate,
}: {
  isLoading: boolean
  canGenerate: boolean
  hasPrototype: boolean
  onGenerate: () => void
}) {
  const label = prototypeActionLabel(isLoading, hasPrototype)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">최종 프로토타입</h2>
        <p className="text-sm text-muted-foreground">
          확정한 컨셉, 팔레트, 와이어프레임, 컴포넌트를 한 화면 UI로 합칩니다.
        </p>
      </div>
      <Button type="button" onClick={onGenerate} disabled={!canGenerate || isLoading}>
        {label}
      </Button>
    </div>
  )
}

function prototypeActionLabel(isLoading: boolean, hasPrototype: boolean): string {
  if (isLoading) return "생성 중…"
  if (hasPrototype) return "다시 생성"
  return "프로토타입 생성"
}

function PrototypeEmptyState({ message }: { message: string }) {
  return (
    <p className="flex h-full min-h-0 items-center justify-center rounded-xl border border-dashed px-4 text-center text-sm text-muted-foreground">
      {message}
    </p>
  )
}

function ComponentItemList({ items }: { items: ComponentSet["items"] }) {
  if (items.length === 0) return null

  return (
    <ul className="space-y-1 text-xs text-muted-foreground">
      {items.map((item) => (
        <li key={`${item.role}-${item.variant}`}>
          {item.role} · {item.variant}
        </li>
      ))}
    </ul>
  )
}

function SpecCard({
  title,
  body,
  children,
}: {
  title: string
  body?: string
  children: ReactNode
}) {
  return (
    <section
      aria-label="확정 컴포넌트"
      className="fixed bottom-0 left-0 right-0 z-40 translate-y-[calc(100%-3.25rem)] rounded-t-xl border border-b-0 border-border bg-card p-4 pt-2 shadow-2xl transition-transform duration-200 hover:translate-y-0 focus-within:translate-y-0 xl:left-[240px] xl:right-[280px]"
    >
      <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-muted-foreground/40" />
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {body ? <h3 className="text-sm font-semibold">{body}</h3> : null}
      <div className="mt-2">{children}</div>
    </section>
  )
}
