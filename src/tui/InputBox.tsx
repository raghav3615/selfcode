import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { ThemeColors } from "../types.js";

interface InputBoxProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
  theme: ThemeColors;
  width: number;
}

export function InputBox({ onSubmit, isProcessing, theme, width }: InputBoxProps) {
  const [input, setInput] = useState("");
  const [cursorPos, setCursorPos] = useState(0);

  useInput((ch, key) => {
    if (isProcessing) return;

    // Submit on Enter
    if (key.return) {
      if (input.trim()) {
        onSubmit(input);
        setInput("");
        setCursorPos(0);
      }
      return;
    }

    // Backspace
    if (key.backspace || key.delete) {
      if (cursorPos > 0) {
        setInput((prev) => prev.slice(0, cursorPos - 1) + prev.slice(cursorPos));
        setCursorPos((p) => p - 1);
      }
      return;
    }

    // Arrow keys
    if (key.leftArrow) {
      setCursorPos((p) => Math.max(0, p - 1));
      return;
    }
    if (key.rightArrow) {
      setCursorPos((p) => Math.min(input.length, p + 1));
      return;
    }

    // Ctrl+A - beginning of line
    if (key.ctrl && ch === "a") {
      setCursorPos(0);
      return;
    }

    // Ctrl+E - end of line
    if (key.ctrl && ch === "e") {
      setCursorPos(input.length);
      return;
    }

    // Ctrl+K - kill to end of line
    if (key.ctrl && ch === "k") {
      setInput((prev) => prev.slice(0, cursorPos));
      return;
    }

    // Ctrl+U - kill to beginning of line
    if (key.ctrl && ch === "u") {
      setInput((prev) => prev.slice(cursorPos));
      setCursorPos(0);
      return;
    }

    // Ctrl+W - delete word backward
    if (key.ctrl && ch === "w") {
      const before = input.slice(0, cursorPos);
      const after = input.slice(cursorPos);
      const trimmed = before.trimEnd();
      const lastSpace = trimmed.lastIndexOf(" ");
      const newBefore = lastSpace >= 0 ? before.slice(0, lastSpace + 1) : "";
      setInput(newBefore + after);
      setCursorPos(newBefore.length);
      return;
    }

    // Ignore other control sequences
    if (key.ctrl || key.meta) return;
    if (key.escape) return;
    if (key.tab) return;
    if (key.upArrow || key.downArrow) return;

    // Regular character input
    if (ch) {
      setInput((prev) => prev.slice(0, cursorPos) + ch + prev.slice(cursorPos));
      setCursorPos((p) => p + ch.length);
    }
  });

  // Render input with cursor
  const displayWidth = width - 4; // padding
  const beforeCursor = input.slice(0, cursorPos);
  const atCursor = input[cursorPos] || " ";
  const afterCursor = input.slice(cursorPos + 1);

  return (
    <Box flexDirection="column" height={3} width={width} paddingX={1}>
      <Box>
        <Text color={isProcessing ? theme.muted : theme.success} bold>
          {isProcessing ? "... " : "> "}
        </Text>
        {isProcessing ? (
          <Text color={theme.muted} dimColor>
            Processing...
          </Text>
        ) : (
          <Box>
            <Text color={theme.text}>{beforeCursor}</Text>
            <Text backgroundColor={theme.primary} color="#000000">
              {atCursor}
            </Text>
            <Text color={theme.text}>{afterCursor}</Text>
          </Box>
        )}
      </Box>
      <Box>
        <Text color={theme.muted} dimColor>
          {isProcessing
            ? "Esc to interrupt"
            : "Enter to send | /help for commands | Ctrl+X for shortcuts"}
        </Text>
      </Box>
    </Box>
  );
}
