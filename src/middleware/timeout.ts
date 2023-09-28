import type { MiddleWare, Context } from "../interface"

type Timestamp = number | ((ctx: Context) => number)

const getDelay = (ctx: Context, timestamp: Timestamp): number => {
  if (typeof ctx.timeout === "number" && ctx.timeout > 0) {
    return ctx.timeout
  }
  return typeof timestamp === "function" ? timestamp(ctx) : timestamp
}

const timeout = (timestamp: Timestamp): MiddleWare => {
  return async (ctx, next) => {
    const { signal } = ctx.options
    const delay = getDelay(ctx, timestamp)
    if (delay && !signal) {
      const controller = new AbortController()
      ctx.options.signal = controller.signal
      ctx.__timeoutId = setTimeout(() => {
        if (!controller.signal.aborted) {
          controller.abort("middleware:timeout")
          ctx.__timeoutId = null
        }
      }, delay)
    }
    try {
      await next()
      if (ctx.__timeoutId) {
        clearTimeout(ctx.__timeoutId as number)
      }
    } catch (error) {
      if ((error as Error).message === "middleware:timeout") {
        ctx.__timeoutId = null
      } else if (ctx.__timeoutId) {
        clearTimeout(ctx.__timeoutId as number)
        ctx.__timeoutId = null
      }
      throw error
    }
  }
}

export default timeout
