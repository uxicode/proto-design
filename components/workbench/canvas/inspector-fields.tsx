"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  RADIO_ITEM_MAX,
  RADIO_ITEM_MIN,
  SELECT_OPTION_MAX,
  SELECT_OPTION_MIN,
  TABS_LABEL_MAX,
  TABS_LABEL_MIN,
  addListItem,
  radioGroupBox,
  removeListItemAt,
  resizeStringList,
  updateListItem,
} from "@/lib/canvas/defaults"
import type {
  CanvasAlertProps,
  CanvasAvatarProps,
  CanvasBadgeProps,
  CanvasButtonProps,
  CanvasCardProps,
  CanvasCheckboxProps,
  CanvasInputProps,
  CanvasInstance,
  CanvasInstanceProps,
  CanvasLabelProps,
  CanvasRadioGroupProps,
  CanvasSelectProps,
  CanvasSeparatorProps,
  CanvasSwitchProps,
  CanvasTabsProps,
  CanvasTextareaProps,
  ShadcnBadgeVariant,
  ShadcnButtonSize,
  ShadcnButtonVariant,
} from "@/types/domain"

interface InspectorFieldsProps {
  instance: CanvasInstance
  disabled: boolean
  onChange: (patch: Partial<CanvasInstanceProps>, box?: { width?: number; height?: number }) => void
  onMove: (x: number, y: number) => void
}

const BUTTON_VARIANTS: ShadcnButtonVariant[] = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
]
const BUTTON_SIZES: ShadcnButtonSize[] = ["default", "sm", "lg"]
const BADGE_VARIANTS: ShadcnBadgeVariant[] = ["default", "secondary", "outline", "destructive"]

export function InspectorFields({ instance, disabled, onChange, onMove }: InspectorFieldsProps) {
  return (
    <div className="space-y-3">
      <NumberField
        label="X"
        value={Math.round(instance.x)}
        disabled={disabled}
        onChange={(value) => onMove(value, instance.y)}
      />
      <NumberField
        label="Y"
        value={Math.round(instance.y)}
        disabled={disabled}
        onChange={(value) => onMove(instance.x, value)}
      />
      <NumberField
        label="너비"
        value={Math.round(instance.width)}
        disabled={disabled}
        onChange={(value) => onChange({}, { width: value, height: instance.height })}
      />
      <NumberField
        label="높이"
        value={Math.round(instance.height)}
        disabled={disabled}
        onChange={(value) => onChange({}, { width: instance.width, height: value })}
      />
      <TypeFields instance={instance} disabled={disabled} onChange={onChange} />
    </div>
  )
}

