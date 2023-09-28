import type { RequestInitRetryParams } from "fetch-retry"
import fetchRetry from "fetch-retry"
import type { MiddleWare } from "../interface"

const retry = (options?: RequestInitRetryParams): MiddleWare => {
  return async (ctx, next) => {
    if (options) {
      ctx.options = {
        ...ctx.options,
        ...options,
      }
    }
    ctx.fetch = fetchRetry(ctx.fetch!)
    await next()
  }
}

export default retry
