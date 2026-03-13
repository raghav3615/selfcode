import { Command } from "commander";
import readline from "readline";
import chalk from "chalk";
import ora from "ora";
import { getConfig } from "./config.js";
import { createProvider } from "./providers/index.js";
import { Conversation } from "./conversation.js";
import { getAllTools } from "./tools/index.js";
import { handleSlashCommand } from "./commands.js";
import {
  printBanner,
  printProvider,
  printUserPrompt,
  printAssistantLabel,
  printToolCall,
  printToolResult,
  printError,
  printMarkdown,
} from "./ui.js";
import type { StreamChunk } from "./types.js";

const program = new Command();

program
  .name("selfcode")
  .description("AI coding assistant CLI - open source alternative to Claude Code")
  .version("0.1.0")
  .option("-m, --model <model>", "Model to use")
  .option("-p, --provider <provider>", "Provider (openai or anthropic)")
  .option("-k, --api-key <key>", "API key")
  .option("-u, --base-url <url>", "Base URL for API")
  .option("--no-tools", "Disable tool use")
  .argument("[prompt]", "Initial prompt (non-interactive mode)")
  .action(async (prompt, options) => {
    const config = getConfig();

    // CLI flags override config
    if (options.model) config.model = options.model;
    if (options.provider) config.provider = options.provider;
    if (options.apiKey) config.apiKey = options.apiKey;
    if (options.baseUrl) config.baseUrl = options.baseUrl;

    // Validate API key
    if (!config.apiKey) {
      printError(
        "No API key found. Set one of:\n" +
          "  • OPENAI_API_KEY environment variable\n" +
          "  • ANTHROPIC_API_KEY environment variable\n" +
          "  • SELFCODE_API_KEY environment variable\n" +
          '  • Run: selfcode --api-key "your-key"\n'
      );
      process.exit(1);
    }

    // Create provider and conversation
    const provider = createProvider(config);
    const tools = options.tools !== false ? getAllTools() : [];
    const conversation = new Conversation(provider, tools);

    // Non-interactive mode: single prompt
    if (prompt) {
      await runSinglePrompt(conversation, prompt);
      return;
    }

    // Interactive mode
    await runInteractive(conversation, config.provider, config.model);
  });

async function runSinglePrompt(
  conversation: Conversation,
  prompt: string
): Promise<void> {
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
      (name, args) => {
        if (!started) {
          spinner.stop();
          started = true;
        }
        printToolCall(name, args);
      },
      (name, result, isError) => {
        printToolResult(name, result, isError);
      }
    );
    console.log();
  } catch (err) {
    spinner.stop();
    printError(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

async function runInteractive(
  conversation: Conversation,
  providerName: string,
  modelName: string
): Promise<void> {
  printBanner();
  printProvider(providerName, modelName);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  const askQuestion = (): void => {
    printUserPrompt();
    // We handle input manually via the 'line' event
  };

  let isProcessing = false;

  rl.on("line", async (input) => {
    const trimmed = input.trim();

    if (!trimmed) {
      if (!isProcessing) askQuestion();
      return;
    }

    // Handle slash commands
    if (trimmed.startsWith("/")) {
      const result = handleSlashCommand(trimmed);
      if (result.clearConversation) {
        conversation.clear();
        console.log(chalk.cyan("  Conversation cleared."));
      }
      if (!result.shouldContinue) {
        rl.close();
        process.exit(0);
      }
      if (result.handled) {
        askQuestion();
        return;
      }
    }

    // Send to LLM
    isProcessing = true;
    printAssistantLabel();

    const spinner = ora({
      text: "Thinking...",
      color: "cyan",
      indent: 2,
    }).start();
    let textStarted = false;
    let lastWasToolOutput = false;

    try {
      await conversation.run(
        trimmed,
        (chunk: StreamChunk) => {
          if (chunk.type === "text" && chunk.content) {
            if (!textStarted) {
              spinner.stop();
              textStarted = true;
              if (lastWasToolOutput) {
                console.log(); // Add space after tool output
              }
              process.stdout.write("  ");
            }
            // Handle newlines - add indent
            const content = chunk.content.replace(/\n/g, "\n  ");
            process.stdout.write(content);
          }
          if (chunk.type === "tool_call_start") {
            if (!textStarted) {
              spinner.stop();
            } else {
              console.log();
            }
            textStarted = false;
          }
          if (chunk.type === "done") {
            spinner.stop();
          }
        },
        (name, args) => {
          spinner.stop();
          printToolCall(name, args);
          spinner.start("Executing...");
        },
        (name, result, isError) => {
          spinner.stop();
          printToolResult(name, isError ? result : result, isError);
          lastWasToolOutput = true;
          textStarted = false;
          spinner.start("Thinking...");
        }
      );

      spinner.stop();
      if (textStarted) console.log(); // End the streamed text
      console.log();
    } catch (err) {
      spinner.stop();
      printError(err instanceof Error ? err.message : String(err));
      console.log();
    }

    isProcessing = false;
    askQuestion();
  });

  rl.on("close", () => {
    console.log(chalk.dim("\nGoodbye!"));
    process.exit(0);
  });

  // Handle Ctrl+C gracefully
  process.on("SIGINT", () => {
    if (isProcessing) {
      console.log(chalk.yellow("\n  Interrupted."));
      isProcessing = false;
      askQuestion();
    } else {
      console.log(chalk.dim("\nGoodbye!"));
      process.exit(0);
    }
  });

  askQuestion();
}

program.parse();
