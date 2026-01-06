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
  ergonomicMode: boolean;
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
        "Fix spelling errors, grammar, formatting and capitalization; don't change content and style."
    },
    {
      name: "Improve",
      commandWord: "improve",
      instructions:
        "Improve the text to enhance its writing quality while maintaining its original meaning and intent."
    },
    {
      name: "Explain",
      commandWord: "explain",
      instructions: "Explain the code/text in a clear and concise language."
    },
    {
      name: "Translate to english",
      commandWord: "entranslate",
      instructions: "Translate the text to english."
    },
    {
      name: "Shorten",
      commandWord: "short",
      instructions:
        "Rewrite the text in a shorter, more concise form without losing key ideas. Maintain the original narrative perspective (e.g., first person if used)."
    },
    {
      name: "Work",
      commandWord: "work",
      instructions:
        "Rewrite the following message to be clear and collaborative. Fix all spelling, grammar, formatting, and capitalization issues. Avoid blame, defensiveness, or retrospective justifications (e.g., references to having warned or said something before), unless strictly necessary, while keeping the original meaning intact. Where appropriate, introduce a gently positive and constructive undertone, emphasizing collaboration, openness, and forward momentum. If the message sounds overly pessimistic, make it slightly more uplifting without exaggeration or artificial optimism. You can even add a touch of humor to handle difficult situations. The tone should feel human, natural and warm, suitable for a workplace slack message, email or internal communication in a relatively casual professional environment; Avoid sounding cynical; Avoid em dashes, keep original text emojis if it makes sense to."
    },
    {
      name: "Shell",
      commandWord: "shell",
      instructions:
        "Write a Unix shell command that performs the actions described in the text. Output only the command, with no additional text, and ensure it is ready to execute (do not include a ```bash prefix)."
    },
    {
      name: "SQL",
      commandWord: "sql",
      instructions:
        "Write an SQL query that performs the actions described in the text. Output only the query, with no additional text, and ensure it is ready to execute (do not include a ```sql prefix)."
    }
  ],
  commandSeparator: "///",
  model: {
    modelId: "gpt-5.2",
    provider: "openai",
    apiKey: ""
  },
  autostart: true,
  ergonomicMode: false
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
