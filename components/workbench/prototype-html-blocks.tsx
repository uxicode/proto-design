"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CanvasPart } from "@/components/workbench/canvas/canvas-part"
import { CanvasSlot } from "@/components/workbench/canvas/canvas-slot"
import type { PrototypeHtmlModel, PrototypeRow } from "@/components/workbench/prototype-html-model"
import { prototypeRows } from "@/components/workbench/prototype-html-model"

export function SiteHeader({ model }: { model: PrototypeHtmlModel }) {
  const navItems = [model.primaryCta, model.secondaryCta, "로그인"]
  return (
    <CanvasSlot id="header" label="헤더">
      <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4">
        <CanvasPart id="header-brand" label="브랜드">
          <strong className="text-sm text-primary">{model.brand}</strong>
        </CanvasPart>
        <nav className="hidden items-center gap-4 text-sm text-foreground sm:flex">
          {navItems.map((item, index) => (
            <CanvasPart key={`${item}-${index}`} id={`header-nav-${index}`} label={`메뉴 ${index + 1}`}>
              <span>{item}</span>
            </CanvasPart>
          ))}
        </nav>
        <CanvasPart id="header-cta" label="시작 버튼">
          <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
            시작
          </Button>
        </CanvasPart>
      </header>
    </CanvasSlot>
  )
}

export function SiteFooter({ model }: { model: PrototypeHtmlModel }) {
  return (
    <CanvasSlot id="footer" label="푸터">
      <footer className="bg-primary px-4 py-3 text-xs text-primary-foreground">
        <CanvasPart id="footer-copy" label="푸터 문구">
          <span>
            {model.brand} · {model.keywords.join(" · ") || model.wireTitle}
          </span>
        </CanvasPart>
      </footer>
    </CanvasSlot>
  )
}

export function HtmlPreviewPanel({
  model,
  eyebrow,
}: {
  model: PrototypeHtmlModel
  eyebrow?: string
}) {
  const rows = (model.hints.length > 0 ? model.hints : model.keywords).slice(0, 4)
  return (
    <CanvasSlot id="preview" label="프리뷰 패널">
      <article className="flex min-h-[220px] flex-col justify-between rounded-xl bg-primary p-5 text-primary-foreground">
        <header className="space-y-2">
          <CanvasPart id="preview-badge" label="프리뷰 배지">
            <Badge variant="secondary">{eyebrow ?? model.wireTitle}</Badge>
          </CanvasPart>
          <CanvasPart id="preview-title" label="프리뷰 제목" block>
            <h3 className="text-lg font-semibold leading-snug">{model.title}</h3>
          </CanvasPart>
          <CanvasPart id="preview-summary" label="프리뷰 설명" block>
            <p className="text-sm text-primary-foreground/80">{model.summary}</p>
          </CanvasPart>
        </header>
        <ul className="mt-4 space-y-2">
          {rows.map((item, index) => (
            <li key={item}>
              <CanvasPart id={`preview-row-${index}`} label={`프리뷰 항목 ${index + 1}`} block>
                <span className="block rounded-md bg-background/15 px-3 py-2 text-sm">{item}</span>
              </CanvasPart>
            </li>
          ))}
        </ul>
        <CanvasPart id="preview-cta" label="프리뷰 버튼">
          <Button type="button" className="mt-4 self-start" size={model.buttonSize} variant="secondary">
            {model.primaryCta}
          </Button>
        </CanvasPart>
      </article>
    </CanvasSlot>
  )
}

export function CopyHero({ model }: { model: PrototypeHtmlModel }) {
  return (
    <CanvasSlot id="hero" label="히어로">
      <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <CanvasPart id="hero-brand" label="히어로 브랜드">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{model.brand}</p>
        </CanvasPart>
        <CanvasPart id="hero-title" label="히어로 제목" block>
          <h2 className="text-3xl font-semibold leading-tight">{model.title}</h2>
        </CanvasPart>
        <CanvasPart id="hero-summary" label="히어로 설명" block>
          <p className="max-w-xl text-sm text-muted-foreground">{model.summary}</p>
        </CanvasPart>
        <div className="flex flex-wrap gap-2">
          <CanvasPart id="hero-cta" label="히어로 주 버튼">
            <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
              {model.primaryCta}
            </Button>
          </CanvasPart>
          <CanvasPart id="hero-cta-secondary" label="히어로 보조 버튼">
            <Button type="button" size={model.buttonSize} variant="outline">
              {model.secondaryCta}
            </Button>
          </CanvasPart>
        </div>
        <CanvasPart id="hero-meta" label="히어로 부가 문구" block>
          <p className="text-xs text-muted-foreground">
            {model.hints.join(" · ") || model.wireNotes} · {model.kitTitle}
          </p>
        </CanvasPart>
      </section>
    </CanvasSlot>
  )
}

export function ItemList({ model }: { model: PrototypeHtmlModel }) {
  return (
    <CanvasSlot id="list" label="목록">
      <ul className="divide-y rounded-xl border bg-card">
        {prototypeRows(model).map((row, index) => (
          <ListRow key={row.title} row={row} index={index} variant={model.badgeVariant} />
        ))}
      </ul>
    </CanvasSlot>
  )
}

export function ListRow({
  row,
  index,
  variant,
}: {
  row: PrototypeRow
  index: number
  variant: PrototypeHtmlModel["badgeVariant"]
}) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <CanvasPart id={`list-${index}-title`} label={`목록 제목 ${index + 1}`} block>
          <p className="truncate text-sm font-medium">{row.title}</p>
        </CanvasPart>
        <CanvasPart id={`list-${index}-meta`} label={`목록 설명 ${index + 1}`} block>
          <p className="line-clamp-1 text-xs text-muted-foreground">{row.meta}</p>
        </CanvasPart>
      </div>
      <CanvasPart id={`list-${index}-badge`} label={`목록 배지 ${index + 1}`}>
        <Badge variant={variant}>{row.badge}</Badge>
      </CanvasPart>
    </li>
  )
}

