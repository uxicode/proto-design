import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProjectList } from "@/components/projects/project-list"

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">프로젝트</h1>
          <p className="mt-2 text-muted-foreground">
            이 브라우저에만 저장됩니다. 같은 기기에서 이어서 작업하세요.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">새 프로젝트</Link>
        </Button>
      </div>
      <ProjectList />
    </div>
  )
}
