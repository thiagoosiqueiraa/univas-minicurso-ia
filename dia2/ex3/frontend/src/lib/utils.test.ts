import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('combina classes condicionais e resolve conflitos do Tailwind', () => {
    expect(cn('px-2 text-sm', { hidden: false }, 'px-4')).toBe('text-sm px-4')
  })
})
