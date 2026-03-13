import Conf from "conf";
import type { AppConfig } from "./types.js";
import fs from "fs";
import path from "path";

const CONFIG_DEFAULTS: Partial<AppConfig> = {
  provider: "openai",
  model: "gpt-4o",
  maxTokens: 4096,
  temperature: 0,
};

let store: Conf<Record<string, unknown>> | null = null;

function getStore(): Conf<Record<string, unknown>> {
  if (!store) {
    store = new Conf({
      projectName: "selfcode",
      defaults: CONFIG_DEFAULTS as Record<string, unknown>,
    });
  }
  return store;
}

export function getConfig(): AppConfig {
  const s = getStore();

  // Environment variables take priority
  const provider =
    (process.env.SELFCODE_PROVIDER as AppConfig["provider"]) ||
    (s.get("provider") as string) ||
    "openai";

  const apiKey =
    process.env.SELFCODE_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    (s.get("apiKey") as string) ||
    "";

  const model =
    process.env.SELFCODE_MODEL ||
    (s.get("model") as string) ||
    (provider === "anthropic" ? "claude-sonnet-4-20250514" : "gpt-4o");

  const baseUrl =
    process.env.SELFCODE_BASE_URL ||
    (s.get("baseUrl") as string) ||
    undefined;

  const maxTokens = parseInt(
    process.env.SELFCODE_MAX_TOKENS || String(s.get("maxTokens") || 4096)
  );

  const temperature = parseFloat(
    process.env.SELFCODE_TEMPERATURE || String(s.get("temperature") || 0)
  );

  return { provider, apiKey, model, baseUrl, maxTokens, temperature };
}

export function setConfig(key: string, value: string): void {
  const s = getStore();
  s.set(key, value);
}

export function getConfigPath(): string {
  return getStore().path;
}

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
