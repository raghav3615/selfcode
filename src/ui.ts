import chalk from "chalk";

const LOGO = `
  ┌─────────────────────────────┐
  │       ${chalk.bold.cyan("selfcode")} v0.1.0       │
  │   AI Coding Assistant CLI   │
  └─────────────────────────────┘`;

export function printBanner(): void {
  console.log(LOGO);
  console.log();
}

export function printProvider(provider: string, model: string): void {
  console.log(
    chalk.dim(`  Provider: ${chalk.white(provider)} | Model: ${chalk.white(model)}`)
  );
  console.log(chalk.dim(`  Type ${chalk.white("/help")} for commands, ${chalk.white("Ctrl+C")} to exit`));
  console.log();
}

export function printUserPrompt(): void {
  process.stdout.write(chalk.bold.green("> "));
}

export function printAssistantLabel(): void {
  console.log();
  console.log(chalk.bold.blue("assistant:"));
}

export function printToolCall(name: string, args: Record<string, unknown>): void {
  const shortArgs = formatToolArgs(name, args);
  console.log(chalk.yellow(`  ◆ ${name}`) + chalk.dim(` ${shortArgs}`));
}

export function printToolResult(name: string, result: string, isError: boolean): void {
  if (isError) {
    console.log(chalk.red(`  ✗ ${name} failed`));
    const lines = result.split("\n").slice(0, 5);
    for (const line of lines) {
      console.log(chalk.dim.red(`    ${line}`));
    }
  } else {
    const lines = result.split("\n");
    const lineCount = lines.length;
    console.log(
      chalk.green(`  ✓ ${name}`) +
        chalk.dim(` (${lineCount} line${lineCount !== 1 ? "s" : ""})`)
    );
    // Show first few lines of output for certain tools
    if (name === "bash" && lineCount <= 10) {
      for (const line of lines) {
        console.log(chalk.dim(`    ${line}`));
      }
    }
  }
}

export function printError(message: string): void {
  console.log(chalk.bold.red(`Error: ${message}`));
}

export function printInfo(message: string): void {
  console.log(chalk.cyan(`  ${message}`));
}

export function printDim(message: string): void {
  console.log(chalk.dim(message));
}

export function printMarkdown(text: string): void {
  // Simple markdown rendering for terminal
  const lines = text.split("\n");
  for (const line of lines) {
    // Code blocks
    if (line.startsWith("```")) {
      console.log(chalk.dim(line));
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      console.log(chalk.bold.cyan(line.substring(4)));
      continue;
    }
    if (line.startsWith("## ")) {
      console.log(chalk.bold.cyan(line.substring(3)));
      continue;
    }
    if (line.startsWith("# ")) {
      console.log(chalk.bold.cyan(line.substring(2)));
      continue;
    }

    // Bold
    let processed = line.replace(/\*\*(.*?)\*\*/g, chalk.bold("$1"));
    // Inline code
    processed = processed.replace(/`([^`]+)`/g, chalk.cyan("$1"));
    // Bullet points
    if (processed.startsWith("- ") || processed.startsWith("* ")) {
      processed = chalk.dim("  • ") + processed.substring(2);
    }

    console.log(processed);
  }
}

function formatToolArgs(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case "read_file":
      return String(args.path || "");
    case "write_file":
      return String(args.path || "");
    case "edit_file":
      return String(args.path || "");
    case "bash":
      return truncate(String(args.command || ""), 80);
    case "glob":
      return String(args.pattern || "");
    case "grep":
      return `${args.pattern || ""} ${args.include ? `(${args.include})` : ""}`;
    case "list_directory":
      return String(args.path || ".");
    default:
      return "";
  }
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + "...";
}
