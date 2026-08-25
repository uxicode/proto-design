import { ProjectCreateForm } from "@/components/projects/project-create-form"

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">새 프로젝트</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        이름은 1~80자입니다. 만든 뒤 분야와 키워드를 입력합니다.
      </p>
      <ProjectCreateForm />
    </div>
  )
}
