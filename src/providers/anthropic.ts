import Anthropic from "@anthropic-ai/sdk";
import type { Message, StreamChunk, ToolDefinition, ToolCall } from "../types.js";
import type { LLMProvider } from "./base.js";
import { toolsToAnthropicFormat, messagesToAnthropicFormat } from "./base.js";

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: {
    apiKey: string;
    model: string;
    baseUrl?: string;
    maxTokens: number;
    temperature: number;
  }) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
    });
    this.model = config.model;
    this.maxTokens = config.maxTokens;
    this.temperature = config.temperature;
  }

  async chat(
    messages: Message[],
    tools: ToolDefinition[],
    systemPrompt: string,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<Message> {
    const formattedMessages = messagesToAnthropicFormat(messages);
    const formattedTools = toolsToAnthropicFormat(tools);

    const params: Record<string, unknown> = {
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      system: systemPrompt,
      messages: formattedMessages,
      stream: true,
    };

    if (formattedTools.length > 0) {
      params.tools = formattedTools;
    }

    const stream = await this.client.messages.stream(
      params as unknown as Anthropic.MessageStreamParams
    );

    let content = "";
    const toolCalls: ToolCall[] = [];
    let currentToolId = "";
    let currentToolName = "";
    let currentToolArgs = "";

    stream.on("text", (text) => {
      content += text;
      onChunk({ type: "text", content: text });
    });

    stream.on("contentBlock", (block) => {
      if (block.type === "tool_use") {
        // Finalize the tool call
        const tc: ToolCall = {
          id: block.id,
          type: "function",
          function: {
            name: block.name,
            arguments: JSON.stringify(block.input),
          },
        };
        toolCalls.push(tc);
        onChunk({ type: "tool_call_end", toolCall: tc });
      }
    });

    stream.on("inputJson", (delta, snapshot) => {
      onChunk({ type: "tool_call_delta", content: delta });
    });

    // Wait for the stream to complete
    const finalMessage = await stream.finalMessage();

    onChunk({ type: "done" });

    return {
      role: "assistant",
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  }
}
