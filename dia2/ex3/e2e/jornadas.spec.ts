import { test, expect } from './fixture'
import { reiniciarApi } from './ambiente'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-15T12:00:00.000Z') })
})

test('E2E-01 cadastra lançamentos e confere o resumo mensal', async ({ page, ambiente }) => {
  await page.goto(`http://127.0.0.1:${ambiente.webPorta}`)
  await cadastrar(page, { tipo: 'receita', descricao: 'Salário', valor: '10,10', categoria: 'Salário' })
  await cadastrar(page, { tipo: 'receita', descricao: 'Reembolso', valor: '0,20', categoria: 'Outros' })
  await cadastrar(page, { tipo: 'despesa', descricao: 'Almoço', valor: '3,05', categoria: 'Alimentação' })
  const resumo = page.getByRole('region', { name: 'Resumo do mês' })
  await expect(resumo.getByText('R$ 10,30')).toBeVisible()
  await expect(resumo.getByText('R$ 3,05')).toBeVisible()
  await expect(resumo.getByText('R$ 7,25')).toBeVisible()
  await expect(page.getByText('Almoço')).toBeVisible()
  await page.screenshot({ path: '../tasks/prd-gerenciador-financeiro-pessoal/evidences/ca-04-resumo-mensal.png', fullPage: true })
})

test('E2E-02 mostra mês vazio e mantém a seleção após cadastro em outro mês', async ({ page, ambiente }) => {
  await page.goto(`http://127.0.0.1:${ambiente.webPorta}`)
  const mes = page.getByLabel('Mês consultado')
  await mes.fill('2026-09')
  await expect(page.getByText('Nenhum lançamento neste mês.')).toBeVisible()
  await expect(page.getByText('R$ 0,00').first()).toBeVisible()
  await page.screenshot({ path: '../tasks/prd-gerenciador-financeiro-pessoal/evidences/ca-05-mes-vazio.png', fullPage: true })
  await page.getByLabel('Data').fill('2026-10-10')
  await cadastrar(page, { tipo: 'despesa', descricao: 'Conta de luz', valor: '42,00', categoria: 'Moradia', manterData: false })
  await expect(mes).toHaveValue('2026-09')
  await mes.fill('2026-10')
  await expect(page.getByText('Conta de luz')).toBeVisible()
})

test('E2E-03 mantém os registros após recarga e reinício da API', async ({ page, ambiente }) => {
  await page.goto(`http://127.0.0.1:${ambiente.webPorta}`)
  await cadastrar(page, { tipo: 'despesa', descricao: 'Internet', valor: '89,90', categoria: 'Moradia' })
  await page.reload()
  await expect(page.getByText('Internet')).toBeVisible()
  await reiniciarApi(ambiente)
  await page.reload()
  await expect(page.getByText('Internet')).toBeVisible()
})

test('E2E-04 valida campos e não mostra registros antigos após falha', async ({ page, ambiente }) => {
  await page.goto(`http://127.0.0.1:${ambiente.webPorta}`)
  await page.getByRole('button', { name: 'Salvar lançamento' }).click()
  await expect(page.getByText('Informe uma descrição com até 200 caracteres.')).toBeVisible()
  await page.request.post(`http://127.0.0.1:${ambiente.apiPorta}/api/lancamentos`, { data: { tipo: 'despesa', descricao: 'Registro antigo', valor: '2.00', categoria: 'Outros', data: '2026-10-12' } })
  await page.route('**/api/lancamentos?mes=2026-11', (route) => route.abort())
  await page.getByLabel('Mês consultado').fill('2026-11')
  await expect(page.getByRole('alert')).toContainText('Não foi possível conectar')
  await expect(page.getByText('Registro antigo')).toHaveCount(0)
  await expect(page.getByRole('status')).toHaveCount(0)
  await page.screenshot({ path: '../tasks/prd-gerenciador-financeiro-pessoal/evidences/ca-08-falha-de-consulta.png', fullPage: true })
})

test('E2E-05 oferece controles acessíveis em celular e por teclado', async ({ page, ambiente }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`http://127.0.0.1:${ambiente.webPorta}`)
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page).toHaveTitle('Finanças pessoais')
  await expect(page.getByLabel('Mês consultado')).toHaveAttribute('lang', 'pt-BR')
  await expect(page.getByRole('heading', { name: 'Seu mês, em equilíbrio.' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Resumo do mês' })).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Mês consultado')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByLabel('Mês consultado')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('group', { name: 'Tipo' })).toContainText('Despesa')
  await expect(page.getByLabel('Descrição')).toBeVisible()
  await expect(page.getByLabel('Valor (R$)')).toBeVisible()
  await expect(page.getByLabel('Categoria')).toBeVisible()
  await expect(page.getByLabel('Data')).toBeVisible()
  await expect(page.getByLabel('Data')).toHaveAttribute('lang', 'pt-BR')
  await page.screenshot({ path: '../tasks/prd-gerenciador-financeiro-pessoal/evidences/ca-09-celular.png', fullPage: true })
  await page.getByLabel('Descrição').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('Informe uma descrição com até 200 caracteres.')).toBeVisible()
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(page.getByRole('button', { name: 'Salvar lançamento' })).toBeVisible()
  await page.screenshot({ path: '../tasks/prd-gerenciador-financeiro-pessoal/evidences/ca-09-desktop.png', fullPage: true })
})

type Dados = { tipo: 'receita' | 'despesa'; descricao: string; valor: string; categoria: string; manterData?: boolean }

async function cadastrar(page: import('@playwright/test').Page, dados: Dados): Promise<void> {
  await page.getByLabel(dados.tipo === 'receita' ? 'Receita' : 'Despesa').check()
  await page.getByLabel('Descrição').fill(dados.descricao)
  await page.getByLabel('Valor (R$)').fill(dados.valor)
  await page.getByLabel('Categoria').selectOption(dados.categoria)
  if (dados.manterData !== false) await page.getByLabel('Data').fill('2026-10-15')
  await page.getByRole('button', { name: 'Salvar lançamento' }).click()
  await expect(page.getByText('Lançamento salvo com sucesso.')).toBeVisible()
}
