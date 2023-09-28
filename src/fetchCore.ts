import type { MiddleWare } from "./interface"
import { isPlainObject, defaultParamsSerialize } from "./utils"

const fetchCore = (): MiddleWare => {
  return async (ctx) => {
    const {
      options,
      url,
      baseUrl,
      params,
      data,
      fetch,
      transformParams,
      transformResponse,
      validStatus,
    } = ctx

    let fullUrlWithParams = url
    if (baseUrl) {
      fullUrlWithParams = baseUrl + fullUrlWithParams
    }

    let querystring = ""
    if (params instanceof URLSearchParams) {
      querystring += params.toString()
    } else if (isPlainObject(params)) {
      querystring =
        typeof transformParams === "function"
          ? transformParams(params)
          : defaultParamsSerialize(params)
    }
    if (querystring) {
      if (fullUrlWithParams.indexOf("?") === -1) {
        fullUrlWithParams += `?${querystring}`
      } else {
        fullUrlWithParams += `&${querystring}`
      }
    }

    if (!options.body && data) {
      if (isPlainObject(data)) {
        options.body = JSON.stringify(data)
      } else {
        options.body = data as BodyInit
      }
    }

    const response = await fetch!(fullUrlWithParams, options)
    ctx.response = response
    let isOk = response.ok
    if (validStatus) {
      isOk = validStatus(response)
    }
    if (!isOk) {
      throw new Error(`request error with status ${response.status}`)
    }
    if (transformResponse) {
      ctx.body = await transformResponse(response)
    } else if (response.headers.get("content-type")?.includes("application/json")) {
      ctx.body = await response.json()
    } else {
      ctx.body = await response.text()
    }
  }
}

export default fetchCore
