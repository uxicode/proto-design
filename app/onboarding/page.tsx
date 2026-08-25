import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">시작하기 전에</h1>
      <OnboardingWizard />
    </div>
  )
}
