import chalk from "chalk";
import { getConfig, setConfig, getConfigPath } from "./config.js";

interface SlashCommandResult {
  handled: boolean;
  shouldContinue: boolean; // should the REPL continue after this command
  clearConversation?: boolean;
}

export function handleSlashCommand(input: string): SlashCommandResult {
  const parts = input.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (cmd) {
    case "/help":
      printHelp();
      return { handled: true, shouldContinue: true };

    case "/clear":
      return { handled: true, shouldContinue: true, clearConversation: true };

    case "/model":
      return handleModelCommand(args);

    case "/provider":
      return handleProviderCommand(args);

    case "/config":
      return handleConfigCommand(args);

    case "/exit":
    case "/quit":
      console.log(chalk.dim("Goodbye!"));
      return { handled: true, shouldContinue: false };

    case "/compact":
      console.log(chalk.cyan("  Conversation compacted."));
      return { handled: true, shouldContinue: true, clearConversation: true };

    default:
      if (input.startsWith("/")) {
        console.log(chalk.yellow(`  Unknown command: ${cmd}. Type /help for available commands.`));
        return { handled: true, shouldContinue: true };
      }
      return { handled: false, shouldContinue: true };
  }
}

function printHelp(): void {
  console.log();
  console.log(chalk.bold.cyan("  Available Commands:"));
  console.log();
  console.log(chalk.white("  /help            ") + chalk.dim("Show this help message"));
  console.log(chalk.white("  /clear           ") + chalk.dim("Clear conversation history"));
  console.log(chalk.white("  /compact         ") + chalk.dim("Compact conversation (reset context)"));
  console.log(chalk.white("  /model [name]    ") + chalk.dim("Show or set the current model"));
  console.log(chalk.white("  /provider [name] ") + chalk.dim("Show or set the provider (openai/anthropic)"));
  console.log(chalk.white("  /config          ") + chalk.dim("Show current configuration"));
  console.log(chalk.white("  /exit            ") + chalk.dim("Exit selfcode"));
  console.log();
  console.log(chalk.bold.cyan("  Tips:"));
  console.log(chalk.dim("  • Ctrl+C to interrupt generation or exit"));
  console.log(chalk.dim("  • Set OPENAI_API_KEY or ANTHROPIC_API_KEY env vars"));
  console.log(chalk.dim("  • Use SELFCODE_PROVIDER, SELFCODE_MODEL env vars to configure"));
  console.log();
}

function handleModelCommand(args: string[]): SlashCommandResult {
  if (args.length === 0) {
    const config = getConfig();
    console.log(chalk.cyan(`  Current model: ${chalk.white(config.model)}`));
  } else {
    const model = args[0];
    setConfig("model", model);
    console.log(chalk.green(`  Model set to: ${chalk.white(model)}`));
    console.log(chalk.dim("  Note: Restart selfcode or start a new conversation for changes to take effect."));
  }
  return { handled: true, shouldContinue: true };
}

function handleProviderCommand(args: string[]): SlashCommandResult {
  if (args.length === 0) {
    const config = getConfig();
    console.log(chalk.cyan(`  Current provider: ${chalk.white(config.provider)}`));
  } else {
    const provider = args[0];
    if (provider !== "openai" && provider !== "anthropic") {
      console.log(chalk.yellow(`  Invalid provider. Use "openai" or "anthropic".`));
      return { handled: true, shouldContinue: true };
    }
    setConfig("provider", provider);
    console.log(chalk.green(`  Provider set to: ${chalk.white(provider)}`));
    console.log(chalk.dim("  Note: Restart selfcode for changes to take effect."));
  }
  return { handled: true, shouldContinue: true };
}

function handleConfigCommand(args: string[]): SlashCommandResult {
  const config = getConfig();
  console.log();
  console.log(chalk.bold.cyan("  Current Configuration:"));
  console.log();
  console.log(chalk.white("  Provider:    ") + chalk.dim(config.provider));
  console.log(chalk.white("  Model:       ") + chalk.dim(config.model));
  console.log(chalk.white("  API Key:     ") + chalk.dim(config.apiKey ? "••••" + config.apiKey.slice(-4) : "(not set)"));
  console.log(chalk.white("  Base URL:    ") + chalk.dim(config.baseUrl || "(default)"));
  console.log(chalk.white("  Max Tokens:  ") + chalk.dim(String(config.maxTokens)));
  console.log(chalk.white("  Temperature: ") + chalk.dim(String(config.temperature)));
  console.log(chalk.white("  Config File: ") + chalk.dim(getConfigPath()));
  console.log();
  return { handled: true, shouldContinue: true };
}
