import type { TParam } from "./interface"

export const isPlainObject = (obj: unknown): obj is object => {
  return Object.prototype.toString.call(obj) === "[object Object]"
}

export const defaultParamsSerialize = <T extends TParam>(params: T) => {
  if (!params) return ""
  if (typeof params !== "object") return ""
  const urlSearchParams = new URLSearchParams()
  Object.keys(params).forEach((key) => {
    const value = (params as Record<string, unknown>)[key]
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          urlSearchParams.append(key, `${item}`)
        }
      })
    } else {
      urlSearchParams.append(key, `${value}`)
    }
  })

  return urlSearchParams.toString()
}
