import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          ProtoMatch
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground">
            프로젝트
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80">
      <div className="mx-auto max-w-6xl px-4 py-8 text-xs leading-relaxed text-muted-foreground">
        생성물은 참고용 프로토타입이며, 사용자는 상업적으로 활용할 수 있습니다.
        이 서비스는 출력을 모델 학습에 사용하지 않습니다. 제3자 권리·상표 사용은
        사용자 책임입니다.
      </div>
    </footer>
  )
}
