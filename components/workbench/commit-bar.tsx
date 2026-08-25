import { Button } from "@/components/ui/button"

interface CommitBarProps {
  canGenerate: boolean
  isLoading: boolean
  generateLabel: string
  hint?: string
  onGenerate: () => void
}

export function CommitBar({
  canGenerate,
  isLoading,
  generateLabel,
  hint = "후보 3안을 비교한 뒤 하나를 확정하면 다음 단계가 열립니다.",
  onGenerate,
}: CommitBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-sm text-muted-foreground">{hint}</p>
      <Button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate || isLoading}
      >
        {isLoading ? "생성 중…" : generateLabel}
      </Button>
    </div>
  )
}
