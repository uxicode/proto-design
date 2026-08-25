import { AppError, errorStatus, toErrorBody } from "@/lib/errors"
import { getJob, toPollPayload } from "@/lib/generation/job-store"
import { ERROR_CODES } from "@/types/domain"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(
  _request: Request,
  context: { params: { id: string } }
): Promise<Response> {
  try {
    const job = getJob(context.params.id)
    if (!job) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "생성 작업을 찾을 수 없습니다.",
        errorStatus(ERROR_CODES.NOT_FOUND)
      )
    }

    return Response.json(toPollPayload(job))
  } catch (error) {
    const { status, body } = toErrorBody(error)
    return Response.json(body, { status })
  }
}
