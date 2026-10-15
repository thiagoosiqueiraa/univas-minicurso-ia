import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ApiError } from '../types/api-error';
import { logger } from '../logger';

export const notFound: RequestHandler = (_request, _response, next) => {
  next(new ApiError('NAO_ENCONTRADO', 404, 'Rota não encontrada.'));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, next) => {
  void next;
  let apiError: ApiError;
  if (error instanceof ApiError) apiError = error;
  else if (error instanceof SyntaxError && 'body' in error) {
    apiError = new ApiError('DADOS_INVALIDOS', 400, 'Confira os dados do lançamento.');
  } else apiError = new ApiError('ERRO_INTERNO', 500, 'Ocorreu um erro interno.');
  if (apiError.status >= 500) logger.error('Falha na requisição', apiError.code, request.path);
  const fields = apiError.fields ? { fields: apiError.fields } : {};
  response.status(apiError.status).json({ error: { code: apiError.code, message: apiError.message, ...fields } });
};
