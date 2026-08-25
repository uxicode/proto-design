import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface GenerationStatusProps {
  isLoading: boolean
  stepLabel: string
  errorMessage: string | null
  onRetry?: () => void
}

export function GenerationStatusPanel({
  isLoading,
  stepLabel,
  errorMessage,
  onRetry,
}: GenerationStatusProps) {
  if (isLoading) {
    return (
      <Alert>
        <Loader2 className="size-4 animate-spin" />
        <AlertTitle>{stepLabel} 생성 중</AlertTitle>
        <AlertDescription>
          후보를 만들고 있습니다. 이 화면을 유지하면 결과가 자동으로 반영됩니다.
        </AlertDescription>
      </Alert>
    )
  }

  if (!errorMessage) return null

  return (
    <Alert variant="destructive">
      <AlertTitle>생성 실패</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{errorMessage}</span>
        {onRetry ? (
          <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
            다시 시도
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
