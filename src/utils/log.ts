const isDev = (import.meta as any).env?.DEV;

export const log = {
  log: (...args: any[]) => console.log(...args),
  debug: (...args: any[]) => isDev && console.debug(...args),
  info: (...args: any[]) => console.info(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
};
