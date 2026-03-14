# selfcode

An open-source AI coding assistant with a full terminal UI -- inspired by [OpenCode](https://opencode.ai) and Claude Code.

Supports **20+ LLM providers** including OpenAI, Anthropic, Groq, GitHub Copilot, Google Gemini, DeepSeek, Ollama, and many more.

## Features

- **Full Terminal UI (TUI)** - OpenCode-inspired interface with chat panel, input area, status bar, sidebar
- **20+ Providers** - Connect to OpenAI, Anthropic, Groq, GitHub Copilot, OpenRouter, Ollama, DeepSeek, xAI, Together, Fireworks, Mistral, Google Gemini, Perplexity, Cohere, Cerebras, LM Studio, Hugging Face, and any OpenAI-compatible API
- **Provider Management** - `/connect` to add providers, switch between them with `/provider`, change models with `/models`
- **Tool use** - The AI can read/write/edit files, run shell commands, search your codebase
- **Streaming** - Responses stream in real-time
- **Agent Modes** - Toggle between `build` (full access) and `plan` (read-only) with Tab
- **Themes** - 6 built-in themes: dark, light, monokai, dracula, nord, solarized
- **Keyboard Shortcuts** - Leader key (Ctrl+X) pattern like OpenCode/Vim
- **Sessions** - Manage conversation sessions
- **Markdown rendering** - Code blocks, headers, lists rendered in the terminal
- **Non-interactive mode** - Pipe a single prompt and get a response
- **Fallback CLI** - Use `--no-tui` for a simple readline mode

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

## Quick Start

```bash
# Launch the TUI
selfcode

# Use /connect to add a provider interactively
# Or set an API key and go:
export OPENAI_API_KEY="sk-..."
selfcode
```

## Supported Providers

| Provider | API Key Env Var | Description |
|---|---|---|
| **OpenAI** | `OPENAI_API_KEY` | GPT-4o, GPT-4.1, o1, o3 |
| **Anthropic** | `ANTHROPIC_API_KEY` | Claude Sonnet 4, Opus 4, Haiku |
| **Groq** | `GROQ_API_KEY` | Ultra-fast Llama, Mixtral, Gemma |
| **GitHub Copilot** | `GITHUB_TOKEN` | Use your Copilot subscription |
| **OpenRouter** | `OPENROUTER_API_KEY` | 200+ models through one API |
| **Ollama** | *(none needed)* | Run models locally |
| **DeepSeek** | `DEEPSEEK_API_KEY` | DeepSeek V3, R1 reasoning |
| **xAI (Grok)** | `XAI_API_KEY` | Grok 2, Grok 3 |
| **Together AI** | `TOGETHER_API_KEY` | Fast open-source model inference |
| **Fireworks AI** | `FIREWORKS_API_KEY` | Production-ready inference |
| **Mistral AI** | `MISTRAL_API_KEY` | Mistral Large, Codestral |
| **Google Gemini** | `GOOGLE_API_KEY` | Gemini 2.5 Pro, Flash |
| **Perplexity** | `PERPLEXITY_API_KEY` | Models with built-in web search |
| **Cohere** | `COHERE_API_KEY` | Command R+ for enterprise |
| **Cerebras** | `CEREBRAS_API_KEY` | World's fastest inference |
| **LM Studio** | *(none needed)* | Local models via LM Studio |
| **Hugging Face** | `HF_API_KEY` | Open-source model inference |
| **Custom** | *(configurable)* | Any OpenAI-compatible endpoint |

## Usage

### Interactive TUI mode (default)

```bash
selfcode
```

This opens the full terminal UI with:
- Chat panel with markdown rendering
- Input box at the bottom
- Status bar showing provider/model/mode
- Toggleable sidebar (Ctrl+X B)

### Single prompt (non-interactive)

```bash
selfcode "explain this codebase"
```

### Simple readline mode

```bash
selfcode --no-tui
```

### CLI flags

```bash
selfcode --provider anthropic --model claude-sonnet-4-20250514
selfcode -p groq -m llama-3.3-70b-versatile
selfcode --provider ollama --model llama3.3 --no-tui
```

## Keyboard Shortcuts

### Leader Key: Ctrl+X

| Shortcut | Action |
|---|---|
| `Ctrl+X H` | Help dialog |
| `Ctrl+X M` | Model selector |
| `Ctrl+X B` | Toggle sidebar |
| `Ctrl+X N` | New session |
| `Ctrl+X T` | Theme selector |
| `Ctrl+X L` | Session list |
| `Ctrl+X Q` | Quit |
| `Tab` | Switch agent mode (build/plan) |
| `Escape` | Close dialog / interrupt |
| `PageUp/Down` | Scroll chat |

### Input Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+A` | Beginning of line |
| `Ctrl+E` | End of line |
| `Ctrl+K` | Kill to end of line |
| `Ctrl+U` | Kill to beginning |
| `Ctrl+W` | Delete word backward |

## Slash Commands

| Command | Description |
|---|---|
| `/help` | Show help dialog |
| `/connect` | Connect a new provider (interactive) |
| `/provider` | Switch provider |
| `/models` | Switch model |
| `/clear`, `/new` | Clear conversation / new session |
| `/compact` | Compact conversation context |
| `/themes` | Change theme |
| `/sessions` | List sessions |
| `/exit`, `/quit` | Exit selfcode |

## Configuration

Environment variables:

| Variable | Description | Default |
|---|---|---|
| `SELFCODE_PROVIDER` | Provider name | `openai` |
| `SELFCODE_MODEL` | Model name | `gpt-4o` |
| `SELFCODE_BASE_URL` | Custom API base URL | Provider default |
| `SELFCODE_MAX_TOKENS` | Max output tokens | `4096` |
| `SELFCODE_TEMPERATURE` | Temperature | `0` |
| `SELFCODE_API_KEY` | Generic API key | - |

Provider API keys are also saved persistently when you use `/connect`.

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

## Project Structure

```
src/
  index.ts              # CLI entry point (Commander + Ink TUI launcher)
  types.ts              # Core type definitions
  config.ts             # Configuration management (multi-provider, themes)
  conversation.ts       # Conversation/message orchestration
  commands.ts           # Legacy slash command handlers
  ui.ts                 # Legacy terminal UI rendering
  tui/
    App.tsx             # Main TUI application component
    ChatPanel.tsx       # Chat message display with markdown
    InputBox.tsx        # Input with cursor, editing shortcuts
    StatusBar.tsx       # Provider/model/mode status
    Sidebar.tsx         # Session sidebar
    ProviderSelector.tsx # Provider switching dialog
    ModelSelector.tsx   # Model switching dialog
    ConnectDialog.tsx   # Provider connection wizard
    HelpDialog.tsx      # Help/keybindings dialog
    themes.ts           # Theme color definitions
  providers/
    base.ts             # Provider interface and message formatting
    openai.ts           # OpenAI-compatible provider (used by most)
    anthropic.ts        # Anthropic Claude provider
    registry.ts         # Provider registry (20+ providers with models)
    index.ts            # Provider factory
  tools/
    files.ts            # File read/write/edit/list tools
    bash.ts             # Shell command execution
    search.ts           # Glob and grep tools
    index.ts            # Tool registry
```

## License

MIT
