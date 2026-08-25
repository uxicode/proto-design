"use client"

import { parseAsStringLiteral, useQueryState } from "nuqs"
import { CandidateCard } from "@/components/workbench/candidate-card"
import { CandidateGrid } from "@/components/workbench/candidate-grid"
import { BriefForm } from "@/components/workbench/brief-form"
import { CommitBar } from "@/components/workbench/commit-bar"
import { GenerationStatusPanel } from "@/components/workbench/generation-status"
import { PrototypeResult } from "@/components/workbench/prototype-result"
import { StaleBanner } from "@/components/workbench/stale-banner"
import { StepLockedHint } from "@/components/workbench/step-locked-hint"
import { WorkbenchStepper } from "@/components/workbench/workbench-stepper"
import { canGenerate, getStepStatus, hasStaleArtifacts, isBriefComplete } from "@/lib/generation/state-machine"
import { useGeneration } from "@/lib/generation/use-generation"
import { useProjectStore } from "@/lib/projects/store"
import { STEP_ORDER } from "@/lib/generation/state-machine"
import { RECOMMENDED_WIREFRAME_COUNT } from "@/lib/config/candidates"
import type { GenerationStep, Project, ProjectStep } from "@/types/domain"

const stepParser = parseAsStringLiteral([
  "input",
  "concept",
  "palette",
  "wireframe",
  "components",
  "prototype",
]).withDefault("input")

const STEP_COPY: Record<GenerationStep, { title: string; generate: string }> = {
  concept: { title: "디자인 컨셉", generate: "컨셉 3안 생성" },
  palette: { title: "컬러 팔레트", generate: "팔레트 3안 생성" },
  wireframe: { title: "와이어프레임", generate: "와이어프레임 20안 생성" },
  components: { title: "컴포넌트 세트", generate: "컴포넌트 3안 생성" },
  prototype: { title: "프로토타입", generate: "프로토타입 생성" },
}

interface WorkbenchViewProps {
  projectId: string
}

