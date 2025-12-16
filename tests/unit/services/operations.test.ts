import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  parseClipboardContent,
  OperationsService,
} from "../../../src/services/operations";
import { Rewrite } from "../../../src/types/general";
import { LlmService } from "../../../src/services/llm";

vi.mock("@tauri-apps/plugin-clipboard-manager", () => ({
  readText: vi.fn(),
  writeText: vi.fn(),
}));

const defaultRewrites: Rewrite[] = [
  {
    name: "Fix",
    commandWord: "fix",
    instructions: "Fix spelling, grammar, formatting and capitalization.",
  },
  {
    name: "Improve",
    commandWord: "improve",
    instructions: "Improve the writing while preserving meaning.",
  },
  {
    name: "Translate",
    commandWord: "translate",
    instructions: "Translate to English.",
  },
];

const defaultSeparator = "///";

describe("parseClipboardContent", () => {
  it("uses the base command when no separator is present", () => {
    const result = parseClipboardContent(
      "Hello world",
      defaultRewrites,
      "fix",
      defaultSeparator
    );

    expect(result).toEqual({
      text: "Hello world",
      instructions: "Fix spelling, grammar, formatting and capitalization.",
    });
  });

  it("uses the adhoc command when it matches a rewrite", () => {
    const result = parseClipboardContent(
      "Hello world///improve",
      defaultRewrites,
      "fix",
      defaultSeparator
    );

    expect(result).toEqual({
      text: "Hello world",
      instructions: "Improve the writing while preserving meaning.",
    });
  });

  it("uses the adhoc string as raw instructions when it doesn't match any rewrite", () => {
    const result = parseClipboardContent(
      "Hello world///make it more formal",
      defaultRewrites,
      "fix",
      defaultSeparator
    );

    expect(result).toEqual({
      text: "Hello world",
      instructions: "make it more formal",
    });
  });

  it("returns null for empty clipboard", () => {
    const result = parseClipboardContent(
      "",
      defaultRewrites,
      "fix",
      defaultSeparator
    );

    expect(result).toBeNull();
  });

  it("returns null for whitespace-only clipboard", () => {
    const result = parseClipboardContent(
      "   \n\t  ",
      defaultRewrites,
      "fix",
      defaultSeparator
    );

    expect(result).toBeNull();
  });

  it("trims whitespace from adhoc command/instructions", () => {
    const result = parseClipboardContent(
      "Hello world///  improve  ",
      defaultRewrites,
      "fix",
      defaultSeparator
    );

    expect(result).toEqual({
      text: "Hello world",
      instructions: "Improve the writing while preserving meaning.",
    });
  });

  it("joins everything after the first separator as the adhoc instructions", () => {
    const result = parseClipboardContent(
      "part one///part two///part three",
      defaultRewrites,
      "fix",
      defaultSeparator
    );

    expect(result).toEqual({
      text: "part one",
      instructions: "part two///part three",
    });
  });

  it("uses base command when separator is present but adhoc is empty", () => {
    const result = parseClipboardContent(
      "Hello world///",
      defaultRewrites,
      "fix",
      defaultSeparator
    );

    expect(result).toEqual({
      text: "Hello world",
      instructions: "Fix spelling, grammar, formatting and capitalization.",
    });
  });

  it("uses base command when separator is present but adhoc is whitespace", () => {
    const result = parseClipboardContent(
      "Hello world///  ",
      defaultRewrites,
      "fix",
      defaultSeparator
    );

    expect(result).toEqual({
      text: "Hello world",
      instructions: "Fix spelling, grammar, formatting and capitalization.",
    });
  });

  it("returns null when base command doesn't match any rewrite", () => {
    const result = parseClipboardContent(
      "Hello world",
      defaultRewrites,
      "unknown_command",
      defaultSeparator
    );

    expect(result).toBeNull();
  });

  it("uses adhoc even when base command is invalid", () => {
    const result = parseClipboardContent(
      "Hello world///fix",
      defaultRewrites,
      "unknown_command",
      defaultSeparator
    );

    expect(result).toEqual({
      text: "Hello world",
      instructions: "Fix spelling, grammar, formatting and capitalization.",
    });
  });

  it("respects custom separator and preserves default separator in text", () => {
    const result = parseClipboardContent(
      "Hello///world---improve",
      defaultRewrites,
      "fix",
      "---"
    );

    expect(result).toEqual({
      text: "Hello///world",
      instructions: "Improve the writing while preserving meaning.",
    });
  });

  it("works with empty rewrites array when adhoc instructions provided", () => {
    const result = parseClipboardContent(
      "Hello///custom instructions",
      [],
      "fix",
      defaultSeparator
    );

    expect(result).toEqual({
      text: "Hello",
      instructions: "custom instructions",
    });
  });

  it("returns null with empty rewrites and no adhoc", () => {
    const result = parseClipboardContent(
      "Hello world",
      [],
      "fix",
      defaultSeparator
    );

    expect(result).toBeNull();
  });
});

describe("OperationsService.rewriteClipboard", () => {
  let mockLlmService: LlmService;
  let operationsService: OperationsService;
  let clipboardModule: typeof import("@tauri-apps/plugin-clipboard-manager");

  beforeEach(async () => {
    vi.clearAllMocks();

    clipboardModule = await import("@tauri-apps/plugin-clipboard-manager");

    mockLlmService = {
      transformText: vi.fn().mockResolvedValue("transformed text"),
    } as unknown as LlmService;

    operationsService = new OperationsService(mockLlmService);
  });

  it("invokes llmService.transformText with parsed text and instructions", async () => {
    vi.mocked(clipboardModule.readText).mockResolvedValue("Hello world");

    await operationsService.rewriteClipboard(defaultRewrites, "fix", "///");

    expect(mockLlmService.transformText).toHaveBeenCalledWith(
      "Fix spelling, grammar, formatting and capitalization.",
      "Hello world"
    );
  });

  it("writes the LLM result back to clipboard", async () => {
    vi.mocked(clipboardModule.readText).mockResolvedValue("Hello world");
    vi.mocked(mockLlmService.transformText).mockResolvedValue("Improved text");

    await operationsService.rewriteClipboard(defaultRewrites, "fix", "///");

    expect(clipboardModule.writeText).toHaveBeenCalledWith("Improved text");
  });

  it("does not invoke llmService when clipboard is empty", async () => {
    vi.mocked(clipboardModule.readText).mockResolvedValue("");

    await operationsService.rewriteClipboard(defaultRewrites, "fix", "///");

    expect(mockLlmService.transformText).not.toHaveBeenCalled();
    expect(clipboardModule.writeText).not.toHaveBeenCalled();
  });

  it("does not invoke llmService when no matching instructions found", async () => {
    vi.mocked(clipboardModule.readText).mockResolvedValue("Hello world");

    await operationsService.rewriteClipboard(
      defaultRewrites,
      "unknown_command",
      "///"
    );

    expect(mockLlmService.transformText).not.toHaveBeenCalled();
    expect(clipboardModule.writeText).not.toHaveBeenCalled();
  });
});
