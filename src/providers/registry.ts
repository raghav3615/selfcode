import type { ProviderInfo, ProviderType } from "../types.js";

// ─── Provider Registry ──────────────────────────────────────────────────────
// All supported providers with their models and configuration details.
// Providers using OpenAI-compatible APIs can reuse the OpenAI provider class.

export const PROVIDER_REGISTRY: ProviderInfo[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4o, GPT-4.1, o1, o3 and more",
    website: "https://platform.openai.com",
    requiresApiKey: true,
    apiKeyEnvVar: "OPENAI_API_KEY",
    models: [
      { id: "gpt-4.1", name: "GPT-4.1", contextLength: 1047576, maxOutput: 32768 },
      { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", contextLength: 1047576, maxOutput: 32768 },
      { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", contextLength: 1047576, maxOutput: 32768 },
      { id: "gpt-4o", name: "GPT-4o", contextLength: 128000, maxOutput: 16384 },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", contextLength: 128000, maxOutput: 16384 },
      { id: "o3", name: "o3", contextLength: 200000, maxOutput: 100000 },
      { id: "o3-mini", name: "o3 Mini", contextLength: 200000, maxOutput: 100000 },
      { id: "o1", name: "o1", contextLength: 200000, maxOutput: 100000 },
      { id: "o1-mini", name: "o1 Mini", contextLength: 128000, maxOutput: 65536 },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude Sonnet, Opus, Haiku",
    website: "https://console.anthropic.com",
    requiresApiKey: true,
    apiKeyEnvVar: "ANTHROPIC_API_KEY",
    models: [
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", contextLength: 200000, maxOutput: 64000 },
      { id: "claude-opus-4-20250514", name: "Claude Opus 4", contextLength: 200000, maxOutput: 32000 },
      { id: "claude-haiku-3-5-20241022", name: "Claude 3.5 Haiku", contextLength: 200000, maxOutput: 8192 },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    description: "Ultra-fast inference - Llama, Mixtral, Gemma",
    website: "https://console.groq.com",
    requiresApiKey: true,
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    apiKeyEnvVar: "GROQ_API_KEY",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", contextLength: 128000, maxOutput: 32768 },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", contextLength: 128000, maxOutput: 8192 },
      { id: "llama3-70b-8192", name: "Llama 3 70B", contextLength: 8192, maxOutput: 8192 },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", contextLength: 32768, maxOutput: 32768 },
      { id: "gemma2-9b-it", name: "Gemma 2 9B", contextLength: 8192, maxOutput: 8192 },
      { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B", contextLength: 128000, maxOutput: 16384 },
    ],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    description: "Use your GitHub Copilot subscription",
    website: "https://github.com/features/copilot",
    requiresApiKey: true,
    defaultBaseUrl: "https://api.githubcopilot.com",
    apiKeyEnvVar: "GITHUB_TOKEN",
    models: [
      { id: "gpt-4o", name: "GPT-4o (Copilot)", contextLength: 128000, maxOutput: 16384 },
      { id: "gpt-4o-mini", name: "GPT-4o Mini (Copilot)", contextLength: 128000, maxOutput: 16384 },
      { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet (Copilot)", contextLength: 200000, maxOutput: 8192 },
      { id: "o3-mini", name: "o3 Mini (Copilot)", contextLength: 200000, maxOutput: 65536 },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Access 200+ models through one API",
    website: "https://openrouter.ai",
    requiresApiKey: true,
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    apiKeyEnvVar: "OPENROUTER_API_KEY",
    models: [
      { id: "anthropic/claude-sonnet-4-20250514", name: "Claude Sonnet 4", contextLength: 200000, maxOutput: 64000 },
      { id: "openai/gpt-4o", name: "GPT-4o", contextLength: 128000, maxOutput: 16384 },
      { id: "google/gemini-2.5-pro-preview", name: "Gemini 2.5 Pro", contextLength: 1048576, maxOutput: 65536 },
      { id: "deepseek/deepseek-chat", name: "DeepSeek V3", contextLength: 131072, maxOutput: 8192 },
      { id: "deepseek/deepseek-r1", name: "DeepSeek R1", contextLength: 131072, maxOutput: 8192 },
      { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", contextLength: 131072, maxOutput: 8192 },
      { id: "mistralai/mistral-large-latest", name: "Mistral Large", contextLength: 128000, maxOutput: 4096 },
      { id: "qwen/qwen-2.5-coder-32b-instruct", name: "Qwen 2.5 Coder 32B", contextLength: 32768, maxOutput: 32768 },
    ],
  },
  {
    id: "ollama",
    name: "Ollama",
    description: "Run models locally - no API key needed",
    website: "https://ollama.com",
    requiresApiKey: false,
    defaultBaseUrl: "http://localhost:11434/v1",
    models: [
      { id: "llama3.3", name: "Llama 3.3 70B", contextLength: 128000 },
      { id: "llama3.2", name: "Llama 3.2 3B", contextLength: 128000 },
      { id: "qwen2.5-coder:32b", name: "Qwen 2.5 Coder 32B", contextLength: 32768 },
      { id: "deepseek-coder-v2", name: "DeepSeek Coder V2", contextLength: 128000 },
      { id: "codellama:34b", name: "Code Llama 34B", contextLength: 16384 },
      { id: "mistral", name: "Mistral 7B", contextLength: 32768 },
      { id: "mixtral", name: "Mixtral 8x7B", contextLength: 32768 },
      { id: "phi3:14b", name: "Phi-3 14B", contextLength: 128000 },
      { id: "gemma2:27b", name: "Gemma 2 27B", contextLength: 8192 },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek V3, R1 - powerful reasoning models",
    website: "https://platform.deepseek.com",
    requiresApiKey: true,
    defaultBaseUrl: "https://api.deepseek.com/v1",
    apiKeyEnvVar: "DEEPSEEK_API_KEY",
    models: [
      { id: "deepseek-chat", name: "DeepSeek V3", contextLength: 131072, maxOutput: 8192 },
      { id: "deepseek-reasoner", name: "DeepSeek R1", contextLength: 131072, maxOutput: 8192 },
    ],
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    description: "Grok models by xAI",
    website: "https://console.x.ai",
    requiresApiKey: true,
    defaultBaseUrl: "https://api.x.ai/v1",
    apiKeyEnvVar: "XAI_API_KEY",
    models: [
      { id: "grok-3", name: "Grok 3", contextLength: 131072, maxOutput: 16384 },
      { id: "grok-3-mini", name: "Grok 3 Mini", contextLength: 131072, maxOutput: 16384 },
      { id: "grok-2", name: "Grok 2", contextLength: 131072, maxOutput: 16384 },
    ],
  },
  {
    id: "together",
    name: "Together AI",
    description: "Fast inference for open-source models",
    website: "https://api.together.xyz",
    requiresApiKey: true,
    defaultBaseUrl: "https://api.together.xyz/v1",
    apiKeyEnvVar: "TOGETHER_API_KEY",
    models: [
      { id: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", name: "Llama 3.1 70B Turbo", contextLength: 131072, maxOutput: 4096 },
      { id: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", name: "Llama 3.1 8B Turbo", contextLength: 131072, maxOutput: 4096 },
      { id: "Qwen/Qwen2.5-Coder-32B-Instruct", name: "Qwen 2.5 Coder 32B", contextLength: 32768 },
      { id: "deepseek-ai/DeepSeek-R1", name: "DeepSeek R1", contextLength: 131072 },
      { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B", contextLength: 32768, maxOutput: 32768 },
      { id: "codellama/CodeLlama-34b-Instruct-hf", name: "Code Llama 34B", contextLength: 16384 },
    ],
  },
  {
    id: "fireworks",
    name: "Fireworks AI",
    description: "Fast, production-ready model inference",
    website: "https://fireworks.ai",
    requiresApiKey: true,
    defaultBaseUrl: "https://api.fireworks.ai/inference/v1",
    apiKeyEnvVar: "FIREWORKS_API_KEY",
    models: [
      { id: "accounts/fireworks/models/llama-v3p1-70b-instruct", name: "Llama 3.1 70B", contextLength: 131072 },
      { id: "accounts/fireworks/models/llama-v3p1-8b-instruct", name: "Llama 3.1 8B", contextLength: 131072 },
      { id: "accounts/fireworks/models/qwen2p5-coder-32b-instruct", name: "Qwen 2.5 Coder 32B", contextLength: 32768 },
      { id: "accounts/fireworks/models/deepseek-v3", name: "DeepSeek V3", contextLength: 131072 },
    ],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "Mistral Large, Codestral, Pixtral",
    website: "https://console.mistral.ai",
    requiresApiKey: true,
    defaultBaseUrl: "https://api.mistral.ai/v1",
    apiKeyEnvVar: "MISTRAL_API_KEY",
    models: [
      { id: "mistral-large-latest", name: "Mistral Large", contextLength: 128000, maxOutput: 4096 },
      { id: "codestral-latest", name: "Codestral", contextLength: 32768, maxOutput: 32768 },
      { id: "mistral-small-latest", name: "Mistral Small", contextLength: 128000, maxOutput: 4096 },
      { id: "open-mistral-nemo", name: "Mistral Nemo", contextLength: 128000, maxOutput: 4096 },
      { id: "pixtral-large-latest", name: "Pixtral Large", contextLength: 128000, maxOutput: 4096 },
    ],
  },
  {
    id: "google",
    name: "Google (Gemini)",
    description: "Gemini 2.5 Pro, Flash and more",
    website: "https://aistudio.google.com",
    requiresApiKey: true,
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKeyEnvVar: "GOOGLE_API_KEY",
    models: [
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", contextLength: 1048576, maxOutput: 65536 },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", contextLength: 1048576, maxOutput: 65536 },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", contextLength: 1048576, maxOutput: 8192 },
    ],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description: "Online models with web search built-in",
    website: "https://docs.perplexity.ai",
    requiresApiKey: true,
    defaultBaseUrl: "https://api.perplexity.ai",
    apiKeyEnvVar: "PERPLEXITY_API_KEY",
    models: [
      { id: "sonar-pro", name: "Sonar Pro", contextLength: 200000 },
      { id: "sonar", name: "Sonar", contextLength: 127072 },
      { id: "sonar-reasoning-pro", name: "Sonar Reasoning Pro", contextLength: 127072 },
      { id: "sonar-reasoning", name: "Sonar Reasoning", contextLength: 127072 },
    ],
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "Command R+ for enterprise use",
    website: "https://dashboard.cohere.com",
    requiresApiKey: true,
    defaultBaseUrl: "https://api.cohere.com/v2",
    apiKeyEnvVar: "COHERE_API_KEY",
    models: [
      { id: "command-r-plus", name: "Command R+", contextLength: 128000 },
      { id: "command-r", name: "Command R", contextLength: 128000 },
    ],
  },
  {
    id: "cerebras",
    name: "Cerebras",
    description: "World's fastest inference",
    website: "https://cloud.cerebras.ai",
    requiresApiKey: true,
    defaultBaseUrl: "https://api.cerebras.ai/v1",
    apiKeyEnvVar: "CEREBRAS_API_KEY",
    models: [
      { id: "llama3.3-70b", name: "Llama 3.3 70B", contextLength: 128000 },
      { id: "llama3.1-8b", name: "Llama 3.1 8B", contextLength: 128000 },
    ],
  },
  {
    id: "lmstudio",
    name: "LM Studio",
    description: "Run models locally with LM Studio",
    website: "https://lmstudio.ai",
    requiresApiKey: false,
    defaultBaseUrl: "http://localhost:1234/v1",
    models: [
      { id: "local-model", name: "Local Model (auto-detect)", contextLength: 32768 },
    ],
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    description: "Inference API for open-source models",
    website: "https://huggingface.co",
    requiresApiKey: true,
    defaultBaseUrl: "https://api-inference.huggingface.co/v1",
    apiKeyEnvVar: "HF_API_KEY",
    models: [
      { id: "meta-llama/Meta-Llama-3.1-70B-Instruct", name: "Llama 3.1 70B", contextLength: 128000 },
      { id: "Qwen/Qwen2.5-Coder-32B-Instruct", name: "Qwen 2.5 Coder 32B", contextLength: 32768 },
      { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B", contextLength: 32768 },
    ],
  },
  {
    id: "custom",
    name: "Custom (OpenAI-compatible)",
    description: "Any OpenAI-compatible API endpoint",
    website: "",
    requiresApiKey: true,
    models: [
      { id: "custom-model", name: "Custom Model", contextLength: 128000 },
    ],
  },
];

export function getProviderInfo(providerId: ProviderType): ProviderInfo | undefined {
  return PROVIDER_REGISTRY.find((p) => p.id === providerId);
}

export function getProviderModels(providerId: ProviderType): ProviderInfo["models"] {
  const provider = getProviderInfo(providerId);
  return provider?.models || [];
}

export function getAllProviders(): ProviderInfo[] {
  return PROVIDER_REGISTRY;
}

// Check if provider uses OpenAI-compatible API (most do)
export function isOpenAICompatible(providerId: ProviderType): boolean {
  return providerId !== "anthropic";
}