function TypeFields({
  instance,
  disabled,
  onChange,
}: {
  instance: CanvasInstance
  disabled: boolean
  onChange: (patch: Partial<CanvasInstanceProps>, box?: { width?: number; height?: number }) => void
}) {
  const { type, props } = instance

  if (type === "button") {
    const item = props as CanvasButtonProps
    return (
      <>
        <TextField
          label="라벨"
          value={item.label}
          disabled={disabled}
          onChange={(label) => onChange({ label })}
        />
        <SelectField
          label="variant"
          value={item.variant}
          options={BUTTON_VARIANTS}
          disabled={disabled}
          onChange={(variant) => onChange({ variant: variant as ShadcnButtonVariant })}
        />
        <SelectField
          label="size"
          value={item.size}
          options={BUTTON_SIZES}
          disabled={disabled}
          onChange={(size) => onChange({ size: size as ShadcnButtonSize })}
        />
        <BooleanField
          label="비활성"
          checked={item.disabled}
          disabled={disabled}
          onChange={(next) => onChange({ disabled: next })}
        />
      </>
    )
  }

  if (type === "input" || type === "textarea") {
    const item = props as CanvasInputProps | CanvasTextareaProps
    return (
      <>
        <TextField
          label="플레이스홀더"
          value={item.placeholder}
          disabled={disabled}
          onChange={(placeholder) => onChange({ placeholder })}
        />
        <TextField
          label="값"
          value={item.value}
          disabled={disabled}
          onChange={(value) => onChange({ value })}
        />
        <BooleanField
          label="비활성"
          checked={item.disabled}
          disabled={disabled}
          onChange={(next) => onChange({ disabled: next })}
        />
      </>
    )
  }

  if (type === "label") {
    const item = props as CanvasLabelProps
    return (
      <TextField
        label="텍스트"
        value={item.text}
        disabled={disabled}
        onChange={(text) => onChange({ text })}
      />
    )
  }

  if (type === "card") {
    const item = props as CanvasCardProps
    return (
      <>
        <TextField label="제목" value={item.title} disabled={disabled} onChange={(title) => onChange({ title })} />
        <TextField
          label="설명"
          value={item.description}
          disabled={disabled}
          onChange={(description) => onChange({ description })}
        />
        <AreaField label="본문" value={item.body} disabled={disabled} onChange={(body) => onChange({ body })} />
      </>
    )
  }

  if (type === "badge") {
    const item = props as CanvasBadgeProps
    return (
      <>
        <TextField label="라벨" value={item.label} disabled={disabled} onChange={(label) => onChange({ label })} />
        <SelectField
          label="variant"
          value={item.variant}
          options={BADGE_VARIANTS}
          disabled={disabled}
          onChange={(variant) => onChange({ variant: variant as ShadcnBadgeVariant })}
        />
      </>
    )
  }

  if (type === "alert") {
    const item = props as CanvasAlertProps
    return (
      <>
        <TextField label="제목" value={item.title} disabled={disabled} onChange={(title) => onChange({ title })} />
        <AreaField
          label="설명"
          value={item.description}
          disabled={disabled}
          onChange={(description) => onChange({ description })}
        />
      </>
    )
  }

  if (type === "separator") {
    const item = props as CanvasSeparatorProps
    return (
      <SelectField
        label="방향"
        value={item.orientation}
        options={["horizontal", "vertical"]}
        disabled={disabled}
        onChange={(orientation) =>
          onChange({ orientation: orientation as CanvasSeparatorProps["orientation"] })
        }
      />
    )
  }

  if (type === "radio-group") {
    const item = props as CanvasRadioGroupProps
    function commitItems(items: string[]): void {
      onChange(
        { items, value: items.includes(item.value) ? item.value : items[0] },
        radioGroupBox(items.length, item.orientation)
      )
    }
    return (
      <>
        <SelectField
          label="배치"
          value={item.orientation}
          options={["vertical", "horizontal"]}
          optionLabels={{ vertical: "세로", horizontal: "가로" }}
          disabled={disabled}
          onChange={(orientation) => {
            const next = orientation as CanvasRadioGroupProps["orientation"]
            onChange({ orientation: next }, radioGroupBox(item.items.length, next))
          }}
        />
        <OptionListField
          label="항목"
          values={item.items}
          min={RADIO_ITEM_MIN}
          max={RADIO_ITEM_MAX}
          fallbackPrefix="옵션"
          disabled={disabled}
          onChange={commitItems}
        />
        <SelectField
          label="선택값"
          value={item.value}
          options={item.items}
          disabled={disabled}
          onChange={(value) => onChange({ value })}
        />
      </>
    )
  }

  if (type === "tabs") {
    const item = props as CanvasTabsProps
    function commitLabels(labels: string[]): void {
      onChange({
        labels,
        activeIndex: Math.min(item.activeIndex, labels.length - 1),
      })
    }
    return (
      <>
        <OptionListField
          label="탭"
          values={item.labels}
          min={TABS_LABEL_MIN}
          max={TABS_LABEL_MAX}
          fallbackPrefix="탭"
          disabled={disabled}
          onChange={commitLabels}
        />
        <NumberField
          label="활성 인덱스"
          value={item.activeIndex}
          min={0}
          max={item.labels.length - 1}
          disabled={disabled}
          onChange={(activeIndex) => onChange({ activeIndex })}
        />
      </>
    )
  }

  if (type === "checkbox" || type === "switch") {
    const item = props as CanvasCheckboxProps | CanvasSwitchProps
    return (
      <>
        <TextField label="라벨" value={item.label} disabled={disabled} onChange={(label) => onChange({ label })} />
        <BooleanField
          label="켜짐"
          checked={item.checked}
          disabled={disabled}
          onChange={(checked) => onChange({ checked })}
        />
      </>
    )
  }

  if (type === "avatar") {
    const item = props as CanvasAvatarProps
    return (
      <>
        <TextField label="대체 텍스트" value={item.alt} disabled={disabled} onChange={(alt) => onChange({ alt })} />
        <TextField
          label="이미지 URL"
          value={item.src}
          disabled={disabled}
          onChange={(src) => onChange({ src })}
        />
      </>
    )
  }

  const item = props as CanvasSelectProps
  return (
    <>
      <OptionListField
        label="옵션"
        values={item.options}
        min={SELECT_OPTION_MIN}
        max={SELECT_OPTION_MAX}
        fallbackPrefix="항목"
        disabled={disabled}
        onChange={(options) =>
          onChange({ options, value: options.includes(item.value) ? item.value : options[0] })
        }
      />
      <SelectField
        label="선택값"
        value={item.value}
        options={item.options}
        disabled={disabled}
        onChange={(value) => onChange({ value })}
      />
      <TextField
        label="플레이스홀더"
        value={item.placeholder}
        disabled={disabled}
        onChange={(placeholder) => onChange({ placeholder })}
      />
    </>
  )
}

