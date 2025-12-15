import {
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { initChatModel } from "langchain/chat_models/universal";
import { log } from "../utils/log";

/*
 * Types.
 */

export type ModelConfigurations = {
  modelId: string;
  provider: string;
  apiKey: string;
};

/*
 * Constants.
 */

export const providerModels = {
  openai: [
    "gpt-5.2",
    "gpt-5-mini",
    "gpt-5",
    "gpt-5-nano",
    "gpt-4.1",
    "gpt-4.1-nano",
    "gpt-4o-mini",
  ],
  anthropic: ["claude-haiku-4-5"],
} as Record<string, string[]>;

/*
 * Service.
 */

export class LlmService {
  model: any;

  async setModel(modelParameters: ModelConfigurations) {
    this.model = await initChatModel(modelParameters.modelId, {
      apiKey: modelParameters.apiKey,
      modelProvider: modelParameters.provider,
      maxCompletionTokens: 4096,
    });
  }

  async transformText(instructions: string, text: string): Promise<string> {
    const systemMsg = new SystemMessage(
      "Apply the provided instructions to the provided text"
    );
    const humanMsg = new HumanMessage(
      "<<<TEXT>>>\n" +
        text +
        "\n<<</TEXT>>>\n" +
        "\n<<<INSTRUCTIONS>>>\n" +
        instructions +
        "\n<<</INSTRUCTIONS>>>\nReturn the transformed text only."
    );
    const messages = [systemMsg, humanMsg];

    log.debug("Instructions", instructions);
    log.debug("Text", text);

    if (!this.model) {
      throw new Error("Model not set");
    }

    try {
      const response: AIMessageChunk = await this.model.invoke(messages);

      return response.content as string;
    } catch (error) {
      log.error("Error invoking model: ", error);

      throw error;
    }
  }
}

export const llmService = new LlmService();
