import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";
import { llmService, LlmService } from "./llm";
import {
  inputSimulationService,
  InputSimulationService
} from "./input-simulation";
import { Rewrite } from "../types/general";
import { trim } from "lodash";
import { log } from "../utils/log";
import { sleep } from "../utils/general";

/*
 * Types.
 */

export type ParsedClipboardResult = {
  text: string;
  instructions: string;
};

/*
 * Functions.
 */

export function parseClipboardContent(
  clipboardContent: string,
  rewrites: Rewrite[],
  baseCommand: string,
  commandSeparator: string
): ParsedClipboardResult | null {
  if (clipboardContent.trim() === "") {
    return null;
  }

  const [text, ...rest] = clipboardContent.split(commandSeparator);
  const adhocCommandOrInstructions = trim(rest.join(commandSeparator));

  // Example: "how are you///fix" -> Use fix command else use "fix" as instructions
  // If applied to "how are you" -> Use baseCommand

  let instructions: string | undefined;
  if (adhocCommandOrInstructions !== "") {
    const adhocCommand = rewrites.find(
      (rewrite) => rewrite.commandWord === adhocCommandOrInstructions
    );

    if (adhocCommand) {
      instructions = adhocCommand.instructions;
    } else {
      instructions = adhocCommandOrInstructions;
    }
  }

  if (instructions === undefined) {
    instructions = rewrites.find(
      (rewrite) => rewrite.commandWord === baseCommand
    )?.instructions;
  }

  if (!instructions) {
    return null;
  }

  return { text, instructions };
}

/*
 * Service.
 */

export class OperationsService {
  llmService: LlmService;
  inputSimulationService: InputSimulationService;

  constructor(
    llmService: LlmService,
    inputSimulationService: InputSimulationService
  ) {
    this.llmService = llmService;
    this.inputSimulationService = inputSimulationService;
  }

  async rewrite(
    rewrites: Rewrite[],
    baseCommand: string,
    commandSeparator: string,
    ergonomicMode: boolean
  ) {
    if (ergonomicMode) {
      try {
        await this.inputSimulationService.simulateCopy();
        await sleep(100); // Allow clipboard to update
      } catch (error) {
        log.error(
          "Failed to simulate copy, falling back to clipboard content:",
          error
        );
      }
    }

    await this.rewriteClipboard(rewrites, baseCommand, commandSeparator);

    if (ergonomicMode) {
      try {
        await this.inputSimulationService.simulatePaste();
      } catch (error) {
        log.error(
          "Failed to simulate paste, result is still in clipboard:",
          error
        );
      }
    }
  }

  async rewriteClipboard(
    rewrites: Rewrite[],
    baseCommand: string,
    commandSeparator: string
  ) {
    const clipboardContent = await readText();
    const parsed = parseClipboardContent(
      clipboardContent,
      rewrites,
      baseCommand,
      commandSeparator
    );

    if (!parsed) {
      if (clipboardContent.trim() !== "") {
        log.error("No instructions found for command: ", baseCommand);
      }

      return;
    }

    const result = await this.llmService.transformText(
      parsed.instructions,
      parsed.text
    );

    await writeText(result);
  }
}

export const operationsService = new OperationsService(
  llmService,
  inputSimulationService
);
