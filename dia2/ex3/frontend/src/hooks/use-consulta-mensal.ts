import { useEffect, useState } from 'react'
import { consultarMes, ErroApi } from '../services/lancamentos-api'
import type { ConsultaMensal } from '../types/lancamento'

type EstadoConsulta = 'carregando' | 'sucesso' | 'erro'

export function mesAtualLocal(): string {
  const agora = new Date()
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`
}

export function useConsultaMensal() {
  const [mes, definirMes] = useState(mesAtualLocal)
  const [consulta, definirConsulta] = useState<ConsultaMensal | null>(null)
  const [estado, definirEstado] = useState<EstadoConsulta>('carregando')
  const [erro, definirErro] = useState('')
  const [versao, atualizar] = useState(0)
  useEffect(() => {
    const controlador = new AbortController()
    definirEstado('carregando')
    definirErro('')
    consultarMes(mes, controlador.signal).then((resultado) => {
      if (controlador.signal.aborted) return
      definirConsulta(resultado)
      definirEstado('sucesso')
    }).catch((falha: unknown) => {
      if (controlador.signal.aborted) return
      definirConsulta(null)
      definirErro(falha instanceof ErroApi ? falha.message : 'Não foi possível carregar o mês selecionado.')
      definirEstado('erro')
    })
    return () => controlador.abort()
  }, [mes, versao])
  return { mes, definirMes, consulta: consulta?.mes === mes ? consulta : null, estado, erro, atualizar: () => atualizar((valor) => valor + 1) }
}
