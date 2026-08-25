import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface StaleBannerProps {
  visible: boolean
}

export function StaleBanner({ visible }: StaleBannerProps) {
  if (!visible) return null
  return (
    <Alert>
      <AlertTitle>이후 단계를 다시 확정하세요</AlertTitle>
      <AlertDescription>
        앞 단계가 바뀌어 다음 확정이 오래되었습니다. 최종 이미지는 잠겨 있습니다.
      </AlertDescription>
    </Alert>
  )
}
