import { catalogItem } from "@/lib/canvas/shadcn-catalog"
import type {
  CanvasAlertProps,
  CanvasAvatarProps,
  CanvasBadgeProps,
  CanvasButtonProps,
  CanvasCardProps,
  CanvasCheckboxProps,
  CanvasInputProps,
  CanvasInstance,
  CanvasLabelProps,
  CanvasRadioGroupProps,
  CanvasSelectProps,
  CanvasSeparatorProps,
  CanvasSwitchProps,
  CanvasTabsProps,
  CanvasTextareaProps,
} from "@/types/domain"

function attr(name: string, value: string | boolean | number): string {
  if (typeof value === "boolean") return value ? ` ${name}` : ""
  if (typeof value === "number") return ` ${name}={${value}}`
  return ` ${name}=${JSON.stringify(value)}`
}

function textExpr(value: string): string {
  return `{${JSON.stringify(value)}}`
}

export function generateInstanceJsx(instance: CanvasInstance): string {
  const { importPath } = catalogItem(instance.type)
  const { type, props } = instance

  switch (type) {
    case "button": {
      const item = props as CanvasButtonProps
      return [
        `import { Button } from "${importPath}"`,
        "",
        `<Button${attr("variant", item.variant)}${attr("size", item.size)}${attr("disabled", item.disabled)}>`,
        `  ${textExpr(item.label)}`,
        `</Button>`,
      ].join("\n")
    }
    case "input": {
      const item = props as CanvasInputProps
      return [
        `import { Input } from "${importPath}"`,
        "",
        `<Input${attr("placeholder", item.placeholder)}${attr("value", item.value)}${attr("disabled", item.disabled)} />`,
      ].join("\n")
    }
    case "textarea": {
      const item = props as CanvasTextareaProps
      return [
        `import { Textarea } from "${importPath}"`,
        "",
        `<Textarea${attr("placeholder", item.placeholder)}${attr("value", item.value)}${attr("disabled", item.disabled)} />`,
      ].join("\n")
    }
    case "label": {
      const item = props as CanvasLabelProps
      return [
        `import { Label } from "${importPath}"`,
        "",
        `<Label>${textExpr(item.text)}</Label>`,
      ].join("\n")
    }
    case "card": {
      const item = props as CanvasCardProps
      return [
        `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "${importPath}"`,
        "",
        `<Card>`,
        `  <CardHeader>`,
        `    <CardTitle>${textExpr(item.title)}</CardTitle>`,
        `    <CardDescription>${textExpr(item.description)}</CardDescription>`,
        `  </CardHeader>`,
        `  <CardContent>`,
        `    <p>${textExpr(item.body)}</p>`,
        `  </CardContent>`,
        `</Card>`,
      ].join("\n")
    }
    case "badge": {
      const item = props as CanvasBadgeProps
      return [
        `import { Badge } from "${importPath}"`,
        "",
        `<Badge${attr("variant", item.variant)}>`,
        `  ${textExpr(item.label)}`,
        `</Badge>`,
      ].join("\n")
    }
    case "alert": {
      const item = props as CanvasAlertProps
      return [
        `import { Alert, AlertDescription, AlertTitle } from "${importPath}"`,
        "",
        `<Alert>`,
        `  <AlertTitle>${textExpr(item.title)}</AlertTitle>`,
        `  <AlertDescription>${textExpr(item.description)}</AlertDescription>`,
        `</Alert>`,
      ].join("\n")
    }
    case "separator": {
      const item = props as CanvasSeparatorProps
      return [
        `import { Separator } from "${importPath}"`,
        "",
        `<Separator${attr("orientation", item.orientation)} />`,
      ].join("\n")
    }
    case "radio-group": {
      const item = props as CanvasRadioGroupProps
      const layoutClass =
        item.orientation === "horizontal"
          ? "flex flex-row flex-wrap items-center gap-4"
          : "grid gap-2"
      const items = item.items
        .map(
          (option) =>
            `  <div className="flex items-center gap-2">\n    <RadioGroupItem value=${JSON.stringify(option)} id=${JSON.stringify(option)} />\n    <Label htmlFor=${JSON.stringify(option)}>${textExpr(option)}</Label>\n  </div>`
        )
        .join("\n")
      return [
        `import { RadioGroup, RadioGroupItem } from "${importPath}"`,
        `import { Label } from "@/components/ui/label"`,
        "",
        `<RadioGroup${attr("value", item.value)}${attr("orientation", item.orientation)} className=${JSON.stringify(layoutClass)}>`,
        items,
        `</RadioGroup>`,
      ].join("\n")
    }
    case "tabs": {
      const item = props as CanvasTabsProps
      const value = item.labels[item.activeIndex] ?? item.labels[0]
      const triggers = item.labels
        .map((label) => `    <TabsTrigger value=${JSON.stringify(label)}>${textExpr(label)}</TabsTrigger>`)
        .join("\n")
      return [
        `import { Tabs, TabsList, TabsTrigger } from "${importPath}"`,
        "",
        `<Tabs${attr("value", value)}>`,
        `  <TabsList>`,
        triggers,
        `  </TabsList>`,
        `</Tabs>`,
      ].join("\n")
    }
    case "checkbox": {
      const item = props as CanvasCheckboxProps
      return [
        `import { Checkbox } from "${importPath}"`,
        `import { Label } from "@/components/ui/label"`,
        "",
        `<div className="flex items-center gap-2">`,
        `  <Checkbox${attr("checked", item.checked)} />`,
        `  <Label>${textExpr(item.label)}</Label>`,
        `</div>`,
      ].join("\n")
    }
    case "switch": {
      const item = props as CanvasSwitchProps
      return [
        `import { Switch } from "${importPath}"`,
        `import { Label } from "@/components/ui/label"`,
        "",
        `<div className="flex items-center gap-2">`,
        `  <Switch${attr("checked", item.checked)} />`,
        `  <Label>${textExpr(item.label)}</Label>`,
        `</div>`,
      ].join("\n")
    }
    case "avatar": {
      const item = props as CanvasAvatarProps
      const imageLine = item.src
        ? `  <AvatarImage src=${JSON.stringify(item.src)} alt=${JSON.stringify(item.alt)} />`
        : `  <AvatarFallback>${textExpr(item.alt.slice(0, 1) || "A")}</AvatarFallback>`
      return [
        `import { Avatar, AvatarFallback, AvatarImage } from "${importPath}"`,
        "",
        `<Avatar>`,
        imageLine,
        `</Avatar>`,
      ].join("\n")
    }
    case "select": {
      const item = props as CanvasSelectProps
      const options = item.options
        .map((option) => `    <SelectItem value=${JSON.stringify(option)}>${textExpr(option)}</SelectItem>`)
        .join("\n")
      return [
        `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "${importPath}"`,
        "",
        `<Select${attr("value", item.value)}>`,
        `  <SelectTrigger>`,
        `    <SelectValue placeholder=${JSON.stringify(item.placeholder)} />`,
        `  </SelectTrigger>`,
        `  <SelectContent>`,
        options,
        `  </SelectContent>`,
        `</Select>`,
      ].join("\n")
    }
  }
}

