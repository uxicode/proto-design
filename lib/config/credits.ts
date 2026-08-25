export const CREDIT_COSTS = {
  concept: Number(process.env.CREDIT_COST_CONCEPT ?? 1),
  palette: Number(process.env.CREDIT_COST_PALETTE ?? 1),
  wireframe: Number(process.env.CREDIT_COST_WIREFRAME ?? 2),
  components: Number(process.env.CREDIT_COST_COMPONENTS ?? 2),
  prototype: Number(process.env.CREDIT_COST_PROTOTYPE ?? 5),
} as const

export const CREDIT_SIGNUP_GRANT = Number(process.env.CREDIT_SIGNUP_GRANT ?? 20)
export const DAILY_GENERATION_CAP = Number(
  process.env.DAILY_GENERATION_CAP ?? 20
)
