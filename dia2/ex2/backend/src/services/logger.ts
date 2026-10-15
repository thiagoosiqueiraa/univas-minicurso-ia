export const logger = {
  info(mensagem: string): void { console.log(`[INFO] ${mensagem}`); },
  error(mensagem: string, erro?: unknown): void { console.error(`[ERROR] ${mensagem}`, erro); },
};
