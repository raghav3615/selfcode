# selfcode

An open-source Claude Code / OpenCode-like AI coding assistant CLI.

Built with TypeScript. Supports OpenAI-compatible APIs and Anthropic Claude.

## Features

- **Interactive REPL** - Chat with an AI assistant in your terminal
- **Multi-provider** - Works with OpenAI, Anthropic, and any OpenAI-compatible API (Ollama, LM Studio, etc.)
- **Tool use** - The AI can read/write/edit files, run shell commands, search your codebase
- **Streaming** - Responses stream in real-time
- **Slash commands** - `/help`, `/clear`, `/model`, `/provider`, `/config`, `/exit`
- **Non-interactive mode** - Pipe a single prompt and get a response

## Installation

```bash
# Clone the repo
git clone https://github.com/raghav3615/selfcode.git
cd selfcode

# Install dependencies
npm install

# Build
npm run build

# Link globally (optional)
npm link
```

## Configuration

Set your API key via environment variable:

```bash
# For OpenAI / OpenAI-compatible
export OPENAI_API_KEY="sk-..."

# For Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."

# Or use the generic key
export SELFCODE_API_KEY="your-key"
```

Other environment variables:

| Variable | Description | Default |
|---|---|---|
| `SELFCODE_PROVIDER` | `openai` or `anthropic` | `openai` |
| `SELFCODE_MODEL` | Model name | `gpt-4o` |
| `SELFCODE_BASE_URL` | Custom API base URL | Provider default |
| `SELFCODE_MAX_TOKENS` | Max output tokens | `4096` |
| `SELFCODE_TEMPERATURE` | Temperature | `0` |

## Usage

### Interactive mode

```bash
selfcode
```

### Single prompt (non-interactive)

```bash
selfcode "explain this codebase"
```

### CLI flags

```bash
selfcode --provider anthropic --model claude-sonnet-4-20250514 --api-key "sk-ant-..."
selfcode -m gpt-4o -k "sk-..." "fix the bug in main.ts"
```

### Using with local models (Ollama, LM Studio)

```bash
# Ollama
export SELFCODE_BASE_URL="http://localhost:11434/v1"
export SELFCODE_API_KEY="ollama"
selfcode -m llama3

# LM Studio
export SELFCODE_BASE_URL="http://localhost:1234/v1"
export SELFCODE_API_KEY="lm-studio"
selfcode -m local-model
```

## Available Tools

The AI assistant has access to these tools:

| Tool | Description |
|---|---|
| `read_file` | Read file contents with line numbers |
| `write_file` | Create or overwrite files |
| `edit_file` | Find-and-replace in files |
| `list_directory` | List directory contents |
| `bash` | Execute shell commands |
| `glob` | Search for files by pattern |
| `grep` | Search file contents with regex |

## Slash Commands

| Command | Description |
|---|---|
| `/help` | Show available commands |
| `/clear` | Clear conversation history |
| `/compact` | Reset conversation context |
| `/model [name]` | Show or change the model |
| `/provider [name]` | Show or change the provider |
| `/config` | Show current configuration |
| `/exit` | Exit selfcode |

## Project Structure

```
src/
  index.ts          # CLI entry point and REPL
  types.ts          # Core type definitions
  config.ts         # Configuration management
  conversation.ts   # Conversation/message orchestration
  commands.ts       # Slash command handlers
  ui.ts             # Terminal UI rendering
  providers/
    base.ts         # Provider interface and message formatting
    openai.ts       # OpenAI-compatible provider
    anthropic.ts    # Anthropic Claude provider
    index.ts        # Provider factory
  tools/
    files.ts        # File read/write/edit/list tools
    bash.ts         # Shell command execution
    search.ts       # Glob and grep tools
    index.ts        # Tool registry
```

## License

MIT
