import { describe, it, expect } from 'vitest'
import compose from '../src/compose'

describe('test compose', () => {
  it('show be working as a function', () => {
    expect(compose).toBeTypeOf('function')
    expect(() => compose()).toThrowError()
    expect(() => compose(null)).toThrowError()
    expect(() => compose({})).toThrowError()
    expect(() => compose('')).toThrowError()
    expect(() => compose(true)).toThrowError()
    expect(() => compose([null, undefined, {}, '', []])).toThrowError()
    const onion = compose([])
    expect(onion).toBeTypeOf('function')
    expect(onion({}).then).toBeTypeOf('function')
  })
})
