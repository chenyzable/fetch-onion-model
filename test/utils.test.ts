import { describe, it, expect } from 'vitest'
import { isPlainObject, defaultParamsSerialize } from '../src/utils'

describe('test utils', () => {
  it('test isPlainObject', () => {
    expect(isPlainObject).toBeTypeOf('function')
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(undefined)).toBe(false)
    expect(isPlainObject(123)).toBe(false)
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject('')).toBe(false)
    expect(isPlainObject(true)).toBe(false)
    expect(isPlainObject(false)).toBe(false)
  })

  it('test defaultParamsSerialize', () => {
    expect(defaultParamsSerialize).toBeTypeOf('function')
    expect(defaultParamsSerialize({ foo: 'bar' })).toBe('foo=bar')
    expect(defaultParamsSerialize({ foo: 1, bar: 2, badValue1: undefined, badValue2: null })).toBe(
      'foo=1&bar=2',
    )
    expect(defaultParamsSerialize({ foo: 1, bar: [2, 3] })).toBe('foo=1&bar=2&bar=3')
    expect(defaultParamsSerialize({})).toBe('')
    expect(defaultParamsSerialize(null)).toBe('')
    expect(defaultParamsSerialize(undefined)).toBe('')
    expect(defaultParamsSerialize(123)).toBe('')
    expect(defaultParamsSerialize([])).toBe('')
  })
})
