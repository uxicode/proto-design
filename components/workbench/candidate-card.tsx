"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConceptMoodPreview } from "@/components/workbench/concept-mood-preview"
import { isRasterPreview } from "@/lib/ai/concept-mood"
import { cn } from "@/lib/utils"
import type { ArtifactStatus, Swatch } from "@/types/domain"

interface CandidateCardProps {
  title: string
  description: string
  previewUrl?: string
  swatches?: Swatch[]
  status: ArtifactStatus
  hints?: string[]
  recommended?: boolean
  emptyPreviewLabel?: string
  onCommit: () => void
}

export function CandidateCard({
  title,
  description,
  previewUrl,
  swatches,
  status,
  hints,
  emptyPreviewLabel,
  recommended,
  onCommit,
}: CandidateCardProps) {
  const isCommitted = status === "committed"
  const isStale = status === "stale"
  const canCommit = status === "candidate"

  return (
    <Card
      className={cn(
        "overflow-hidden",
        isCommitted && "ring-2 ring-foreground",
        recommended && canCommit && "ring-2 ring-primary/70",
        isStale && "opacity-70"
      )}
    >
      {previewUrl ? (
        isRasterPreview(previewUrl) ? (
          <ConceptMoodPreview src={previewUrl} title={title} hints={hints} />
        ) : (
          <div className="aspect-[16/10] bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={`${title} 미리보기`}
              className="h-full w-full object-contain bg-muted"
            />
          </div>
        )
      ) : emptyPreviewLabel ? (
        <div className="flex aspect-[16/10] items-center justify-center bg-muted text-sm text-muted-foreground">
          {emptyPreviewLabel}
        </div>
      ) : null}
      {swatches ? (
        <div className="flex h-16">
          {swatches.map((swatch) => (
            <div
              key={swatch.role}
              className="flex-1"
              style={{ backgroundColor: swatch.hex }}
              title={`${swatch.role} ${swatch.hex}`}
            />
          ))}
        </div>
      ) : null}
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            {recommended && canCommit ? <Badge>추천</Badge> : null}
            {isCommitted ? <Badge>확정</Badge> : null}
            {isStale ? <Badge variant="outline">오래됨</Badge> : null}
            {status === "superseded" ? <Badge variant="secondary">이전</Badge> : null}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {hints?.length ? (
          <ul className="flex flex-wrap gap-1">
            {hints.map((hint) => (
              <li
                key={hint}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs"
              >
                {hint}
              </li>
            ))}
          </ul>
        ) : null}
        {swatches ? (
          <ul className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
            {swatches.map((swatch) => (
              <li key={swatch.role}>
                {swatch.role} {swatch.hex}
              </li>
            ))}
          </ul>
        ) : null}
        <Button
          type="button"
          className="w-full"
          disabled={!canCommit}
          onClick={onCommit}
        >
          {isCommitted ? "확정됨" : "이 안으로 확정"}
        </Button>
      </CardContent>
    </Card>
  )
}
