import React from "react";
import { Box, Text } from "ink";
import type { ProviderType, AgentMode, ThemeColors } from "../types.js";

interface StatusBarProps {
  provider: ProviderType;
  model: string;
  agentMode: AgentMode;
  messageCount: number;
  isProcessing: boolean;
  theme: ThemeColors;
  width: number;
}

export function StatusBar({
  provider,
  model,
  agentMode,
  messageCount,
  isProcessing,
  theme,
  width,
}: StatusBarProps) {
  const leftContent = ` ${provider}/${model}`;
  const rightContent = `${messageCount} msgs | ${agentMode} mode | ${isProcessing ? "busy" : "ready"} `;
  const padding = Math.max(0, width - leftContent.length - rightContent.length);

  return (
    <Box width={width} height={1}>
      <Text color={theme.secondary} bold>
        {leftContent}
      </Text>
      <Text>{" ".repeat(padding)}</Text>
      <Text color={theme.muted}>
        {rightContent}
      </Text>
    </Box>
  );
}
