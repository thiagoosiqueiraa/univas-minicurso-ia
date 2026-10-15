import 'dotenv/config';
import { app } from './routes/app';
import { banco } from './data/database';
import { logger } from './services/logger';

const porta = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(porta) || porta < 1) throw new Error('PORT deve ser um número inteiro positivo.');
const servidor = app.listen(porta, () => logger.info(`Servidor iniciado na porta ${porta}`));
let encerrando = false;

function encerrar(sinal: string): void {
  if (encerrando) return;
  encerrando = true;
  const limite = setTimeout(() => process.exit(1), 10_000);
  limite.unref();
  servidor.close((erro) => {
    if (erro) { logger.error(`Falha ao encerrar após ${sinal}`, erro); process.exitCode = 1; }
    banco.close();
    clearTimeout(limite);
  });
}

process.on('SIGTERM', () => encerrar('SIGTERM'));
process.on('SIGINT', () => encerrar('SIGINT'));
