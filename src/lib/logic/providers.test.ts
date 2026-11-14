import { describe, expect, it } from 'vitest'
import { normalizeProvider, suggestServices } from './providers'

describe('providers', () => {
  it('maps TMDB names', () => {
    expect(normalizeProvider('Netflix')).toBe('Netflix')
    expect(normalizeProvider('Amazon Prime Video')).toBe('Prime Video')
    expect(normalizeProvider('Disney Plus')).toBe('Disney+')
    expect(normalizeProvider('Apple TV Plus')).toBe('Apple TV+')
    expect(normalizeProvider('WOW')).toBe('WOW/Sky')
    expect(normalizeProvider('Joyn')).toBe('Other')
  })
  it('suggests unique known services', () => {
    expect(suggestServices(['Netflix', 'Netflix basic with Ads', 'Joyn'])).toEqual(['Netflix'])
    expect(suggestServices()).toEqual([])
  })
})
