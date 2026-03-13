export { type LLMProvider } from "./base.js";
export { OpenAIProvider } from "./openai.js";
export { AnthropicProvider } from "./anthropic.js";

import type { LLMProvider } from "./base.js";
import { OpenAIProvider } from "./openai.js";
import { AnthropicProvider } from "./anthropic.js";
import type { AppConfig } from "../types.js";

export function createProvider(config: AppConfig): LLMProvider {
  switch (config.provider) {
    case "anthropic":
      return new AnthropicProvider({
        apiKey: config.apiKey,
        model: config.model,
        baseUrl: config.baseUrl,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
      });
    case "openai":
    default:
      return new OpenAIProvider({
        apiKey: config.apiKey,
        model: config.model,
        baseUrl: config.baseUrl,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
      });
  }
}
