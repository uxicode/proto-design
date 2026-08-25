"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useProjectStore } from "@/lib/projects/store"

const SLIDES = [
  {
    title: "한 단계씩 보고 고릅니다",
    body: "컨셉, 컬러, 와이어프레임, 컴포넌트를 순서대로 비교합니다. 말을 반복하는 대신 시각 후보로 합의합니다.",
  },
  {
    title: "이미지는 마지막입니다",
    body: "예쁜 화면부터 만들지 않습니다. 네 단계를 확정한 뒤에만 최종 프로토타입 이미지 한 장이 나옵니다.",
  },
  {
    title: "이 브라우저에만 저장됩니다",
    body: "1차 버전은 로그인과 서버 저장이 없습니다. 같은 브라우저에서 새로고침하면 이어서 볼 수 있습니다.",
  },
]

export function OnboardingWizard() {
  const router = useRouter()
  const completeOnboarding = useProjectStore((state) => state.completeOnboarding)

  function finish(): void {
    completeOnboarding()
    router.push("/projects")
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <ol className="space-y-6">
        {SLIDES.map((slide, index) => (
          <li key={slide.title} className="rounded-xl border border-border p-6">
            <p className="font-mono text-xs text-muted-foreground">0{index + 1}</p>
            <h2 className="mt-2 text-xl font-semibold">{slide.title}</h2>
            <p className="mt-2 text-muted-foreground">{slide.body}</p>
          </li>
        ))}
      </ol>
      <div className="flex gap-3">
        <Button type="button" onClick={finish}>
          시작하기
        </Button>
        <Button type="button" variant="ghost" onClick={finish}>
          건너뛰기
        </Button>
      </div>
    </div>
  )
}
