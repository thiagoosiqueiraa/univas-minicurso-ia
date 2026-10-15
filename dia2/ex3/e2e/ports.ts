import net from 'node:net'

export async function portaDisponivel(inicio: number, fim: number): Promise<number> {
  for (let porta = inicio; porta <= fim; porta += 1) {
    if (await podeVincular(porta)) return porta
  }
  throw new Error(`Nenhuma porta disponível entre ${inicio} e ${fim}`)
}

function podeVincular(porta: number): Promise<boolean> {
  return new Promise((resolve) => {
    const servidor = net.createServer()
    servidor.once('error', () => resolve(false))
    servidor.listen(porta, '127.0.0.1', () => servidor.close(() => resolve(true)))
  })
}
