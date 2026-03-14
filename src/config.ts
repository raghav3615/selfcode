import Conf from "conf";
import type { AppConfig, ConnectedProvider, ProviderType, ThemeName } from "./types.js";
import { getProviderInfo } from "./providers/registry.js";
import fs from "fs";
import path from "path";

// ─── Config Defaults ─────────────────────────────────────────────────────────

const CONFIG_DEFAULTS: Partial<AppConfig> = {
  provider: "openai",
  model: "gpt-4o",
  maxTokens: 4096,
  temperature: 0,
};

// ─── Persistent Store ────────────────────────────────────────────────────────

let store: Conf | null = null;

function getStore(): Conf {
  if (!store) {
    store = new Conf({
      projectName: "selfcode",
      defaults: {
        ...(CONFIG_DEFAULTS as Record<string, unknown>),
        connectedProviders: {},
        theme: "dark",
        sessions: [],
      } as Record<string, unknown>,
    });
  }
  return store as Conf;
}

// ─── App Config ──────────────────────────────────────────────────────────────

export function getConfig(): AppConfig {
  const s = getStore();

  // Environment variables take priority
  const provider =
    (process.env.SELFCODE_PROVIDER as AppConfig["provider"]) ||
    (s.get("provider") as string) ||
    "openai";

  // Try provider-specific env vars, then generic ones
  const providerInfo = getProviderInfo(provider as ProviderType);
  const envApiKey = providerInfo?.apiKeyEnvVar
    ? process.env[providerInfo.apiKeyEnvVar]
    : undefined;

  // Check connected providers for saved API key
  const connected = getConnectedProvider(provider as ProviderType);

  const apiKey =
    process.env.SELFCODE_API_KEY ||
    envApiKey ||
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    connected?.apiKey ||
    (s.get("apiKey") as string) ||
    "";

  const model =
    process.env.SELFCODE_MODEL ||
    (s.get("model") as string) ||
    (provider === "anthropic" ? "claude-sonnet-4-20250514" : "gpt-4o");

  const baseUrl =
    process.env.SELFCODE_BASE_URL ||
    connected?.baseUrl ||
    (s.get("baseUrl") as string) ||
    providerInfo?.defaultBaseUrl ||
    undefined;

  const maxTokens = parseInt(
    process.env.SELFCODE_MAX_TOKENS || String(s.get("maxTokens") || 4096)
  );

  const temperature = parseFloat(
    process.env.SELFCODE_TEMPERATURE || String(s.get("temperature") || 0)
  );

  return { provider: provider as ProviderType, apiKey, model, baseUrl, maxTokens, temperature };
}

export function setConfig(key: string, value: string): void {
  const s = getStore();
  s.set(key, value);
}

export function getConfigPath(): string {
  return getStore().path;
}

// ─── Connected Providers ─────────────────────────────────────────────────────

export function getConnectedProviders(): Record<string, ConnectedProvider> {
  const s = getStore();
  return (s.get("connectedProviders") as Record<string, ConnectedProvider>) || {};
}

export function getConnectedProvider(provider: ProviderType): ConnectedProvider | undefined {
  const providers = getConnectedProviders();
  return providers[provider];
}

export function saveConnectedProvider(provider: ProviderType, apiKey: string, baseUrl?: string): void {
  const s = getStore();
  const providers = getConnectedProviders();
  providers[provider] = {
    provider,
    apiKey,
    baseUrl,
    connectedAt: Date.now(),
  };
  s.set("connectedProviders", providers);
}

export function removeConnectedProvider(provider: ProviderType): void {
  const s = getStore();
  const providers = getConnectedProviders();
  delete providers[provider];
  s.set("connectedProviders", providers);
}

export function listConnectedProviderIds(): ProviderType[] {
  const providers = getConnectedProviders();
  return Object.keys(providers) as ProviderType[];
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export function getTheme(): ThemeName {
  const s = getStore();
  return (s.get("theme") as ThemeName) || "dark";
}

export function setTheme(theme: ThemeName): void {
  const s = getStore();
  s.set("theme", theme);
}

// ─── System Prompt ───────────────────────────────────────────────────────────

export function getSystemPrompt(): string {
  const cwd = process.cwd();

  // Check for project-level system prompt
  const localPromptFile = path.join(cwd, ".selfcode", "prompt.md");
  if (fs.existsSync(localPromptFile)) {
    return fs.readFileSync(localPromptFile, "utf-8");
  }

  const isGitRepo = fs.existsSync(path.join(cwd, ".git"));

  return `You are selfcode, an AI coding assistant running in the user's terminal.
You help with software engineering tasks: writing code, debugging, refactoring, explaining code, and more.

Current working directory: ${cwd}
${isGitRepo ? "This directory is a git repository." : "This directory is NOT a git repository."}
Platform: ${process.platform}
Date: ${new Date().toLocaleDateString()}

Guidelines:
- Be concise and direct. Your output is displayed in a terminal.
- When editing files, show the specific changes you're making.
- Use tools to interact with the filesystem and run commands.
- Always verify your work by reading files before and after changes.
- If a task is ambiguous, ask for clarification.
- Prefer editing existing files over creating new ones.
- When running shell commands, explain what they do.`;
}
