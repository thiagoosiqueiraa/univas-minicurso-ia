import { test as base, expect } from '@playwright/test'
import type { Ambiente } from './ambiente'
import { iniciarAmbiente, limparAmbiente } from './ambiente'

type Contexto = { ambiente: Ambiente }

export const test = base.extend<Contexto>({
  ambiente: async ({}, use) => {
    const ambiente = await iniciarAmbiente()
    try { await use(ambiente) } finally { await limparAmbiente(ambiente) }
  },
})

export { expect }
