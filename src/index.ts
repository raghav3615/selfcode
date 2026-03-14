import { Command } from "commander";
import React from "react";
import { render } from "ink";
import chalk from "chalk";
import ora from "ora";
import { getConfig } from "./config.js";
import { createProvider } from "./providers/index.js";
import { Conversation } from "./conversation.js";
import { getAllTools } from "./tools/index.js";
import { App } from "./tui/App.js";
import type { StreamChunk, AppConfig } from "./types.js";

const program = new Command();

program
  .name("selfcode")
  .description("AI coding assistant CLI - open source alternative to Claude Code / OpenCode")
  .version("0.1.0")
  .option("-m, --model <model>", "Model to use")
  .option("-p, --provider <provider>", "Provider to use")
  .option("-k, --api-key <key>", "API key")
  .option("-u, --base-url <url>", "Base URL for API")
  .option("--no-tools", "Disable tool use")
  .option("--no-tui", "Disable TUI (use simple readline mode)")
  .argument("[prompt]", "Initial prompt (non-interactive mode)")
  .action(async (prompt, options) => {
    const config = getConfig();

    // CLI flags override config
    if (options.model) config.model = options.model;
    if (options.provider) config.provider = options.provider;
    if (options.apiKey) config.apiKey = options.apiKey;
    if (options.baseUrl) config.baseUrl = options.baseUrl;

    // Non-interactive mode: single prompt (requires API key)
    if (prompt) {
      if (!config.apiKey) {
        console.log(
          chalk.bold.red(
            "No API key found. Set one of:\n" +
              "  OPENAI_API_KEY, ANTHROPIC_API_KEY, SELFCODE_API_KEY env vars\n" +
              '  Or run: selfcode --api-key "your-key"\n'
          )
        );
        process.exit(1);
      }
      await runSinglePrompt(config, prompt);
      return;
    }

    // Interactive TUI mode
    if (options.tui !== false) {
      runTUI(config);
      return;
    }

    // Fallback: simple readline mode
    if (!config.apiKey) {
      console.log(
        chalk.bold.red(
          "No API key found. Set one of:\n" +
            "  OPENAI_API_KEY, ANTHROPIC_API_KEY, SELFCODE_API_KEY env vars\n" +
            "  Or use /connect in TUI mode to add a provider\n" +
            '  Or run: selfcode --api-key "your-key"\n'
        )
      );
      process.exit(1);
    }
    await runSimpleInteractive(config);
  });

// ─── TUI Mode ────────────────────────────────────────────────────────────────

function runTUI(config: AppConfig): void {
  const { waitUntilExit } = render(React.createElement(App, { initialConfig: config }), {
    exitOnCtrlC: false,
  });

  waitUntilExit().then(() => {
    console.log(chalk.dim("Goodbye!"));
    process.exit(0);
  });
}

// ─── Single Prompt Mode ──────────────────────────────────────────────────────

async function runSinglePrompt(config: AppConfig, prompt: string): Promise<void> {
  const provider = createProvider(config);
  const tools = getAllTools();
  const conversation = new Conversation(provider, tools);

  const spinner = ora({ text: "Thinking...", color: "cyan" }).start();
  let started = false;

  try {
    await conversation.run(
      prompt,
      (chunk: StreamChunk) => {
        if (chunk.type === "text" && chunk.content) {
          if (!started) {
            spinner.stop();
            started = true;
          }
          process.stdout.write(chunk.content);
        }
      },
      (name, _args) => {
        if (!started) {
          spinner.stop();
          started = true;
        }
        console.log(chalk.yellow(`  * ${name}`));
      },
      (name, result, isError) => {
        console.log(
          isError
            ? chalk.red(`  x ${name} failed`)
            : chalk.green(`  ok ${name}`)
        );
      }
    );
    console.log();
  } catch (err) {
    spinner.stop();
    console.log(chalk.bold.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
    process.exit(1);
  }
}

// ─── Simple Interactive Mode (--no-tui fallback) ──────────────────────────────

async function runSimpleInteractive(config: AppConfig): Promise<void> {
  const readline = await import("readline");

  const provider = createProvider(config);
  const tools = getAllTools();
  const conversation = new Conversation(provider, tools);

  console.log(chalk.bold.cyan("\n  selfcode v0.1.0 (simple mode)"));
  console.log(chalk.dim(`  Provider: ${config.provider} | Model: ${config.model}`));
  console.log(chalk.dim(`  Type /help for commands, Ctrl+C to exit\n`));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  const ask = () => process.stdout.write(chalk.bold.green("> "));

  rl.on("line", async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) { ask(); return; }
    if (trimmed === "/exit" || trimmed === "/quit") { rl.close(); process.exit(0); }
    if (trimmed === "/help") {
      console.log(chalk.cyan("  Commands: /clear, /exit, /model <name>, /provider <name>"));
      ask(); return;
    }
    if (trimmed === "/clear") {
      conversation.clear();
      console.log(chalk.cyan("  Cleared.")); ask(); return;
    }

    console.log(chalk.bold.blue("\nassistant:"));
    const spinner = ora({ text: "Thinking...", color: "cyan", indent: 2 }).start();
    let textStarted = false;

    try {
      await conversation.run(
        trimmed,
        (chunk: StreamChunk) => {
          if (chunk.type === "text" && chunk.content) {
            if (!textStarted) { spinner.stop(); textStarted = true; process.stdout.write("  "); }
            process.stdout.write(chunk.content.replace(/\n/g, "\n  "));
          }
        },
        (name) => { spinner.stop(); console.log(chalk.yellow(`  * ${name}`)); spinner.start("Executing..."); },
        (name, _r, isError) => { spinner.stop(); console.log(isError ? chalk.red(`  x ${name}`) : chalk.green(`  ok ${name}`)); spinner.start("Thinking..."); }
      );
      spinner.stop();
      if (textStarted) console.log();
      console.log();
    } catch (err) {
      spinner.stop();
      console.log(chalk.bold.red(`  Error: ${err instanceof Error ? err.message : String(err)}`));
      console.log();
    }
    ask();
  });

  rl.on("close", () => { console.log(chalk.dim("\nGoodbye!")); process.exit(0); });
  ask();
}

program.parse();
