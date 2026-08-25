"use client"

import Link from "next/link"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deriveCurrentStep } from "@/lib/generation/state-machine"
import { useProjectStore } from "@/lib/projects/store"
import { useStoreHydration } from "@/lib/projects/use-store-hydration"
import { ProjectThumbnail } from "@/components/projects/project-thumbnail"

const STEP_LABEL: Record<string, string> = {
  input: "입력",
  concept: "컨셉",
  palette: "팔레트",
  wireframe: "와이어",
  components: "컴포넌트",
  prototype: "프로토타입",
}

export function ProjectList() {
  const hydrated = useStoreHydration()
  const projects = useProjectStore((state) => state.projects)
  const deleteProject = useProjectStore((state) => state.deleteProject)

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">목록을 불러오는 중…</p>
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-16 text-center">
        <p className="text-muted-foreground">아직 프로젝트가 없습니다. 위 버튼으로 만드세요.</p>
      </div>
    )
  }

  const sorted = [...projects].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  )

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {sorted.map((project) => {
        const step = deriveCurrentStep(project)
        return (
          <li key={project.id}>
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">
                    <Link href={`/projects/${project.id}`} className="hover:underline">
                      {project.name}
                    </Link>
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {STEP_LABEL[step] ?? step}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="삭제"
                  onClick={() => {
                    if (confirm("이 프로젝트를 삭제할까요?")) deleteProject(project.id)
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Link href={`/projects/${project.id}`}>
                  <ProjectThumbnail project={project} />
                </Link>
              </CardContent>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
