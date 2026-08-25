import { Suspense } from "react"
import { WorkbenchView } from "@/components/workbench/workbench-view"
import { WorkbenchGate } from "@/components/workbench/workbench-gate"

interface ProjectPageProps {
  params: { id: string }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <div className="w-full">
      <Suspense fallback={<p className="text-sm text-muted-foreground">워크벤치를 여는 중…</p>}>
        <WorkbenchGate projectId={params.id}>
          <WorkbenchView projectId={params.id} />
        </WorkbenchGate>
      </Suspense>
    </div>
  )
}
