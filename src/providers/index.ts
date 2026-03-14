export { type LLMProvider } from "./base.js";
export { OpenAIProvider } from "./openai.js";
export { AnthropicProvider } from "./anthropic.js";
export { PROVIDER_REGISTRY, getProviderInfo, getProviderModels, getAllProviders, isOpenAICompatible } from "./registry.js";

import type { LLMProvider } from "./base.js";
import { OpenAIProvider } from "./openai.js";
import { AnthropicProvider } from "./anthropic.js";
import { isOpenAICompatible, getProviderInfo } from "./registry.js";
import type { AppConfig } from "../types.js";

export function createProvider(config: AppConfig): LLMProvider {
  // Anthropic uses its own SDK
  if (config.provider === "anthropic") {
    return new AnthropicProvider({
      apiKey: config.apiKey,
      model: config.model,
      baseUrl: config.baseUrl,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    });
  }

  // Everything else uses OpenAI-compatible API
  // Get default base URL from registry if not explicitly set
  const providerInfo = getProviderInfo(config.provider);
  const baseUrl = config.baseUrl || providerInfo?.defaultBaseUrl || undefined;

  return new OpenAIProvider({
    apiKey: config.apiKey || "not-needed", // Ollama / LM Studio don't need a key
    model: config.model,
    baseUrl,
    maxTokens: config.maxTokens,
    temperature: config.temperature,
  });
}
