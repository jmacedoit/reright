import {
  AIMessageChunk,
  HumanMessage,
  SystemMessage
} from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
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
    "gpt-4o-mini",
    "gpt-4.1-nano",
    "gpt-5-nano",
    "gpt-5-mini",
    "gpt-5.2",
    "gpt-5",
    "gpt-4.1"
  ],
  anthropic: ["claude-haiku-4-5", "claude-sonnet-4-5", "claude-opus-4-5"],
  ["google-genai"]: ["gemini-flash-lite-latest", "gemini-flash-latest"]
} as Record<string, string[]>;

export const recommendedModels = [
  "gpt-4o-mini",
  "claude-haiku-4-5",
  "gemini-flash-lite-latest"
];

/*
 * Service.
 */

export class LlmService {
  model: BaseChatModel | null = null;

  setModel(modelParameters: ModelConfigurations) {
    const { modelId, apiKey, provider } = modelParameters;

    switch (provider) {
      case "openai":
        this.model = new ChatOpenAI({
          model: modelId,
          apiKey,
          maxTokens: 4096
        });
        break;
      case "anthropic":
        this.model = new ChatAnthropic({
          model: modelId,
          apiKey,
          maxTokens: 4096
        });
        break;
      case "google-genai":
        this.model = new ChatGoogleGenerativeAI({
          model: modelId,
          apiKey,
          maxOutputTokens: 4096
        });
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
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
