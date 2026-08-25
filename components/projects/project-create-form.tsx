"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProjectStore } from "@/lib/projects/store"
import { NAME_MAX, validateProjectName } from "@/lib/projects/validation"

export function ProjectCreateForm() {
  const router = useRouter()
  const createProject = useProjectStore((state) => state.createProject)
  const [name, setName] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  return (
    <form
      className="max-w-md space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        const message = validateProjectName(name)
        if (message) {
          setErrorMessage(message)
          return
        }
        const project = createProject(name)
        router.push(`/projects/${project.id}`)
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="name">프로젝트 이름</Label>
        <Input
          id="name"
          value={name}
          maxLength={NAME_MAX + 5}
          onChange={(event) => setName(event.target.value)}
          placeholder="예: 헬스케어 홈 화면"
        />
        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
      </div>
      <Button type="submit">만들기</Button>
    </form>
  )
}
