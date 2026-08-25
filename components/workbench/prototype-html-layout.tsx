"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  CopyHero,
  FilterChips,
  GalleryCards,
  HtmlPreviewPanel,
  ItemList,
  LeadForm,
  MetricCards,
  SideNav,
  SiteFooter,
  SiteHeader,
} from "@/components/workbench/prototype-html-blocks"
import { prototypeRows, type PrototypeHtmlModel } from "@/components/workbench/prototype-html-model"
import type { LayoutKind } from "@/lib/ai/preview-theme"

export function PrototypeHtmlLayout({
  layout,
  model,
}: {
  layout: LayoutKind
  model: PrototypeHtmlModel
}) {
  switch (layout) {
    case "app":
      return <AppLayout model={model} />
    case "dashboard":
      return <DashboardLayout model={model} />
    case "gallery":
      return <GalleryLayout model={model} />
    case "pricing":
      return <PricingLayout model={model} />
    case "split":
      return <SplitLayout model={model} />
    case "onboard":
      return <OnboardLayout model={model} />
    case "article":
      return <ArticleLayout model={model} />
    case "checkout":
      return <CheckoutLayout model={model} />
    case "settings":
      return <SettingsLayout model={model} />
    case "kanban":
      return <KanbanLayout model={model} />
    case "chat":
      return <ChatLayout model={model} />
    case "search":
      return <SearchLayout model={model} />
    case "profile":
      return <ProfileLayout model={model} />
    case "map":
      return <MapLayout model={model} />
    case "video":
      return <VideoLayout model={model} />
    case "timeline":
      return <TimelineLayout model={model} />
    case "wizard":
      return <WizardLayout model={model} />
    case "calendar":
      return <CalendarLayout model={model} />
    case "inbox":
      return <InboxLayout model={model} />
    default:
      return <HeroLayout model={model} />
  }
}

function AppLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <div className="flex h-12 items-center justify-between bg-primary px-4 text-sm text-primary-foreground">
        <strong>{model.brand}</strong>
        <span>
          {model.primaryCta} · {model.kitTitle}
        </span>
      </div>
      <div className="flex min-h-0 flex-1">
        <SideNav model={model} />
        <div className="flex min-w-0 flex-1 gap-3 p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <MetricCards model={model} />
            <section className="flex-1 space-y-3 rounded-xl border bg-card p-4 shadow-sm">
              <h3 className="text-base font-semibold">{model.title}</h3>
              <ItemList model={model} />
              <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
                {model.primaryCta}
              </Button>
            </section>
          </div>
          <aside className="hidden w-64 shrink-0 lg:block">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">상세</CardTitle>
                <CardDescription>{model.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  {(model.hints.length ? model.hints : model.keywords).slice(0, 3).map((item) => (
                    <li key={item} className="rounded-md bg-muted px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
                <Button type="button" className="w-full" size={model.buttonSize} variant={model.buttonVariant}>
                  적용
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  )
}

function DashboardLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <div className="flex min-h-0 flex-1">
        <SideNav model={model} />
        <div className="flex-1 space-y-4 p-4">
          <MetricCards model={model} />
          <table className="w-full overflow-hidden rounded-xl border bg-card text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">항목</th>
                <th className="px-4 py-2 font-medium">상태</th>
                <th className="px-4 py-2 font-medium">메모</th>
              </tr>
            </thead>
            <tbody>
              {prototypeRows(model).map((row) => (
                <tr key={row.title} className="border-t">
                  <td className="px-4 py-2">{row.title}</td>
                  <td className="px-4 py-2">
                    <Badge variant={model.badgeVariant}>{row.badge}</Badge>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{row.meta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function GalleryLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <div className="space-y-4 px-4 py-4">
        <FilterChips model={model} />
        <GalleryCards model={model} />
      </div>
      <SiteFooter model={model} />
    </>
  )
}

function PricingLayout({ model }: { model: PrototypeHtmlModel }) {
  const plans = [
    { name: "스타터", price: "무료", cta: model.secondaryCta },
    { name: model.primaryCta, price: "₩29,000", cta: "이 플랜" },
    { name: "팀", price: "₩79,000", cta: "문의" },
  ]
  return (
    <>
      <SiteHeader model={model} />
      <div className="space-y-4 px-4 py-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">{model.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{model.summary}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan, index) => (
            <Card key={plan.name} className={index === 1 ? "border-primary" : undefined}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription className="text-2xl font-semibold text-foreground">
                  {plan.price}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {(model.hints.length ? model.hints : model.keywords).slice(0, 3).map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
                <Button
                  type="button"
                  className="w-full"
                  size={model.buttonSize}
                  variant={index === 1 ? model.buttonVariant : "outline"}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <SiteFooter model={model} />
    </>
  )
}

function SplitLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <section className="grid gap-6 px-4 py-6 lg:grid-cols-[1.2fr_0.8fr]">
        <CopyHero model={model} />
        <HtmlPreviewPanel model={model} />
      </section>
      <div className="px-4 pb-4">
        <LeadForm model={model} />
      </div>
      <SiteFooter model={model} />
    </>
  )
}

function HeroLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <section className="min-h-0 flex-1 space-y-6 px-4 py-8">
        <CopyHero model={model} />
        <HtmlPreviewPanel model={model} eyebrow="히어로" />
        <LeadForm model={model} />
      </section>
      <SiteFooter model={model} />
    </>
  )
}

function OnboardLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <header className="flex h-14 items-center justify-center border-b bg-card">
        <strong className="text-sm text-primary">{model.brand}</strong>
      </header>
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardDescription>1 / 3 단계</CardDescription>
            <CardTitle>{model.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{model.summary}</p>
            <div className="space-y-1">
              <Label htmlFor="onboard-name">이름</Label>
              <Input id="onboard-name" readOnly placeholder={model.brand} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="onboard-mail">이메일</Label>
              <Input id="onboard-mail" readOnly placeholder="name@example.com" />
            </div>
            <Button type="button" className="w-full" size={model.buttonSize} variant={model.buttonVariant}>
              {model.primaryCta}
            </Button>
          </CardContent>
        </Card>
      </div>
      <SiteFooter model={model} />
    </>
  )
}

function ArticleLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <div className="grid gap-6 px-4 py-6 lg:grid-cols-[1fr_220px]">
        <article className="space-y-3 rounded-xl border bg-card p-6">
          <h2 className="text-2xl font-semibold">{model.title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{model.summary}</p>
          <Separator />
          <ul className="space-y-2 text-sm">
            {(model.hints.length ? model.hints : model.keywords).map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </article>
        <aside>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">목차</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. {model.primaryCta}</li>
                <li>2. {model.secondaryCta}</li>
                <li>3. {model.wireTitle}</li>
              </ol>
            </CardContent>
          </Card>
        </aside>
      </div>
      <SiteFooter model={model} />
    </>
  )
}

function CheckoutLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <div className="grid gap-6 px-4 py-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form className="space-y-3 rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">결제 정보</h2>
          <div className="space-y-1">
            <Label htmlFor="check-name">이름</Label>
            <Input id="check-name" readOnly placeholder={model.brand} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="check-mail">이메일</Label>
            <Input id="check-mail" readOnly placeholder="name@example.com" />
          </div>
          <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
            {model.primaryCta}
          </Button>
        </form>
        <aside>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">주문 요약</CardTitle>
              <CardDescription>{model.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {prototypeRows(model).slice(0, 3).map((row) => (
                <p key={row.title} className="flex justify-between">
                  <span>{row.title}</span>
                  <Badge variant="outline">{row.badge}</Badge>
                </p>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
      <SiteFooter model={model} />
    </>
  )
}

function SettingsLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <div className="flex min-h-0 flex-1">
        <SideNav model={model} />
        <form className="flex-1 space-y-4 p-6">
          <h2 className="text-lg font-semibold">{model.title}</h2>
          <div className="space-y-1">
            <Label htmlFor="set-org">조직</Label>
            <Input id="set-org" readOnly placeholder={model.brand} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="set-hint">표시 이름</Label>
            <Input id="set-hint" readOnly placeholder={model.hints[0] ?? model.primaryCta} />
          </div>
          <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
            저장
          </Button>
        </form>
      </div>
    </>
  )
}

function KanbanLayout({ model }: { model: PrototypeHtmlModel }) {
  const columns = ["대기", "진행", "완료"]
  const rows = prototypeRows(model)
  return (
    <>
      <SiteHeader model={model} />
      <div className="flex min-h-0 flex-1">
        <SideNav model={model} />
        <div className="grid flex-1 grid-cols-3 gap-3 p-4">
          {columns.map((column, index) => (
            <section key={column} className="rounded-xl border bg-muted/40 p-3">
              <h3 className="mb-2 text-sm font-semibold">{column}</h3>
              <ul className="space-y-2">
                {rows.slice(index, index + 2).map((row) => (
                  <li key={`${column}-${row.title}`}>
                    <Card>
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm">{row.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{row.meta}</CardDescription>
                      </CardHeader>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}

function ChatLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr]">
        <aside className="border-r bg-card">
          <ItemList model={model} />
        </aside>
        <section className="flex flex-col">
          <div className="flex-1 space-y-3 p-4">
            <p className="max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm">{model.summary}</p>
            <p className="ml-auto max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
              {model.primaryCta}로 진행할까요?
            </p>
          </div>
          <div className="flex gap-2 border-t p-3">
            <Input readOnly placeholder="메시지를 입력하세요" />
            <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
              보내기
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}

function SearchLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <div className="space-y-4 px-4 py-4">
        <form className="flex gap-2">
          <Input readOnly placeholder={model.primaryCta} />
          <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
            검색
          </Button>
        </form>
        <FilterChips model={model} />
        <ItemList model={model} />
      </div>
      <SiteFooter model={model} />
    </>
  )
}

function ProfileLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <section className="space-y-4 px-4 py-6">
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
          <Avatar>
            <AvatarFallback>{model.brand.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{model.title}</h2>
            <p className="text-sm text-muted-foreground">{model.summary}</p>
          </div>
        </div>
        <FilterChips model={model} />
        <GalleryCards model={model} />
      </section>
    </>
  )
}

function MapLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr]">
        <aside className="border-r p-3">
          <ItemList model={model} />
        </aside>
        <section className="grid grid-cols-6 grid-rows-4 gap-1 bg-muted p-3">
          {Array.from({ length: 24 }, (_, index) => (
            <div
              key={index}
              className={`rounded-sm ${index === 10 ? "bg-primary" : "bg-card"}`}
            />
          ))}
        </section>
      </div>
      <SiteFooter model={model} />
    </>
  )
}

function VideoLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <div className="grid gap-4 px-4 py-4 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="space-y-3">
          <div className="flex aspect-video items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <div className="space-y-2 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg text-accent-foreground">
                ▶
              </span>
              <p className="text-sm">{model.title}</p>
            </div>
          </div>
          <h2 className="text-lg font-semibold">{model.title}</h2>
          <p className="text-sm text-muted-foreground">{model.summary}</p>
        </section>
        <aside>
          <h3 className="mb-2 text-sm font-semibold">추천</h3>
          <ItemList model={model} />
        </aside>
      </div>
    </>
  )
}

function TimelineLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <div className="space-y-4 px-4 py-4">
        <FilterChips model={model} />
        <ol className="space-y-3 border-l pl-4">
          {prototypeRows(model).map((row) => (
            <li key={row.title} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
              <p className="text-sm font-medium">{row.title}</p>
              <p className="text-xs text-muted-foreground">{row.meta}</p>
            </li>
          ))}
        </ol>
      </div>
      <SiteFooter model={model} />
    </>
  )
}

function WizardLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <div className="flex min-h-0 flex-1 items-center justify-center px-4">
        <Card className="max-w-lg text-center">
          <CardHeader>
            <CardTitle>{model.title}</CardTitle>
            <CardDescription>{model.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
              {model.primaryCta}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function CalendarLayout({ model }: { model: PrototypeHtmlModel }) {
  const days = ["월", "화", "수", "목", "금", "토", "일"]
  return (
    <>
      <SiteHeader model={model} />
      <div className="grid gap-4 px-4 py-4 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-xl border bg-card p-3">
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {days.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
            {Array.from({ length: 28 }, (_, index) => (
              <span
                key={index}
                className={`rounded-md py-2 text-sm ${index === 11 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                {index + 1}
              </span>
            ))}
          </div>
        </section>
        <aside>
          <h3 className="mb-2 text-sm font-semibold">일정</h3>
          <ItemList model={model} />
        </aside>
      </div>
    </>
  )
}

function InboxLayout({ model }: { model: PrototypeHtmlModel }) {
  return (
    <>
      <SiteHeader model={model} />
      <div className="grid min-h-0 flex-1 grid-cols-[160px_240px_1fr]">
        <SideNav model={model} />
        <aside className="border-r">
          <ItemList model={model} />
        </aside>
        <article className="space-y-3 p-6">
          <h2 className="text-lg font-semibold">{model.title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{model.summary}</p>
          <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
            답장
          </Button>
        </article>
      </div>
    </>
  )
}
