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
import { CanvasPart } from "@/components/workbench/canvas/canvas-part"
import { CanvasSlot } from "@/components/workbench/canvas/canvas-slot"
import { prototypeRows, type PrototypeHtmlModel } from "@/components/workbench/prototype-html-model"
import type { LayoutKind } from "@/lib/ai/preview-theme"

export function PrototypeHtmlLayout({
  layout,
  model,
}: {
  layout: LayoutKind
  model: PrototypeHtmlModel
}) {
  return (
    <CanvasSlot id="page" label="페이지" interactive={false} className="flex h-full min-h-full flex-col">
      <LayoutBody layout={layout} model={model} />
    </CanvasSlot>
  )
}

function LayoutBody({
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
      <CanvasSlot id="appbar" label="상단 바">
      <div className="flex h-12 items-center justify-between bg-primary px-4 text-sm text-primary-foreground">
        <CanvasPart id="appbar-brand" label="앱 브랜드">
          <strong>{model.brand}</strong>
        </CanvasPart>
        <CanvasPart id="appbar-meta" label="앱 상단 문구">
          <span>
            {model.primaryCta} · {model.kitTitle}
          </span>
        </CanvasPart>
      </div>
      </CanvasSlot>
      <div className="flex min-h-0 flex-1">
        <SideNav model={model} />
        <div className="flex min-w-0 flex-1 gap-3 p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <MetricCards model={model} />
            <CanvasSlot id="app-main" label="본문" className="flex-1">
            <section className="h-full space-y-3 rounded-xl border bg-card p-4 shadow-sm">
              <CanvasPart id="app-main-title" label="본문 제목" block>
                <h3 className="text-base font-semibold">{model.title}</h3>
              </CanvasPart>
              <ItemList model={model} />
              <CanvasPart id="app-main-cta" label="본문 버튼">
                <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
                  {model.primaryCta}
                </Button>
              </CanvasPart>
            </section>
            </CanvasSlot>
          </div>
          <CanvasSlot id="app-aside" label="상세 패널" className="hidden w-64 shrink-0 lg:block">
            <Card>
              <CardHeader>
                <CanvasPart id="app-aside-title" label="상세 제목" block>
                  <CardTitle className="text-sm">상세</CardTitle>
                </CanvasPart>
                <CanvasPart id="app-aside-body" label="상세 설명" block>
                  <CardDescription>{model.summary}</CardDescription>
                </CanvasPart>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  {(model.hints.length ? model.hints : model.keywords).slice(0, 3).map((item, index) => (
                    <li key={item}>
                      <CanvasPart id={`app-aside-item-${index}`} label={`상세 항목 ${index + 1}`} block>
                        <span className="block rounded-md bg-muted px-3 py-2">{item}</span>
                      </CanvasPart>
                    </li>
                  ))}
                </ul>
                <CanvasPart id="app-aside-cta" label="상세 적용 버튼" className="block w-full">
                  <Button type="button" className="w-full" size={model.buttonSize} variant={model.buttonVariant}>
                    적용
                  </Button>
                </CanvasPart>
              </CardContent>
            </Card>
          </CanvasSlot>
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
                    <CanvasPart id={`dash-badge-${row.title}`} label={`${row.title} 배지`}>
                      <Badge variant={model.badgeVariant}>{row.badge}</Badge>
                    </CanvasPart>
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
          <CanvasPart id="pricing-title" label="가격 제목" block>
            <h2 className="text-2xl font-semibold">{model.title}</h2>
          </CanvasPart>
          <CanvasPart id="pricing-summary" label="가격 설명" block>
            <p className="mt-2 text-sm text-muted-foreground">{model.summary}</p>
          </CanvasPart>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan, index) => (
            <CanvasSlot key={plan.name} id={`plan-${index}`} label={`${plan.name} 플랜`}>
            <Card className={index === 1 ? "border-primary" : undefined}>
              <CardHeader>
                <CanvasPart id={`plan-${index}-name`} label={`${plan.name} 이름`} block>
                  <CardTitle>{plan.name}</CardTitle>
                </CanvasPart>
                <CanvasPart id={`plan-${index}-price`} label={`${plan.name} 가격`} block>
                  <CardDescription className="text-2xl font-semibold text-foreground">
                    {plan.price}
                  </CardDescription>
                </CanvasPart>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {(model.hints.length ? model.hints : model.keywords).slice(0, 3).map((item, itemIndex) => (
                    <li key={item}>
                      <CanvasPart id={`plan-${index}-item-${itemIndex}`} label={`${plan.name} 항목 ${itemIndex + 1}`} block>
                        <span>· {item}</span>
                      </CanvasPart>
                    </li>
                  ))}
                </ul>
                <CanvasPart id={`plan-${index}-cta`} label={`${plan.name} 버튼`} className="block w-full">
                  <Button
                    type="button"
                    className="w-full"
                    size={model.buttonSize}
                    variant={index === 1 ? model.buttonVariant : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CanvasPart>
              </CardContent>
            </Card>
            </CanvasSlot>
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
        <CanvasPart id="onboard-brand" label="온보딩 브랜드">
          <strong className="text-sm text-primary">{model.brand}</strong>
        </CanvasPart>
      </header>
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CanvasPart id="onboard-step" label="온보딩 단계" block>
              <CardDescription>1 / 3 단계</CardDescription>
            </CanvasPart>
            <CanvasPart id="onboard-title" label="온보딩 제목" block>
              <CardTitle>{model.title}</CardTitle>
            </CanvasPart>
          </CardHeader>
          <CardContent className="space-y-3">
            <CanvasPart id="onboard-summary" label="온보딩 설명" block>
              <p className="text-sm text-muted-foreground">{model.summary}</p>
            </CanvasPart>
            <div className="space-y-1">
              <CanvasPart id="onboard-name-label" label="이름 라벨" block>
                <Label htmlFor="onboard-name">이름</Label>
              </CanvasPart>
              <CanvasPart id="onboard-name-input" label="이름 입력" block>
                <Input id="onboard-name" readOnly placeholder={model.brand} />
              </CanvasPart>
            </div>
            <div className="space-y-1">
              <CanvasPart id="onboard-mail-label" label="이메일 라벨" block>
                <Label htmlFor="onboard-mail">이메일</Label>
              </CanvasPart>
              <CanvasPart id="onboard-mail-input" label="이메일 입력" block>
                <Input id="onboard-mail" readOnly placeholder="name@example.com" />
              </CanvasPart>
            </div>
            <CanvasPart id="onboard-cta" label="온보딩 버튼" className="block w-full">
              <Button type="button" className="w-full" size={model.buttonSize} variant={model.buttonVariant}>
                {model.primaryCta}
              </Button>
            </CanvasPart>
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
          <CanvasPart id="article-title" label="아티클 제목" block>
            <h2 className="text-2xl font-semibold">{model.title}</h2>
          </CanvasPart>
          <CanvasPart id="article-summary" label="아티클 본문" block>
            <p className="text-sm leading-relaxed text-muted-foreground">{model.summary}</p>
          </CanvasPart>
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
              <CanvasPart id="article-toc-title" label="목차 제목" block>
                <CardTitle className="text-sm">목차</CardTitle>
              </CanvasPart>
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
          <CanvasPart id="checkout-title" label="결제 제목" block>
            <h2 className="text-lg font-semibold">결제 정보</h2>
          </CanvasPart>
          <div className="space-y-1">
            <CanvasPart id="checkout-name-label" label="결제 이름 라벨" block>
              <Label htmlFor="check-name">이름</Label>
            </CanvasPart>
            <CanvasPart id="checkout-name-input" label="결제 이름 입력" block>
              <Input id="check-name" readOnly placeholder={model.brand} />
            </CanvasPart>
          </div>
          <div className="space-y-1">
            <CanvasPart id="checkout-mail-label" label="결제 이메일 라벨" block>
              <Label htmlFor="check-mail">이메일</Label>
            </CanvasPart>
            <CanvasPart id="checkout-mail-input" label="결제 이메일 입력" block>
              <Input id="check-mail" readOnly placeholder="name@example.com" />
            </CanvasPart>
          </div>
          <CanvasPart id="checkout-cta" label="결제 버튼">
            <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
              {model.primaryCta}
            </Button>
          </CanvasPart>
        </form>
        <aside>
          <Card>
            <CardHeader>
              <CanvasPart id="checkout-summary-title" label="주문 요약 제목" block>
                <CardTitle className="text-sm">주문 요약</CardTitle>
              </CanvasPart>
              <CanvasPart id="checkout-summary-body" label="주문 요약 설명" block>
                <CardDescription>{model.title}</CardDescription>
              </CanvasPart>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {prototypeRows(model).slice(0, 3).map((row, index) => (
                <p key={row.title} className="flex justify-between gap-2">
                  <CanvasPart id={`checkout-row-${index}`} label={`주문 항목 ${index + 1}`}>
                    <span>{row.title}</span>
                  </CanvasPart>
                  <CanvasPart id={`checkout-badge-${index}`} label={`주문 배지 ${index + 1}`}>
                    <Badge variant="outline">{row.badge}</Badge>
                  </CanvasPart>
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
          <CanvasPart id="settings-title" label="설정 제목" block>
            <h2 className="text-lg font-semibold">{model.title}</h2>
          </CanvasPart>
          <div className="space-y-1">
            <CanvasPart id="settings-org-label" label="조직 라벨" block>
              <Label htmlFor="set-org">조직</Label>
            </CanvasPart>
            <CanvasPart id="settings-org-input" label="조직 입력" block>
              <Input id="set-org" readOnly placeholder={model.brand} />
            </CanvasPart>
          </div>
          <div className="space-y-1">
            <CanvasPart id="settings-hint-label" label="표시 이름 라벨" block>
              <Label htmlFor="set-hint">표시 이름</Label>
            </CanvasPart>
            <CanvasPart id="settings-hint-input" label="표시 이름 입력" block>
              <Input id="set-hint" readOnly placeholder={model.hints[0] ?? model.primaryCta} />
            </CanvasPart>
          </div>
          <CanvasPart id="settings-cta" label="저장 버튼">
            <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
              저장
            </Button>
          </CanvasPart>
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
              <CanvasPart id={`kanban-col-${index}`} label={`${column} 열`} block>
                <h3 className="mb-2 text-sm font-semibold">{column}</h3>
              </CanvasPart>
              <ul className="space-y-2">
                {rows.slice(index, index + 2).map((row, rowIndex) => (
                  <li key={`${column}-${row.title}`}>
                    <Card>
                      <CardHeader className="p-3">
                        <CanvasPart id={`kanban-${index}-${rowIndex}-title`} label={`${column} 카드 제목`} block>
                          <CardTitle className="text-sm">{row.title}</CardTitle>
                        </CanvasPart>
                        <CanvasPart id={`kanban-${index}-${rowIndex}-meta`} label={`${column} 카드 설명`} block>
                          <CardDescription className="line-clamp-2">{row.meta}</CardDescription>
                        </CanvasPart>
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
            <CanvasPart id="chat-input" label="채팅 입력" className="block min-w-0 flex-1">
              <Input readOnly placeholder="메시지를 입력하세요" />
            </CanvasPart>
            <CanvasPart id="chat-cta" label="보내기 버튼">
              <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
                보내기
              </Button>
            </CanvasPart>
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
          <CanvasPart id="search-input" label="검색 입력" className="block min-w-0 flex-1">
            <Input readOnly placeholder={model.primaryCta} />
          </CanvasPart>
          <CanvasPart id="search-cta" label="검색 버튼">
            <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
              검색
            </Button>
          </CanvasPart>
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
            <CanvasPart id="profile-title" label="프로필 제목" block>
              <h2 className="text-lg font-semibold">{model.title}</h2>
            </CanvasPart>
            <CanvasPart id="profile-summary" label="프로필 설명" block>
              <p className="text-sm text-muted-foreground">{model.summary}</p>
            </CanvasPart>
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
          <CanvasPart id="video-title" label="비디오 제목" block>
            <h2 className="text-lg font-semibold">{model.title}</h2>
          </CanvasPart>
          <CanvasPart id="video-summary" label="비디오 설명" block>
            <p className="text-sm text-muted-foreground">{model.summary}</p>
          </CanvasPart>
        </section>
        <aside>
          <CanvasPart id="video-related" label="추천 제목" block>
            <h3 className="mb-2 text-sm font-semibold">추천</h3>
          </CanvasPart>
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
          {prototypeRows(model).map((row, index) => (
            <li key={row.title} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
              <CanvasPart id={`timeline-${index}-title`} label={`타임라인 제목 ${index + 1}`} block>
                <p className="text-sm font-medium">{row.title}</p>
              </CanvasPart>
              <CanvasPart id={`timeline-${index}-meta`} label={`타임라인 설명 ${index + 1}`} block>
                <p className="text-xs text-muted-foreground">{row.meta}</p>
              </CanvasPart>
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
            <CanvasPart id="wizard-title" label="위저드 제목" block>
              <CardTitle>{model.title}</CardTitle>
            </CanvasPart>
            <CanvasPart id="wizard-summary" label="위저드 설명" block>
              <CardDescription>{model.summary}</CardDescription>
            </CanvasPart>
          </CardHeader>
          <CardContent>
            <CanvasPart id="wizard-cta" label="위저드 버튼">
              <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
                {model.primaryCta}
              </Button>
            </CanvasPart>
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
          <CanvasPart id="calendar-aside-title" label="일정 제목" block>
            <h3 className="mb-2 text-sm font-semibold">일정</h3>
          </CanvasPart>
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
          <CanvasPart id="inbox-title" label="인박스 제목" block>
            <h2 className="text-lg font-semibold">{model.title}</h2>
          </CanvasPart>
          <CanvasPart id="inbox-summary" label="인박스 본문" block>
            <p className="text-sm leading-relaxed text-muted-foreground">{model.summary}</p>
          </CanvasPart>
          <CanvasPart id="inbox-cta" label="답장 버튼">
            <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
              답장
            </Button>
          </CanvasPart>
        </article>
      </div>
    </>
  )
}
