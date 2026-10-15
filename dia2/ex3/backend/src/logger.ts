export const logger = {
  info(event: string): void {
    console.log(JSON.stringify({ level: 'info', event }));
  },
  error(event: string, code?: string, route?: string): void {
    console.error(JSON.stringify({ level: 'error', event, code, route }));
  },
};
