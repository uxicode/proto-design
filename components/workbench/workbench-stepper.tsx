"use client"

import { Check, Lock, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { getStepStatus } from "@/lib/generation/state-machine"
import { STEP_ORDER } from "@/lib/generation/state-machine"
import type { Project, ProjectStep } from "@/types/domain"

const STEP_LABELS: Record<ProjectStep, string> = {
  input: "입력",
  concept: "컨셉",
  palette: "팔레트",
  wireframe: "와이어",
  components: "컴포넌트",
  prototype: "프로토타입",
}

interface WorkbenchStepperProps {
  project: Project
  current: ProjectStep
  onChange: (step: ProjectStep) => void
}

export function WorkbenchStepper({
  project,
  current,
  onChange,
}: WorkbenchStepperProps) {
  return (
    <ol className="flex flex-wrap gap-2" aria-label="작업 단계">
      {STEP_ORDER.map((step, index) => {
        const status = getStepStatus(project, step)
        const isLocked = status === "locked"
        return (
          <li key={step}>
            <button
              type="button"
              disabled={isLocked}
              onClick={() => {
                if (!isLocked) onChange(step)
              }}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                current === step &&
                  "border-foreground bg-foreground text-background",
                current !== step && status === "complete" && "border-emerald-700 text-emerald-800",
                current !== step && status === "stale" && "border-amber-600 text-amber-800",
                current !== step && status === "current" && "border-border text-foreground",
                isLocked && "cursor-not-allowed border-dashed text-muted-foreground"
              )}
            >
              <span className="font-mono text-[11px] opacity-70">{index}</span>
              {STEP_LABELS[step]}
              {status === "complete" && current !== step ? (
                <Check className="size-3.5" aria-hidden />
              ) : null}
              {status === "locked" ? <Lock className="size-3.5" aria-hidden /> : null}
              {status === "stale" && current !== step ? (
                <TriangleAlert className="size-3.5" aria-hidden />
              ) : null}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
