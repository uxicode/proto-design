import type { Project } from "@/types/domain"
import { getCommittedArtifact } from "@/lib/generation/state-machine"

interface ProjectThumbnailProps {
  project: Project
}

export function ProjectThumbnail({ project }: ProjectThumbnailProps) {
  const src =
    project.prototype?.imageUrl ||
    getCommittedArtifact(project.componentSets)?.previewUrl ||
    getCommittedArtifact(project.wireframes)?.layoutPreviewUrl ||
    getCommittedArtifact(project.concepts)?.visualPreviewUrl

  if (!src) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-secondary text-sm text-muted-foreground">
        미리보기 없음
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${project.name} 미리보기`}
      className="aspect-[16/9] w-full rounded-lg object-cover"
    />
  )
}
