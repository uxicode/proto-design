"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { isSafeHttpUrl } from "@/lib/canvas/guards"
import type {
  CanvasAlertProps,
  CanvasAvatarProps,
  CanvasBadgeProps,
  CanvasButtonProps,
  CanvasCardProps,
  CanvasCheckboxProps,
  CanvasComponentType,
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
import type { ReactNode } from "react"

interface InstanceView {
  type: CanvasComponentType
  props: CanvasInstance["props"]
}

function ButtonView({ props }: { props: CanvasButtonProps }) {
  return (
    <Button variant={props.variant} size={props.size} disabled={props.disabled} type="button">
      {props.label}
    </Button>
  )
}

function InputView({ props }: { props: CanvasInputProps }) {
  return (
    <Input
      placeholder={props.placeholder}
      value={props.value}
      disabled={props.disabled}
      readOnly
    />
  )
}

function TextareaView({ props }: { props: CanvasTextareaProps }) {
  return (
    <Textarea
      placeholder={props.placeholder}
      value={props.value}
      disabled={props.disabled}
      readOnly
    />
  )
}

function LabelView({ props }: { props: CanvasLabelProps }) {
  return <Label>{props.text}</Label>
}

function CardView({ props }: { props: CanvasCardProps }) {
  return (
    <Card className="h-full w-full shadow-sm">
      <CardHeader className="p-4">
        <CardTitle className="text-sm">{props.title}</CardTitle>
        <CardDescription>{props.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm">{props.body}</CardContent>
    </Card>
  )
}

function BadgeView({ props }: { props: CanvasBadgeProps }) {
  return <Badge variant={props.variant}>{props.label}</Badge>
}

function AlertView({ props }: { props: CanvasAlertProps }) {
  return (
    <Alert>
      <AlertTitle>{props.title}</AlertTitle>
      <AlertDescription>{props.description}</AlertDescription>
    </Alert>
  )
}

function SeparatorView({ props }: { props: CanvasSeparatorProps }) {
  return (
    <Separator
      orientation={props.orientation}
      className={props.orientation === "vertical" ? "h-full min-h-[80px]" : "w-full"}
    />
  )
}

function RadioGroupView({ props }: { props: CanvasRadioGroupProps }) {
  const isHorizontal = props.orientation === "horizontal"
  return (
    <RadioGroup
      value={props.value}
      orientation={props.orientation}
      className={isHorizontal ? "flex flex-row flex-wrap items-center gap-4" : "grid gap-2"}
    >
      {props.items.map((item) => (
        <div key={item} className="flex items-center gap-2">
          <RadioGroupItem value={item} id={item} />
          <Label htmlFor={item}>{item}</Label>
        </div>
      ))}
    </RadioGroup>
  )
}

function TabsView({ props }: { props: CanvasTabsProps }) {
  const value = props.labels[props.activeIndex] ?? props.labels[0]
  return (
    <Tabs value={value}>
      <TabsList>
        {props.labels.map((label) => (
          <TabsTrigger key={label} value={label}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

function CheckboxView({ props }: { props: CanvasCheckboxProps }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={props.checked} />
      <Label>{props.label}</Label>
    </div>
  )
}

function SwitchView({ props }: { props: CanvasSwitchProps }) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={props.checked} />
      <Label>{props.label}</Label>
    </div>
  )
}

function AvatarView({ props }: { props: CanvasAvatarProps }) {
  const isSafe = isSafeHttpUrl(props.src)
  return (
    <Avatar>
      {isSafe ? <AvatarImage src={props.src} alt={props.alt} /> : null}
      <AvatarFallback>{props.alt.slice(0, 1) || "A"}</AvatarFallback>
    </Avatar>
  )
}

function SelectView({ props }: { props: CanvasSelectProps }) {
  return (
    <Select value={props.value}>
      <SelectTrigger>
        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>
    </Select>
  )
}

const RENDERERS: Record<CanvasComponentType, (props: CanvasInstance["props"]) => ReactNode> = {
  button: (props) => <ButtonView props={props as CanvasButtonProps} />,
  input: (props) => <InputView props={props as CanvasInputProps} />,
  textarea: (props) => <TextareaView props={props as CanvasTextareaProps} />,
  label: (props) => <LabelView props={props as CanvasLabelProps} />,
  card: (props) => <CardView props={props as CanvasCardProps} />,
  badge: (props) => <BadgeView props={props as CanvasBadgeProps} />,
  alert: (props) => <AlertView props={props as CanvasAlertProps} />,
  separator: (props) => <SeparatorView props={props as CanvasSeparatorProps} />,
  "radio-group": (props) => <RadioGroupView props={props as CanvasRadioGroupProps} />,
  tabs: (props) => <TabsView props={props as CanvasTabsProps} />,
  checkbox: (props) => <CheckboxView props={props as CanvasCheckboxProps} />,
  switch: (props) => <SwitchView props={props as CanvasSwitchProps} />,
  avatar: (props) => <AvatarView props={props as CanvasAvatarProps} />,
  select: (props) => <SelectView props={props as CanvasSelectProps} />,
}

export function CanvasInstancePreview({ instance }: { instance: InstanceView }) {
  return RENDERERS[instance.type](instance.props)
}
