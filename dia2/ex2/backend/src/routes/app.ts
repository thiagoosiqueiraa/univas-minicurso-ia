import express, { ErrorRequestHandler, Request, Response } from 'express';
import cors from 'cors';
import { consultarMes, salvarLancamento } from '../services/lancamento-service';

export const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (_req: Request, res: Response) => res.json({ status: 'healthy', timestamp: new Date().toISOString() }));
app.get('/api/lancamentos', (req: Request, res: Response) => {
  try { res.json(consultarMes(req.query.mes)); } catch (erro) { res.status(400).json({ erro: erro instanceof Error ? erro.message : 'Dados inválidos.' }); }
});
app.post('/api/lancamentos', (req: Request, res: Response) => {
  try { res.status(201).json(salvarLancamento(req.body)); } catch (erro) { res.status(400).json({ erro: erro instanceof Error ? erro.message : 'Dados inválidos.' }); }
});
const tratarErro: ErrorRequestHandler = (_erro: Error, _req, res, _next) => {
  res.status(500).json({ erro: 'Não foi possível concluir a solicitação.' });
};
app.use(tratarErro);
