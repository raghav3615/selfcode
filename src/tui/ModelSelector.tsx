import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { ProviderType, ThemeColors } from "../types.js";
import { getProviderModels } from "../providers/registry.js";

interface ModelSelectorProps {
  currentProvider: ProviderType;
  currentModel: string;
  onSelect: (model: string) => void;
  onClose: () => void;
  theme: ThemeColors;
  width: number;
}

export function ModelSelector({
  currentProvider,
  currentModel,
  onSelect,
  onClose,
  theme,
  width,
}: ModelSelectorProps) {
  const models = getProviderModels(currentProvider);
  const [selectedIndex, setSelectedIndex] = useState(
    Math.max(
      0,
      models.findIndex((m) => m.id === currentModel)
    )
  );

  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }
    if (key.return) {
      if (models[selectedIndex]) {
        onSelect(models[selectedIndex].id);
      }
      return;
    }
    if (key.upArrow) {
      setSelectedIndex((i) => (i > 0 ? i - 1 : models.length - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((i) => (i < models.length - 1 ? i + 1 : 0));
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
        Select Model ({currentProvider})
      </Text>
      <Text color={theme.muted}>
        Arrow keys to navigate, Enter to select, Esc to close
      </Text>
      <Box marginTop={1} flexDirection="column">
        {models.length === 0 ? (
          <Text color={theme.muted}>No models available for this provider</Text>
        ) : (
          models.map((m, i) => {
            const isSelected = i === selectedIndex;
            const isCurrent = m.id === currentModel;
            return (
              <Box key={m.id} flexDirection="row">
                <Text color={isSelected ? theme.accent : theme.text}>
                  {isSelected ? "> " : "  "}
                </Text>
                <Text
                  bold={isSelected}
                  color={isCurrent ? theme.success : theme.text}
                >
                  {m.name}
                </Text>
                <Text color={theme.muted} dimColor>
                  {" "}({m.id})
                </Text>
                {m.contextLength && (
                  <Text color={theme.muted} dimColor>
                    {" "}{formatNumber(m.contextLength)} ctx
                  </Text>
                )}
                {isCurrent && <Text color={theme.accent}> (current)</Text>}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}
