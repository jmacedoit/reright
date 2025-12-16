import { Menu } from "@tauri-apps/api/menu";
import { operationsService, OperationsService } from "./services/operations";
import { TrayIcon } from "@tauri-apps/api/tray";
import { setDockVisibility } from "@tauri-apps/api/app";
import { resolveResource } from "@tauri-apps/api/path";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { Rewrite } from "./types/general";
import { sleep } from "./utils/general";
import { exit } from "@tauri-apps/plugin-process";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { translationKeys } from "./ui/translations";
import { log } from "./utils/log";

const loaderIconResource = "icons/loader-icon.png";
const trayIconResource = "icons/tray-icon.png";

export class WindowUiHelper {
  operationsService: OperationsService;
  tray!: Promise<TrayIcon> | TrayIcon;
  rewriteShortcut: string | undefined;
  t!: (key: string) => string;

  constructor(operationsService: OperationsService) {
    this.operationsService = operationsService;
  }

  async initializeWindow(t: (key: string) => string) {
    this.t = t;
    this.tray = await TrayIcon.new({
      icon: await resolveResource(trayIconResource),
      menuOnLeftClick: true,
    });

    getCurrentWindow().onCloseRequested((event) => {
      getCurrentWindow().hide();

      event.preventDefault();

      setDockVisibility(false);
    });
  }

  async updateTrayMenu(
    rewrites: Rewrite[],
    // @ts-expect-error - languages is not used
    languages: string[],
    defaultCommandWord: string,
    defaultShortcut: string,
    commandSeparator: string
  ) {
    const separator = "⸻";
    const menu = await Menu.new({
      items: [
        {
          text: this.t(translationKeys.tray.defaultRewrite),
          action: async () =>
            await this.rewriteClipboard(
              rewrites,
              defaultCommandWord,
              commandSeparator
            ),
        },
        {
          text: separator,
          enabled: false,
        },
        ...rewrites.map((rewrite) => ({
          id: rewrite.name,
          text: rewrite.name,
          action: async () =>
            await this.rewriteClipboard(
              rewrites,
              rewrite.commandWord,
              commandSeparator
            ),
          ...(defaultCommandWord === rewrite.commandWord
            ? { accelerator: defaultShortcut }
            : {}),
        })),
        {
          text: separator,
          enabled: false,
        },
        {
          id: "Configure",
          text: this.t(translationKeys.tray.configure),
          action: async () => {
            const window = await getCurrentWindow();
            await setDockVisibility(true);

            window.show();
            window.setFocus();
          },
        },
        {
          id: "Quit",
          text: this.t(translationKeys.tray.quit),
          action: async () => {
            await this.destroy();
            await exit(0);
          },
        },
      ],
    });

    await (await this.tray).setMenu(menu);
  }

  async updateRewriteShortcut(
    shortcut: string,
    defaultCommand: string,
    rewrites: Rewrite[],
    commandSeparator: string
  ) {
    try {
      if (this.rewriteShortcut) {
        await unregister(this.rewriteShortcut);
      }

      await register(shortcut, async (event) => {
        if (event.state === "Pressed") {
          await this.rewriteClipboard(
            rewrites,
            defaultCommand,
            commandSeparator
          );
        }
      });

      this.rewriteShortcut = shortcut;
    } catch (error) {
      log.error("Error updating rewrite shortcut: ", error);

      throw error;
    }
  }

  async rewriteClipboard(
    rewrites: Rewrite[],
    baseCommand: string,
    commandSeparator: string
  ) {
    const iconPath = await resolveResource(loaderIconResource);

    (await this.tray).setIcon(iconPath);

    try {
      await Promise.all([
        this.operationsService.rewriteClipboard(
          rewrites,
          baseCommand,
          commandSeparator
        ),
        sleep(1000),
      ]);
    } finally {
      (await this.tray).setIcon(await resolveResource(trayIconResource));
    }
  }

  async removeRewriteShortcut() {
    if (this.rewriteShortcut) {
      await unregister(this.rewriteShortcut);
    }

    this.rewriteShortcut = undefined;
  }

  async destroy() {
    await this.removeRewriteShortcut();

    if (this.tray) {
      await TrayIcon.removeById((await this.tray).id);
    }
  }
}

export const windowUiHelper = new WindowUiHelper(operationsService);
