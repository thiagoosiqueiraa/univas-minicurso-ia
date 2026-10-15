import express, { type Express } from 'express';
import cors from 'cors';
import type { LancamentosRepository } from './data/lancamentos-repository';
import { createLancamentosRouter } from './routes/lancamentos-routes';
import { errorHandler, notFound } from './routes/error-handler';

export function createApp(repository: LancamentosRepository, frontendOrigin: string): Express {
  const app = express();
  app.use(cors({ origin: frontendOrigin }));
  app.use(express.json());
  app.get('/health', async (_request, response) => {
    await repository.verificarSaude();
    response.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });
  app.use('/api/lancamentos', createLancamentosRouter(repository));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
