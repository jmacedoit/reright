import {
  debug,
  info,
  warn,
  error,
  attachConsole
} from "@tauri-apps/plugin-log";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isDev = (import.meta as any).env?.DEV;

attachConsole();

export const log = {
  log: (...args: unknown[]) => info(args.map(String).join(" ")),
  debug: (...args: unknown[]) => {
    if (isDev) {
      debug(args.map(String).join(" "));

      console.debug(...args);
    }
  },
  info: (...args: unknown[]) => info(args.map(String).join(" ")),
  warn: (...args: unknown[]) => warn(args.map(String).join(" ")),
  error: (...args: unknown[]) => error(args.map(String).join(" "))
};
