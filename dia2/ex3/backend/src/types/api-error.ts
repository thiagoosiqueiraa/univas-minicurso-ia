export type ErrorCode = 'DADOS_INVALIDOS' | 'MES_INVALIDO' | 'NAO_ENCONTRADO' | 'BANCO_INDISPONIVEL' | 'ERRO_INTERNO';

export class ApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly status: number,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}
