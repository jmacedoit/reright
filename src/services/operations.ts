import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";
import { llmService, LlmService } from "./llm";
import { Rewrite } from "../types/general";
import { trim } from "lodash";
import { log } from "../utils/log";

/*
 * Service.
 */

export class OperationsService {
  llmService: LlmService;

  constructor(llmService: LlmService) {
    this.llmService = llmService;
  }

  async rewriteClipboard(
    rewrites: Rewrite[],
    baseCommand: string,
    commandSeparator: string
  ) {
    const clipboardContent = await readText();

    if (clipboardContent.trim() === "") {
      return;
    }

    const [text, ...rest] = clipboardContent.split(commandSeparator);
    const adhocCommandOrInstructions = trim(rest.join(""));

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
      log.error("No instructions found for command: ", baseCommand);

      return;
    }

    const result = await this.llmService.transformText(instructions, text);

    await writeText(result);
  }
}

export const operationsService = new OperationsService(llmService);
