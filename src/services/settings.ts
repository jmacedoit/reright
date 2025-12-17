import { UnlistenFn } from "@tauri-apps/api/event";
import { Rewrite } from "../types/general";
import { load, Store } from "@tauri-apps/plugin-store";
import { log } from "../utils/log";
import { config } from "../config";

/*
 * Types.
 */

export type Settings = {
  rewriteShortcut: string;
  defaultCommand: string;
  languages: string[];
  rewrites: Rewrite[];
  commandSeparator: string;
  model: {
    modelId: string;
    provider: string;
    apiKey: string;
  };
  autostart: boolean;
};

/*
 * Default settings.
 */

const defaultSettings: Settings = {
  rewriteShortcut: "CommandOrControl+Shift+D",
  defaultCommand: "fix",
  languages: ["en", "pt"],
  rewrites: [
    {
      name: "Fix",
      commandWord: "fix",
      instructions:
        "Fix spelling, grammar, formatting and capitalization; don't change content and style"
    },
    {
      name: "Improve",
      commandWord: "improve",
      instructions:
        "Improve the writing of text while preserving its original meaning and intent"
    },
    {
      name: "Explain",
      commandWord: "explain",
      instructions: "Explain the code/text in a clear and concise language"
    },
    {
      name: "Translate to english",
      commandWord: "entranslate",
      instructions: "Translate the text to english"
    },
    {
      name: "Summarize",
      commandWord: "summarize",
      instructions: "Write the text in a shortened version"
    }
  ],
  commandSeparator: "///",
  model: {
    modelId: "gpt-4o-mini",
    provider: "openai",
    apiKey: ""
  },
  autostart: true
};

/*
 * Service.
 */

const storePath = config.storage.path;
const settingsKey = config.storage.key;

export class SettingsService {
  store: Store | null = null;

  async loadSettings(): Promise<Settings> {
    if (!this.store) {
      this.store = await load(storePath, {
        autoSave: false,
        defaults: { [settingsKey]: defaultSettings }
      });
    }

    const settings = (await this.store.get(settingsKey)) as Settings;

    return settings;
  }

  async saveSettings(settings: Settings): Promise<void> {
    log.debug("Persisting settings", settings);

    if (!this.store) {
      throw new Error("Store not loaded");
    }

    await this.store.set(settingsKey, settings);
    await this.store.save();
  }

  async addUpdateListener(
    handleUpdate: (settings: Settings) => void
  ): Promise<UnlistenFn> {
    if (!this.store) {
      throw new Error("Store not loaded");
    }

    return this.store.onChange((key, value) => {
      if (key === settingsKey) {
        handleUpdate(value as Settings);
      }
    });
  }

  removeUpdateListener(unlistenFunction: UnlistenFn): void {
    if (!this.store) {
      throw new Error("Store not loaded");
    }

    unlistenFunction();
  }
}

export const settingsService = new SettingsService();
