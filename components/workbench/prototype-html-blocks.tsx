"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PrototypeHtmlModel, PrototypeRow } from "@/components/workbench/prototype-html-model"
import { prototypeRows } from "@/components/workbench/prototype-html-model"

export function SiteHeader({ model }: { model: PrototypeHtmlModel }) {
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4">
      <strong className="text-sm text-primary">{model.brand}</strong>
      <nav className="hidden items-center gap-4 text-sm text-foreground sm:flex">
        <span>{model.primaryCta}</span>
        <span>{model.secondaryCta}</span>
        <span>로그인</span>
      </nav>
      <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
        시작
      </Button>
    </header>
  )
}

export function SiteFooter({ model }: { model: PrototypeHtmlModel }) {
  return (
    <footer className="bg-primary px-4 py-3 text-xs text-primary-foreground">
      {model.brand} · {model.keywords.join(" · ") || model.wireTitle}
    </footer>
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
    <article className="flex min-h-[220px] flex-col justify-between rounded-xl bg-primary p-5 text-primary-foreground">
      <header className="space-y-2">
        <Badge variant="secondary">{eyebrow ?? model.wireTitle}</Badge>
        <h3 className="text-lg font-semibold leading-snug">{model.title}</h3>
        <p className="text-sm text-primary-foreground/80">{model.summary}</p>
      </header>
      <ul className="mt-4 space-y-2">
        {rows.map((item) => (
          <li key={item} className="rounded-md bg-background/15 px-3 py-2 text-sm">
            {item}
          </li>
        ))}
      </ul>
      <Button
        type="button"
        className="mt-4 self-start"
        size={model.buttonSize}
        variant="secondary"
      >
        {model.primaryCta}
      </Button>
    </article>
  )
}

export function CopyHero({ model }: { model: PrototypeHtmlModel }) {
  return (
    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{model.brand}</p>
      <h2 className="text-3xl font-semibold leading-tight">{model.title}</h2>
      <p className="max-w-xl text-sm text-muted-foreground">{model.summary}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
          {model.primaryCta}
        </Button>
        <Button type="button" size={model.buttonSize} variant="outline">
          {model.secondaryCta}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {model.hints.join(" · ") || model.wireNotes} · {model.kitTitle}
      </p>
    </section>
  )
}

export function ItemList({ model }: { model: PrototypeHtmlModel }) {
  return (
    <ul className="divide-y rounded-xl border bg-card">
      {prototypeRows(model).map((row) => (
        <ListRow key={row.title} row={row} variant={model.badgeVariant} />
      ))}
    </ul>
  )
}

export function ListRow({
  row,
  variant,
}: {
  row: PrototypeRow
  variant: PrototypeHtmlModel["badgeVariant"]
}) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{row.title}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{row.meta}</p>
      </div>
      <Badge variant={variant}>{row.badge}</Badge>
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
      {metrics.map((item) => (
        <Card key={item.label}>
          <CardHeader className="p-3">
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-xl">{item.value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

export function LeadForm({ model }: { model: PrototypeHtmlModel }) {
  return (
    <form className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
      <div className="min-w-[200px] flex-1 space-y-1">
        <Label htmlFor="proto-email">이메일</Label>
        <Input id="proto-email" readOnly placeholder="name@example.com" />
      </div>
      <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
        {model.primaryCta}
      </Button>
    </form>
  )
}

export function SideNav({ model }: { model: PrototypeHtmlModel }) {
  const items = ["홈", model.primaryCta, model.secondaryCta, model.hints[0] ?? "설정"]
  return (
    <aside className="flex w-48 shrink-0 flex-col gap-1 bg-primary p-3 text-primary-foreground">
      {items.map((item, index) => (
        <span
          key={item}
          className={`rounded-md px-3 py-2 text-sm ${index === 0 ? "bg-accent text-accent-foreground" : "opacity-90"}`}
        >
          {item}
        </span>
      ))}
    </aside>
  )
}

export function GalleryCards({ model }: { model: PrototypeHtmlModel }) {
  const cards = [
    { title: model.title, body: model.summary },
    { title: model.primaryCta, body: model.hints[0] ?? model.wireNotes },
    { title: model.secondaryCta, body: model.kitTitle },
  ]
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={card.title} className="overflow-hidden">
          <div className="space-y-2 bg-primary p-4 text-primary-foreground">
            <Badge variant="secondary">{index === 0 ? model.wireTitle : `0${index + 1}`}</Badge>
            <p className="text-sm font-medium">{card.title}</p>
            <ul className="space-y-1 text-xs text-primary-foreground/80">
              {(model.hints.slice(0, 2).length ? model.hints.slice(0, 2) : model.keywords.slice(0, 2)).map(
                (hint) => (
                  <li key={hint}>· {hint}</li>
                )
              )}
            </ul>
          </div>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">{card.title}</CardTitle>
            <CardDescription className="line-clamp-2">{card.body}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Button type="button" size={model.buttonSize} variant={model.buttonVariant}>
              자세히
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function FilterChips({ model }: { model: PrototypeHtmlModel }) {
  const chips = [model.primaryCta, model.secondaryCta, model.hints[0] ?? "전체"]
  return (
    <ul className="flex flex-wrap gap-2">
      {chips.map((chip, index) => (
        <li key={chip}>
          <Badge variant={index === 0 ? model.badgeVariant : "outline"}>{chip}</Badge>
        </li>
      ))}
    </ul>
  )
}
