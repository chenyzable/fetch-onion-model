import { describe, it, expect } from "vitest"
import request, { create } from "../src"
import { prefix } from "./mock/server"

describe("test request", () => {
  it("test request a text response", async () => {
    const res = await request("https://mock.com/simpleGet", {
      params: { text: "2333" },
    })
    expect(res).equals("mock response text: 2333")
  })

  it("test request a json response", async () => {
    const res = await request("https://mock.com/getJson", {
      method: "POST",
      params: { foo: "bar", arr: ["1", "2"], none: null },
      data: { bar: "foo", arr: [3, 4], none: null },
    })
    expect(res).toBeTypeOf("object")
    expect(res).toEqual({
      content: "mock json",
      params: {
        arr: ["1", "2"],
        foo: "bar",
      },
      data: {
        bar: "foo",
        arr: [3, 4],
        none: null,
      },
    })
  })

  it("test request a with URLSearchParams", async () => {
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.append("text", "2333")
    const res = await request("https://mock.com/simpleGet", {
      params: urlSearchParams,
    })
    expect(res).equals("mock response text: 2333")
  })

  it("test custom validStatus", async () => {
    expect(
      request("https://mock.com/simpleGet", {
        params: { text: "2333" },
        validStatus: () => false,
      }),
    ).rejects.toThrow()
  })

  // it()
})

describe("test create function", () => {
  it("show be work", async () => {
    const defaultHeaders: HeadersInit = {
      "x-token": "123",
      "x-uuid": "asafbaskfajslnfclas",
    }
    const instance = create({
      method: "POST",
      headers: defaultHeaders,
    })
    const res = await instance<Response>(prefix("/forwardHeader"), {
      transformResponse: (response) => response,
    })
    expect(res).toBeInstanceOf(Response)
    const body = await res.json()
    expect(body).toEqual({
      success: true,
      data: defaultHeaders,
    })
  })
})
