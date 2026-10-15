import { spawn, type ChildProcess } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { portaDisponivel } from './ports'

const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)))
type Ambiente = { api: ChildProcess; frontend: ChildProcess; pasta: string; apiPorta: number; webPorta: number }

export async function iniciarAmbiente(): Promise<Ambiente> {
  const pasta = await mkdtemp(join(tmpdir(), 'financeiro-e2e-'))
  const apiPorta = await portaDisponivel(3000, 3099)
  const webPorta = await portaDisponivel(5100, 5199)
  const api = iniciarApi(pasta, apiPorta, webPorta)
  await aguardar(`http://127.0.0.1:${apiPorta}/health`)
  const frontend = iniciarFrontend(apiPorta, webPorta)
  await aguardar(`http://127.0.0.1:${webPorta}`)
  return { api, frontend, pasta, apiPorta, webPorta }
}

function iniciarApi(pasta: string, apiPorta: number, webPorta: number): ChildProcess {
  return spawn('node', ['node_modules/tsx/dist/cli.mjs', 'src/index.ts'], {
    cwd: join(raiz, 'backend'),
    env: { ...process.env, PORT: String(apiPorta), DATABASE_PATH: join(pasta, 'financeiro.sqlite'), FRONTEND_ORIGIN: `http://127.0.0.1:${webPorta}` },
    stdio: 'ignore',
  })
}

export async function reiniciarApi(ambiente: Ambiente): Promise<void> {
  await encerrarProcesso(ambiente.api)
  ambiente.api = iniciarApi(ambiente.pasta, ambiente.apiPorta, ambiente.webPorta)
  await aguardar(`http://127.0.0.1:${ambiente.apiPorta}/health`)
}

function iniciarFrontend(apiPorta: number, webPorta: number): ChildProcess {
  return spawn('node', ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(webPorta), '--strictPort'], {
    cwd: join(raiz, 'frontend'), env: { ...process.env, VITE_API_URL: `http://127.0.0.1:${apiPorta}` }, stdio: 'ignore',
  })
}

async function aguardar(url: string): Promise<void> {
  for (let tentativa = 0; tentativa < 100; tentativa += 1) {
    try { if ((await fetch(url)).ok) return } catch { }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`Serviço não iniciou: ${url}`)
}

export async function encerrarProcesso(processo: ChildProcess): Promise<void> {
  if (processo.exitCode !== null || processo.killed) return
  processo.kill('SIGTERM')
  await new Promise<void>((resolve) => processo.once('exit', () => resolve()))
}

export async function limparAmbiente(ambiente: Ambiente): Promise<void> {
  await encerrarProcesso(ambiente.frontend)
  await encerrarProcesso(ambiente.api)
  await rm(ambiente.pasta, { recursive: true, force: true })
}

export type { Ambiente }