function TextField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string
  value: string
  disabled: boolean
  onChange: (value: string) => void
}) {
  const id = `inspector-${label}`
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

function AreaField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string
  value: string
  disabled: boolean
  onChange: (value: string) => void
}) {
  const id = `inspector-${label}`
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

function OptionListField({
  label,
  values,
  min,
  max,
  fallbackPrefix,
  disabled,
  onChange,
}: {
  label: string
  values: string[]
  min: number
  max: number
  fallbackPrefix: string
  disabled: boolean
  onChange: (values: string[]) => void
}) {
  const canAdd = values.length < max
  const canRemove = values.length > min

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">
          {min}~{max}개
        </span>
      </div>
      <NumberField
        label={`${label} 개수`}
        value={values.length}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(count) => onChange(resizeStringList(values, count, min, max, fallbackPrefix))}
      />
      <ul className="space-y-2">
        {values.map((value, index) => (
          <li key={`${fallbackPrefix}-${index}`} className="flex items-center gap-1">
            <Input
              aria-label={`${label} ${index + 1}`}
              value={value}
              disabled={disabled}
              onChange={(event) => onChange(updateListItem(values, index, event.target.value))}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label={`${label} ${index + 1} 삭제`}
              disabled={disabled || !canRemove}
              onClick={() => onChange(removeListItemAt(values, index, min))}
            >
              <Minus />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="w-full"
        disabled={disabled || !canAdd}
        onClick={() => onChange(addListItem(values, max, fallbackPrefix))}
      >
        <Plus />
        {label} 추가
      </Button>
    </div>
  )
}

function NumberField({
  label,
  value,
  disabled,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  disabled: boolean
  onChange: (value: number) => void
  min?: number
  max?: number
}) {
  const id = `inspector-${label}`
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : 0}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  optionLabels,
  disabled,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  optionLabels?: Record<string, string>
  disabled: boolean
  onChange: (value: string) => void
}) {
  const id = `inspector-${label}`
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm disabled:opacity-50"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    </div>
  )
}

function BooleanField({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string
  checked: boolean
  disabled: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}
