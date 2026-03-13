// Core types for selfcode

export interface Message {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  name?: string;
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResult {
  toolCallId: string;
  content: string;
  isError?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<string>;
}

export interface ProviderConfig {
  provider: "openai" | "anthropic";
  apiKey: string;
  model: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface StreamChunk {
  type: "text" | "tool_call_start" | "tool_call_delta" | "tool_call_end" | "done" | "error";
  content?: string;
  toolCall?: Partial<ToolCall>;
  error?: string;
}

export interface AppConfig {
  provider: "openai" | "anthropic";
  apiKey: string;
  model: string;
  baseUrl?: string;
  maxTokens: number;
  temperature: number;
  systemPrompt?: string;
}

export interface ConversationState {
  messages: Message[];
  totalTokens: number;
}
