import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { log } from "../utils/log";

export type UpdateInfo = {
  version: string;
  body: string | undefined;
};

export type UpdateCheckResult =
  | { available: true; info: UpdateInfo; update: Update }
  | { available: false };

export async function checkForUpdates(): Promise<UpdateCheckResult> {
  try {
    const update = await check();

    if (update) {
      log.info(`Update available: ${update.version}`);

      return {
        available: true,
        info: {
          version: update.version,
          body: update.body
        },
        update
      };
    }

    log.debug("No update available");

    return { available: false };
  } catch (error) {
    log.error("Error checking for updates:", error);

    return { available: false };
  }
}

export async function downloadAndInstallUpdate(update: Update): Promise<void> {
  log.info("Downloading update...");

  await update.downloadAndInstall();

  log.info("Update installed, relaunching...");

  await relaunch();
}
