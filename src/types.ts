// Core types for selfcode

export interface Message {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  name?: string;
  timestamp?: number;
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

// ─── Provider Types ──────────────────────────────────────────────────────────

export type ProviderType =
  | "openai"
  | "anthropic"
  | "groq"
  | "github-copilot"
  | "openrouter"
  | "ollama"
  | "deepseek"
  | "xai"
  | "together"
  | "fireworks"
  | "mistral"
  | "google"
  | "perplexity"
  | "cohere"
  | "cerebras"
  | "lmstudio"
  | "azure"
  | "amazon-bedrock"
  | "huggingface"
  | "custom";

export interface ProviderModelInfo {
  id: string;
  name: string;
  contextLength?: number;
  maxOutput?: number;
}

export interface ProviderInfo {
  id: ProviderType;
  name: string;
  description: string;
  website: string;
  requiresApiKey: boolean;
  defaultBaseUrl?: string;
  apiKeyEnvVar?: string;
  models: ProviderModelInfo[];
}

export interface ProviderConfig {
  provider: ProviderType;
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
  provider: ProviderType;
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

// ─── TUI Types ───────────────────────────────────────────────────────────────

export type DialogType =
  | "none"
  | "help"
  | "provider-select"
  | "model-select"
  | "provider-connect"
  | "sessions"
  | "themes";

export type AgentMode = "build" | "plan";

export interface Session {
  id: string;
  name: string;
  messages: Message[];
  provider: ProviderType;
  model: string;
  createdAt: number;
  updatedAt: number;
}

export type ThemeName = "dark" | "light" | "monokai" | "dracula" | "nord" | "solarized";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  error: string;
  warning: string;
  success: string;
  muted: string;
  border: string;
  bg: string;
  text: string;
}

// ─── Connected Provider (saved auth) ─────────────────────────────────────────

export interface ConnectedProvider {
  provider: ProviderType;
  apiKey: string;
  baseUrl?: string;
  connectedAt: number;
}
