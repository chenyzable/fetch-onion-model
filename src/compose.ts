import type { MiddleWare, Context } from "./interface"

function compose(middlewares: MiddleWare[]) {
  if (!Array.isArray(middlewares)) throw new TypeError("Middleware stack must be an array!")
  for (const fn of middlewares) {
    if (typeof fn !== "function") throw new TypeError("Middleware must be composed of functions!")
  }
  // eslint-disable-next-line func-names
  return async function (ctx: Context) {
    let index = -1
    function dispatch(i: number): Promise<void> {
      if (i <= index) {
        return Promise.reject(new Error("next() called multiple times"))
      }
      index = i
      const fn = middlewares[i]
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }
    return dispatch(0)
  }
}

export default compose
