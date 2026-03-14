import React from "react";
import { Box, Text } from "ink";
import type { Message, ThemeColors } from "../types.js";

interface ChatPanelProps {
  messages: Message[];
  streamingText: string;
  isProcessing: boolean;
  toolStatus: string;
  theme: ThemeColors;
  width: number;
  height: number;
  scrollOffset: number;
}

export function ChatPanel({
  messages,
  streamingText,
  isProcessing,
  toolStatus,
  theme,
  width,
  height,
  scrollOffset,
}: ChatPanelProps) {
  // If no messages, show welcome
  if (messages.length === 0 && !streamingText && !isProcessing) {
    return (
      <Box
        flexDirection="column"
        height={height}
        width={width}
        paddingX={2}
        justifyContent="center"
        alignItems="center"
      >
        <Text bold color={theme.primary}>
          Welcome to selfcode
        </Text>
        <Text color={theme.muted}> </Text>
        <Text color={theme.text}>
          AI coding assistant for your terminal
        </Text>
        <Text color={theme.muted}> </Text>
        <Box flexDirection="column" alignItems="center">
          <Text color={theme.muted}>
            Type a message below to get started
          </Text>
          <Text color={theme.muted}>
            /help for commands | /connect to add a provider
          </Text>
          <Text color={theme.muted}>
            Ctrl+X then H for help | Tab to switch mode
          </Text>
        </Box>
        <Text color={theme.muted}> </Text>
        <Box flexDirection="column" alignItems="center">
          <Text color={theme.accent}>
            Supports: OpenAI, Anthropic, Groq, GitHub Copilot,
          </Text>
          <Text color={theme.accent}>
            DeepSeek, Google Gemini, Ollama, Mistral, and more
          </Text>
        </Box>
      </Box>
    );
  }

  // Render messages
  const rendered: React.ReactNode[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "user") {
      rendered.push(
        <Box key={`msg-${i}`} flexDirection="column" paddingX={2} marginBottom={1}>
          <Text bold color={theme.success}>
            {">"} You
          </Text>
          <Box paddingLeft={2}>
            <Text color={theme.text} wrap="wrap">
              {msg.content}
            </Text>
          </Box>
        </Box>
      );
    } else if (msg.role === "assistant") {
      rendered.push(
        <Box key={`msg-${i}`} flexDirection="column" paddingX={2} marginBottom={1}>
          <Text bold color={theme.primary}>
            {">"} Assistant
          </Text>
          <Box paddingLeft={2} flexDirection="column">
            <MarkdownText text={msg.content} theme={theme} width={width - 6} />
          </Box>
        </Box>
      );
    }
  }

  // Streaming text
  if (streamingText) {
    rendered.push(
      <Box key="streaming" flexDirection="column" paddingX={2} marginBottom={1}>
        <Text bold color={theme.primary}>
          {">"} Assistant
        </Text>
        <Box paddingLeft={2} flexDirection="column">
          <MarkdownText text={streamingText} theme={theme} width={width - 6} />
        </Box>
      </Box>
    );
  }

  // Processing indicator
  if (isProcessing && !streamingText) {
    rendered.push(
      <Box key="processing" paddingX={2}>
        <Text color={theme.accent}>
          {toolStatus || "Thinking..."}
        </Text>
      </Box>
    );
  } else if (isProcessing && toolStatus) {
    rendered.push(
      <Box key="tool-status" paddingX={2}>
        <Text color={theme.accent}>
          {toolStatus}
        </Text>
      </Box>
    );
  }

  // Calculate visible messages with scrolling
  const totalRendered = rendered.length;
  const startIdx = Math.max(0, totalRendered - height - scrollOffset);

  return (
    <Box
      flexDirection="column"
      height={height}
      width={width}
      overflow="hidden"
    >
      {rendered.slice(Math.max(0, rendered.length - (height + scrollOffset)), rendered.length - scrollOffset > 0 ? rendered.length - scrollOffset : undefined)}
    </Box>
  );
}

// ─── Simple Markdown Renderer ────────────────────────────────────────────────

interface MarkdownTextProps {
  text: string;
  theme: ThemeColors;
  width: number;
}

function MarkdownText({ text, theme, width }: MarkdownTextProps) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
        elements.push(
          <Box key={`cb-start-${i}`} marginTop={1}>
            <Text color={theme.muted}>
              {"┌─ " + (codeBlockLang || "code") + " "}
              {"─".repeat(Math.max(0, width - codeBlockLang.length - 5))}
            </Text>
          </Box>
        );
      } else {
        inCodeBlock = false;
        elements.push(
          <Box key={`cb-end-${i}`} marginBottom={1}>
            <Text color={theme.muted}>
              {"└" + "─".repeat(Math.max(0, width - 1))}
            </Text>
          </Box>
        );
      }
      continue;
    }

    if (inCodeBlock) {
      elements.push(
        <Box key={`code-${i}`} paddingLeft={1}>
          <Text color={theme.accent}>{line}</Text>
        </Box>
      );
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <Box key={`h3-${i}`} marginTop={1}>
          <Text bold color={theme.primary}>
            {line.slice(4)}
          </Text>
        </Box>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <Box key={`h2-${i}`} marginTop={1}>
          <Text bold color={theme.primary}>
            {line.slice(3)}
          </Text>
        </Box>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <Box key={`h1-${i}`} marginTop={1}>
          <Text bold color={theme.primary}>
            {line.slice(2)}
          </Text>
        </Box>
      );
      continue;
    }

    // Bullet points
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <Box key={`li-${i}`}>
          <Text color={theme.muted}>{"  * "}</Text>
          <Text color={theme.text} wrap="wrap">
            {formatInlineMarkdown(line.slice(2))}
          </Text>
        </Box>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s/);
    if (numMatch) {
      elements.push(
        <Box key={`ol-${i}`}>
          <Text color={theme.muted}>{`  ${numMatch[1]}. `}</Text>
          <Text color={theme.text} wrap="wrap">
            {formatInlineMarkdown(line.slice(numMatch[0].length))}
          </Text>
        </Box>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(
        <Box key={`empty-${i}`} height={1}>
          <Text>{" "}</Text>
        </Box>
      );
      continue;
    }

    // Regular text
    elements.push(
      <Box key={`text-${i}`}>
        <Text color={theme.text} wrap="wrap">
          {formatInlineMarkdown(line)}
        </Text>
      </Box>
    );
  }

  return <>{elements}</>;
}

function formatInlineMarkdown(text: string): string {
  // Strip bold/italic markers for terminal (Ink handles Text formatting)
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}
