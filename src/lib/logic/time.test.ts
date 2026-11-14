import { describe, expect, it } from 'vitest'
import { formatHm, parseHm } from './time'

describe('time', () => {
  it('parses h:mm', () => {
    expect(parseHm('1:12')).toBe(72)
    expect(parseHm('0:05')).toBe(5)
    expect(parseHm('2:00')).toBe(120)
  })
  it('parses bare minutes', () => expect(parseHm('95')).toBe(95))
  it('rejects junk', () => {
    expect(parseHm('')).toBeNull()
    expect(parseHm('1:75')).toBeNull()
    expect(parseHm('abc')).toBeNull()
  })
  it('formats', () => {
    expect(formatHm(72)).toBe('1:12')
    expect(formatHm(5)).toBe('0:05')
  })
})