export function WorkbenchView({ projectId }: WorkbenchViewProps) {
  const project = useProjectStore((state) =>
    state.projects.find((item) => item.id === projectId)
  )
  const updateBrief = useProjectStore((state) => state.updateBrief)
  const commitStepArtifact = useProjectStore((state) => state.commitStepArtifact)
  const [step, setStep] = useQueryState("step", stepParser)
  const generation = useGeneration(projectId)

  if (!project) {
    return <p className="text-sm text-muted-foreground">프로젝트를 찾을 수 없습니다.</p>
  }

  const locked = getStepStatus(project, step) === "locked"
  const isPrototypeStep = step === "prototype"
  const isPrototypeWorkspace = !locked && isPrototypeStep

  const chrome = (
    <>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">프로젝트</p>
        <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
      </div>
      <WorkbenchStepper
        project={project}
        current={step}
        onChange={(next) => {
          void setStep(next)
        }}
      />
      <StaleBanner visible={hasStaleArtifacts(project)} />
      <GenerationStatusPanel
        isLoading={generation.isLoading}
        stepLabel={step === "input" ? "입력" : STEP_COPY[step as GenerationStep]?.title ?? step}
        errorMessage={generation.errorMessage}
        onRetry={
          step !== "input"
            ? () => void generation.start(step as GenerationStep)
            : undefined
        }
      />
    </>
  )

  const prototypeChrome = (
    <>
      <WorkbenchStepper
        project={project}
        current={step}
        onChange={(next) => {
          void setStep(next)
        }}
      />
      <StaleBanner visible={hasStaleArtifacts(project)} />
      <GenerationStatusPanel
        isLoading={generation.isLoading}
        stepLabel={STEP_COPY.prototype.title}
        errorMessage={generation.errorMessage}
        onRetry={() => void generation.start("prototype")}
      />
    </>
  )

  if (isPrototypeWorkspace) {
    return (
      <PrototypeResult
        project={project}
        isLoading={generation.isLoading}
        canGenerate={canGenerate(project, "prototype").ok}
        onGenerate={() => void generation.start("prototype")}
        chrome={prototypeChrome}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
      {chrome}
      {locked ? (
        <StepLockedHint message="이전 단계를 먼저 확정해야 이 단계로 올 수 있습니다." />
      ) : (
        <StepBody
          project={project}
          step={step}
          isLoading={generation.isLoading}
          onSaveBrief={(brief) => {
            updateBrief(project.id, brief)
            void setStep("concept")
          }}
          onGenerate={(target) => void generation.start(target)}
          onCommit={(target, artifactId) => {
            const next = commitStepArtifact(project.id, target, artifactId)
            const index = STEP_ORDER.indexOf(target)
            const following = STEP_ORDER[index + 1]
            if (following) void setStep(following)
            return next
          }}
        />
      )}
    </div>
  )
}

function StepBody({
  project,
  step,
  isLoading,
  onSaveBrief,
  onGenerate,
  onCommit,
}: {
  project: Project
  step: ProjectStep
  isLoading: boolean
  onSaveBrief: Parameters<typeof BriefForm>[0]["onSave"]
  onGenerate: (step: GenerationStep) => void
  onCommit: (
    step: Exclude<GenerationStep, "prototype">,
    artifactId: string
  ) => void
}) {
  if (step === "input") {
    return <BriefForm project={project} onSave={onSaveBrief} />
  }

  const copy = STEP_COPY[step]
  const guard = canGenerate(project, step)
  const generateEnabled = guard.ok && (step !== "concept" || isBriefComplete(project))
  const recommendedWireframeIds = new Set(
    project.wireframes
      .filter((entry) => entry.status === "candidate")
      .slice(0, RECOMMENDED_WIREFRAME_COUNT)
      .map((entry) => entry.id)
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{copy.title}</h2>
        <p className="text-sm text-muted-foreground">
          {guard.ok
            ? step === "wireframe"
              ? "확정 컨셉에 가까운 레이아웃을 위에 두었습니다. 하나를 고르세요."
              : "세 가지 안을 비교하고 하나를 확정하세요."
            : guard.message}
        </p>
      </div>
      <CommitBar
        canGenerate={generateEnabled}
        isLoading={isLoading}
        generateLabel={copy.generate}
        hint={
          step === "wireframe"
            ? "컨셉에 맞는 안이 위에 있습니다. 하나를 확정하면 다음 단계가 열립니다."
            : "후보 3안을 비교한 뒤 하나를 확정하면 다음 단계가 열립니다."
        }
        onGenerate={() => onGenerate(step)}
      />
      {step === "concept" ? (
        <CandidateGrid>
          {project.concepts.map((item) => (
            <CandidateCard
              key={item.id}
              title={item.title}
              description={item.summary}
              previewUrl={item.visualPreviewUrl}
              hints={item.visualHints}
              status={item.status}
              emptyPreviewLabel="무드 미리보기 없음"
              onCommit={() => onCommit("concept", item.id)}
            />
          ))}
        </CandidateGrid>
      ) : null}
      {step === "palette" ? (
        <CandidateGrid>
          {project.palettes.map((item) => (
            <CandidateCard
              key={item.id}
              title={item.name}
              description="역할이 붙은 다섯 색입니다."
              swatches={item.swatches}
              status={item.status}
              onCommit={() => onCommit("palette", item.id)}
            />
          ))}
        </CandidateGrid>
      ) : null}
      {step === "wireframe" ? (
        <CandidateGrid columns={2}>
          {project.wireframes.map((item) => (
            <CandidateCard
              key={item.id}
              title={item.title}
              description={item.structureNotes}
              previewUrl={item.layoutPreviewUrl}
              hints={item.blocks.map((block) => block.role)}
              status={item.status}
              recommended={recommendedWireframeIds.has(item.id)}
              onCommit={() => onCommit("wireframe", item.id)}
            />
          ))}
        </CandidateGrid>
      ) : null}
      {step === "components" ? (
        <CandidateGrid>
          {project.componentSets.map((item) => (
            <CandidateCard
              key={item.id}
              title={item.title}
              description={item.items.map((entry) => entry.role).join(", ")}
              previewUrl={item.previewUrl}
              status={item.status}
              onCommit={() => onCommit("components", item.id)}
            />
          ))}
        </CandidateGrid>
      ) : null}
    </div>
  )
}
