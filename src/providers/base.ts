import type { Message, StreamChunk, ToolDefinition, ToolCall } from "../types.js";

export interface LLMProvider {
  chat(
    messages: Message[],
    tools: ToolDefinition[],
    systemPrompt: string,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<Message>;
}

// Convert our tool definitions to OpenAI function format
export function toolsToOpenAIFormat(tools: ToolDefinition[]) {
  return tools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

// Convert our tool definitions to Anthropic format
export function toolsToAnthropicFormat(tools: ToolDefinition[]) {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));
}

// Convert messages to OpenAI format
export function messagesToOpenAIFormat(messages: Message[], systemPrompt: string) {
  const formatted: Array<Record<string, unknown>> = [
    { role: "system", content: systemPrompt },
  ];

  for (const msg of messages) {
    if (msg.role === "tool") {
      formatted.push({
        role: "tool",
        tool_call_id: msg.toolCallId,
        content: msg.content,
      });
    } else if (msg.role === "assistant" && msg.toolCalls && msg.toolCalls.length > 0) {
      formatted.push({
        role: "assistant",
        content: msg.content || null,
        tool_calls: msg.toolCalls.map((tc) => ({
          id: tc.id,
          type: "function",
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        })),
      });
    } else {
      formatted.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  return formatted;
}

// Convert messages to Anthropic format
export function messagesToAnthropicFormat(messages: Message[]) {
  const formatted: Array<Record<string, unknown>> = [];

  for (const msg of messages) {
    if (msg.role === "system") continue; // handled separately in Anthropic

    if (msg.role === "tool") {
      formatted.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: msg.toolCallId,
            content: msg.content,
          },
        ],
      });
    } else if (msg.role === "assistant" && msg.toolCalls && msg.toolCalls.length > 0) {
      const content: Array<Record<string, unknown>> = [];
      if (msg.content) {
        content.push({ type: "text", text: msg.content });
      }
      for (const tc of msg.toolCalls) {
        content.push({
          type: "tool_use",
          id: tc.id,
          name: tc.function.name,
          input: JSON.parse(tc.function.arguments),
        });
      }
      formatted.push({ role: "assistant", content });
    } else {
      formatted.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    }
  }

  return formatted;
}
