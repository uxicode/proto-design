interface StepLockedHintProps {
  message: string
}

export function StepLockedHint({ message }: StepLockedHintProps) {
  return (
    <p className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
      {message}
    </p>
  )
}