function indentBlock(value: string, spaces: number): string {
  const pad = " ".repeat(spaces)
  return value
    .split("\n")
    .map((line) => (line.length ? pad + line : line))
    .join("\n")
}

export function generateInstanceMarkup(instance: CanvasInstance): string {
  const full = generateInstanceJsx(instance)
  const splitAt = full.indexOf("\n\n")
  return splitAt === -1 ? full : full.slice(splitAt + 2)
}

export function generateInstanceImports(instance: CanvasInstance): string[] {
  const full = generateInstanceJsx(instance)
  const splitAt = full.indexOf("\n\n")
  const head = splitAt === -1 ? "" : full.slice(0, splitAt)
  return head.split("\n").filter(Boolean)
}

export function generateSlotJsx(
  slotId: string,
  label: string,
  children: CanvasInstance[]
): string {
  const imports = [...new Set(children.flatMap((child) => generateInstanceImports(child)))]
  const body = children
    .map((child) => indentBlock(generateInstanceMarkup(child), 2))
    .join("\n")
  return [
    ...imports,
    ...(imports.length ? [""] : []),
    `<section data-slot=${JSON.stringify(slotId)} aria-label=${JSON.stringify(label)}>`,
    body || "  {/* 이 영역에 컴포넌트를 드롭하세요 */}",
    `</section>`,
  ].join("\n")
}

export function generateNestedInstanceJsx(
  instance: CanvasInstance,
  slotId: string,
  label: string
): string {
  return generateSlotJsx(slotId, label, [instance])
}

