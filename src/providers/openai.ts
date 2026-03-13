import OpenAI from "openai";
import type { Message, StreamChunk, ToolDefinition, ToolCall } from "../types.js";
import type { LLMProvider } from "./base.js";
import {
  toolsToOpenAIFormat,
  messagesToOpenAIFormat,
} from "./base.js";

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
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
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
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
    const formattedMessages = messagesToOpenAIFormat(messages, systemPrompt);
    const formattedTools = toolsToOpenAIFormat(tools);

    const params: Record<string, unknown> = {
      model: this.model,
      messages: formattedMessages,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      stream: true,
    };

    if (formattedTools.length > 0) {
      params.tools = formattedTools;
    }

    const stream = await this.client.chat.completions.create(
      params as unknown as OpenAI.ChatCompletionCreateParamsStreaming
    );

    let content = "";
    const toolCalls: Map<number, ToolCall> = new Map();

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      // Text content
      if (delta.content) {
        content += delta.content;
        onChunk({ type: "text", content: delta.content });
      }

      // Tool calls
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index;
          if (!toolCalls.has(idx)) {
            toolCalls.set(idx, {
              id: tc.id || "",
              type: "function",
              function: {
                name: tc.function?.name || "",
                arguments: "",
              },
            });
            if (tc.id) {
              onChunk({
                type: "tool_call_start",
                toolCall: {
                  id: tc.id,
                  type: "function",
                  function: { name: tc.function?.name || "", arguments: "" },
                },
              });
            }
          }

          const existing = toolCalls.get(idx)!;
          if (tc.id) existing.id = tc.id;
          if (tc.function?.name) existing.function.name += tc.function.name;
          if (tc.function?.arguments) {
            existing.function.arguments += tc.function.arguments;
            onChunk({
              type: "tool_call_delta",
              content: tc.function.arguments,
            });
          }
        }
      }
    }

    // Emit tool call end for each tool call
    for (const [, tc] of toolCalls) {
      onChunk({ type: "tool_call_end", toolCall: tc });
    }

    onChunk({ type: "done" });

    return {
      role: "assistant",
      content,
      toolCalls: toolCalls.size > 0 ? Array.from(toolCalls.values()) : undefined,
    };
  }
}
