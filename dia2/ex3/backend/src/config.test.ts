import { describe, expect, it } from 'vitest';
import { readConfig } from './config';

describe('readConfig', () => {
  it('usa padrões locais', () => {
    expect(readConfig({})).toMatchObject({ port: 3000, frontendOrigin: 'http://localhost:5173' });
  });
  it('aceita configuração explícita', () => {
    expect(readConfig({ PORT: '3001', DATABASE_PATH: 'data/test.sqlite', FRONTEND_ORIGIN: 'http://localhost:5100' }))
      .toMatchObject({ port: 3001, frontendOrigin: 'http://localhost:5100' });
  });
  it.each([{ PORT: '0' }, { PORT: 'abc' }, { DATABASE_PATH: ' ' }, { FRONTEND_ORIGIN: 'http://localhost:5100/path' }, { FRONTEND_ORIGIN: 'file:///tmp' }])(
    'recusa configuração inválida %s', (env) => { expect(() => readConfig(env)).toThrow(); },
  );
});
