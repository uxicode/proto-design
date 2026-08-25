import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <p className="font-mono text-xs tracking-widest text-muted-foreground">
        DESIGN DECISION WORKFLOW
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
        예쁜 이미지부터 만들지 않습니다.
        <span className="mt-2 block text-muted-foreground">
          컨셉을 고르고, 색을 고르고, 구조를 고른 뒤에야 화면이 나옵니다.
        </span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        ProtoMatch는 기획자·창업자·개발자·디자이너가 초기 비주얼 방향을 단계별로
        합의하도록 돕습니다. 최종 프로토타입 이미지는 파이프라인의 마지막 산출물입니다.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/projects">시작하기</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/onboarding">3단계 안내</Link>
        </Button>
      </div>
      <ol className="mt-16 grid gap-4 md:grid-cols-5">
        {[
          "분야·키워드",
          "컨셉",
          "팔레트",
          "와이어",
          "컴포넌트 → 이미지",
        ].map((label, index) => (
          <li
            key={label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="font-mono text-xs text-muted-foreground">
              {String(index).padStart(2, "0")}
            </p>
            <p className="mt-2 font-medium">{label}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
