import { Router } from 'express';
import type { LancamentosRepository } from '../data/lancamentos-repository';
import { criarLancamentosService } from '../services/lancamentos-service';

export function createLancamentosRouter(repository: LancamentosRepository): Router {
  const router = Router();
  const service = criarLancamentosService(repository);
  router.post('/', async (request, response) => {
    const lancamento = await service.criar(request.body);
    response.status(201).json(lancamento);
  });
  router.get('/', async (request, response) => {
    const params = new URL(request.originalUrl, 'http://localhost').searchParams;
    const values = params.getAll('mes');
    const consulta = await service.consultar(values.length === 1 ? values[0] : undefined);
    response.json(consulta);
  });
  return router;
}
