import React from "react";
import { Box, Text, useInput } from "ink";
import type { ThemeColors } from "../types.js";

interface HelpDialogProps {
  onClose: () => void;
  theme: ThemeColors;
  width: number;
}

export function HelpDialog({ onClose, theme, width }: HelpDialogProps) {
  useInput((input, key) => {
    if (key.escape || key.return) {
      onClose();
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.primary}
      paddingX={2}
      paddingY={1}
      width={width}
    >
      <Text bold color={theme.primary}>
        selfcode - Help
      </Text>
      <Text color={theme.muted}>Press Esc or Enter to close</Text>

      <Box marginTop={1} flexDirection="column">
        <Text bold color={theme.accent}>
          Slash Commands
        </Text>
        <HelpRow cmd="/help" desc="Show this help" theme={theme} />
        <HelpRow cmd="/connect" desc="Connect a new provider (add API key)" theme={theme} />
        <HelpRow cmd="/provider" desc="Switch provider" theme={theme} />
        <HelpRow cmd="/models" desc="Switch model" theme={theme} />
        <HelpRow cmd="/clear, /new" desc="Clear conversation / new session" theme={theme} />
        <HelpRow cmd="/compact" desc="Compact conversation context" theme={theme} />
        <HelpRow cmd="/themes" desc="Change theme" theme={theme} />
        <HelpRow cmd="/sessions" desc="List sessions" theme={theme} />
        <HelpRow cmd="/exit, /quit" desc="Exit selfcode" theme={theme} />
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text bold color={theme.accent}>
          Keyboard Shortcuts (Leader: Ctrl+X)
        </Text>
        <HelpRow cmd="Ctrl+X H" desc="Help" theme={theme} />
        <HelpRow cmd="Ctrl+X M" desc="Model selector" theme={theme} />
        <HelpRow cmd="Ctrl+X B" desc="Toggle sidebar" theme={theme} />
        <HelpRow cmd="Ctrl+X N" desc="New session" theme={theme} />
        <HelpRow cmd="Ctrl+X T" desc="Theme selector" theme={theme} />
        <HelpRow cmd="Ctrl+X L" desc="Session list" theme={theme} />
        <HelpRow cmd="Ctrl+X Q" desc="Quit" theme={theme} />
        <HelpRow cmd="Tab" desc="Switch agent mode (build/plan)" theme={theme} />
        <HelpRow cmd="Escape" desc="Close dialog / interrupt" theme={theme} />
        <HelpRow cmd="PageUp/Down" desc="Scroll chat" theme={theme} />
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text bold color={theme.accent}>
          Input Shortcuts
        </Text>
        <HelpRow cmd="Ctrl+A" desc="Beginning of line" theme={theme} />
        <HelpRow cmd="Ctrl+E" desc="End of line" theme={theme} />
        <HelpRow cmd="Ctrl+K" desc="Kill to end" theme={theme} />
        <HelpRow cmd="Ctrl+U" desc="Kill to start" theme={theme} />
        <HelpRow cmd="Ctrl+W" desc="Delete word backward" theme={theme} />
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text bold color={theme.accent}>
          Supported Providers
        </Text>
        <Text color={theme.text}>
          OpenAI, Anthropic, Groq, GitHub Copilot, OpenRouter,
        </Text>
        <Text color={theme.text}>
          Ollama, DeepSeek, xAI (Grok), Together AI, Fireworks,
        </Text>
        <Text color={theme.text}>
          Mistral, Google Gemini, Perplexity, Cohere, Cerebras,
        </Text>
        <Text color={theme.text}>
          LM Studio, Hugging Face, Custom OpenAI-compatible
        </Text>
      </Box>
    </Box>
  );
}

function HelpRow({
  cmd,
  desc,
  theme,
}: {
  cmd: string;
  desc: string;
  theme: ThemeColors;
}) {
  return (
    <Box>
      <Box width={20}>
        <Text color={theme.primary}>{cmd}</Text>
      </Box>
      <Text color={theme.text}>{desc}</Text>
    </Box>
  );
}
