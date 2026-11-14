import { describe, expect, it } from 'vitest'
import { friendlyAuthError, validateCredentials } from './auth'

describe('validateCredentials', () => {
  it('accepts a good login', () => expect(validateCredentials('a@b.co', 'x', 'login')).toEqual({}))
  it('rejects bad email', () => expect(validateCredentials('nope', 'x', 'login').email).toBeDefined())
  it('requires a password', () => expect(validateCredentials('a@b.co', '', 'login').password).toBeDefined())
  it('enforces length only when signing up', () => {
    expect(validateCredentials('a@b.co', 'short', 'signup').password).toMatch(/8/)
    expect(validateCredentials('a@b.co', 'longenough', 'signup')).toEqual({})
  })
})

describe('friendlyAuthError', () => {
  it('maps known errors', () => {
    expect(friendlyAuthError('Invalid login credentials')).toBe('Email or password is incorrect.')
    expect(friendlyAuthError('User already registered')).toMatch(/already exists/)
    expect(friendlyAuthError('Email not confirmed')).toMatch(/Confirm your email/)
  })
  it('passes unknown errors through', () => expect(friendlyAuthError('Boom')).toBe('Boom'))
})