export function MetricCards({ model }: { model: PrototypeHtmlModel }) {
  const metrics = [
    { label: "활성", value: "12,480" },
    { label: model.primaryCta, value: "98.2%" },
    { label: "전환", value: "+18%" },
  ]
  return (
    <div className="grid grid-cols-3 gap-3">
      {metrics.map((item, index) => (
        <CanvasSlot key={item.label} id={`metric-${index}`} label={`지표 ${index + 1}`}>
          <Card>
            <CardHeader className="p-3">
              <CanvasPart id={`metric-${index}-label`} label={`지표 라벨 ${index + 1}`} block>
                <CardDescription>{item.label}</CardDescription>
              </CanvasPart>
              <CanvasPart id={`metric-${index}-value`} label={`지표 값 ${index + 1}`} block>
                <CardTitle className="text-xl">{item.value}</CardTitle>
              </CanvasPart>
            </CardHeader>
          </Card>
        </CanvasSlot>
      ))}
    </div>
  )
}

export function LeadForm({ model }: { model: PrototypeHtmlModel }) {
  return (
    <CanvasSlot id="form" label="폼">
      <form className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <div className="min-w-[200px] flex-1 space-y-1">
          <CanvasPart id="form-label" label="이메일 라벨" block>
            <Label htmlFor="proto-email">이메일</Label>
          </CanvasPart>
          <CanvasPart id="form-input" label="이메일 입력" block>
            <Input id="proto-email" readOnly placeholder="name@example.com" />
          </CanvasPart>
        </div>
        <CanvasPart id="form-cta" label="폼 버튼">
          <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
            {model.primaryCta}
          </Button>
        </CanvasPart>
      </form>
    </CanvasSlot>
  )
}

export function SideNav({ model }: { model: PrototypeHtmlModel }) {
  const items = ["홈", model.primaryCta, model.secondaryCta, model.hints[0] ?? "설정"]
  return (
    <CanvasSlot id="sidenav" label="사이드 내비게이션" className="flex w-48 shrink-0">
      <aside className="flex w-full flex-col gap-1 bg-primary p-3 text-primary-foreground">
        {items.map((item, index) => (
          <CanvasPart key={item} id={`sidenav-${index}`} label={`사이드 메뉴 ${index + 1}`} block>
            <span
              className={`block rounded-md px-3 py-2 text-sm ${index === 0 ? "bg-accent text-accent-foreground" : "opacity-90"}`}
            >
              {item}
            </span>
          </CanvasPart>
        ))}
      </aside>
    </CanvasSlot>
  )
}

export function GalleryCards({ model }: { model: PrototypeHtmlModel }) {
  const cards = [
    { title: model.title, body: model.summary },
    { title: model.primaryCta, body: model.hints[0] ?? model.wireNotes },
    { title: model.secondaryCta, body: model.kitTitle },
  ]
  const hints = model.hints.slice(0, 2).length ? model.hints.slice(0, 2) : model.keywords.slice(0, 2)
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card, index) => (
        <CanvasSlot key={`${card.title}-${index}`} id={`gallery-${index}`} label={`카드 ${index + 1}`}>
          <Card className="overflow-hidden">
            <div className="space-y-2 bg-primary p-4 text-primary-foreground">
              <CanvasPart id={`gallery-${index}-badge`} label={`카드 ${index + 1} 배지`}>
                <Badge variant="secondary">{index === 0 ? model.wireTitle : `0${index + 1}`}</Badge>
              </CanvasPart>
              <CanvasPart id={`gallery-${index}-kicker`} label={`카드 ${index + 1} 키커`} block>
                <p className="text-sm font-medium">{card.title}</p>
              </CanvasPart>
              <ul className="space-y-1 text-xs text-primary-foreground/80">
                {hints.map((hint, hintIndex) => (
                  <li key={hint}>
                    <CanvasPart
                      id={`gallery-${index}-hint-${hintIndex}`}
                      label={`카드 ${index + 1} 항목 ${hintIndex + 1}`}
                      block
                    >
                      <span>· {hint}</span>
                    </CanvasPart>
                  </li>
                ))}
              </ul>
            </div>
            <CardHeader className="p-4">
              <CanvasPart id={`gallery-${index}-title`} label={`카드 ${index + 1} 제목`} block>
                <CardTitle className="text-sm">{card.title}</CardTitle>
              </CanvasPart>
              <CanvasPart id={`gallery-${index}-body`} label={`카드 ${index + 1} 설명`} block>
                <CardDescription className="line-clamp-2">{card.body}</CardDescription>
              </CanvasPart>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <CanvasPart id={`gallery-${index}-button`} label={`카드 ${index + 1} 버튼`}>
                <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
                  자세히
                </Button>
              </CanvasPart>
            </CardContent>
          </Card>
        </CanvasSlot>
      ))}
    </div>
  )
}

export function FilterChips({ model }: { model: PrototypeHtmlModel }) {
  const chips = [model.primaryCta, model.secondaryCta, model.hints[0] ?? "전체"]
  return (
    <CanvasSlot id="chips" label="필터 칩">
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip, index) => (
          <li key={chip}>
            <CanvasPart id={`chips-${index}`} label={`칩 ${index + 1}`}>
              <Badge variant={index === 0 ? model.badgeVariant : "outline"}>{chip}</Badge>
            </CanvasPart>
          </li>
        ))}
      </ul>
    </CanvasSlot>
  )
}
