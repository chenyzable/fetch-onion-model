import { describe, it, expect } from "vitest"
import { create } from "../src"
import retry from "../src/middleware/retry"
import { prefix } from "./mock/server"

describe("test retry middleware", () => {
  it("should be retry on error", async () => {
    const instance = create({}, [retry()])
    const MAX_RETRY_COUNT = 3
    let retryCount = 0
    await expect(
      instance(prefix("/make500"), {
        retryOn(attempt) {
          const returnValue = attempt < MAX_RETRY_COUNT
          if (returnValue) {
            retryCount += 1
          }
          return returnValue
        },
        retryDelay: 1000,
      }),
    ).rejects.toThrow()
    expect(retryCount).toBe(MAX_RETRY_COUNT)
  })
})
