import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { ProviderType, ThemeColors } from "../types.js";
import { getAllProviders } from "../providers/registry.js";
import { listConnectedProviderIds } from "../config.js";

interface ProviderSelectorProps {
  currentProvider: ProviderType;
  onSelect: (provider: ProviderType) => void;
  onClose: () => void;
  theme: ThemeColors;
  width: number;
}

export function ProviderSelector({
  currentProvider,
  onSelect,
  onClose,
  theme,
  width,
}: ProviderSelectorProps) {
  const providers = getAllProviders();
  const connected = listConnectedProviderIds();
  const [selectedIndex, setSelectedIndex] = useState(
    Math.max(
      0,
      providers.findIndex((p) => p.id === currentProvider)
    )
  );
  const [scrollTop, setScrollTop] = useState(0);
  const visibleCount = 14;

  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }
    if (key.return) {
      onSelect(providers[selectedIndex].id);
      return;
    }
    if (key.upArrow) {
      setSelectedIndex((i) => {
        const next = i > 0 ? i - 1 : providers.length - 1;
        if (next < scrollTop) setScrollTop(next);
        if (next >= scrollTop + visibleCount) setScrollTop(next - visibleCount + 1);
        return next;
      });
    }
    if (key.downArrow) {
      setSelectedIndex((i) => {
        const next = i < providers.length - 1 ? i + 1 : 0;
        if (next >= scrollTop + visibleCount) setScrollTop(next - visibleCount + 1);
        if (next < scrollTop) setScrollTop(next);
        return next;
      });
    }
  });

  const visibleProviders = providers.slice(scrollTop, scrollTop + visibleCount);

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
        Switch Provider
      </Text>
      <Text color={theme.muted}>
        Arrow keys to navigate, Enter to select, Esc to close
      </Text>
      <Box marginTop={1} flexDirection="column">
        {scrollTop > 0 && (
          <Text color={theme.muted}>  ... {scrollTop} more above</Text>
        )}
        {visibleProviders.map((p, i) => {
          const realIdx = scrollTop + i;
          const isSelected = realIdx === selectedIndex;
          const isCurrent = p.id === currentProvider;
          const isConnected = connected.includes(p.id);

          return (
            <Box key={p.id} flexDirection="row">
              <Text color={isSelected ? theme.accent : theme.text}>
                {isSelected ? "> " : "  "}
              </Text>
              <Text
                bold={isSelected}
                color={
                  isCurrent
                    ? theme.success
                    : isConnected
                    ? theme.primary
                    : theme.text
                }
              >
                {p.name}
              </Text>
              <Text color={theme.muted} dimColor>
                {" - " + p.description}
              </Text>
              {isConnected && (
                <Text color={theme.success}> [connected]</Text>
              )}
              {isCurrent && <Text color={theme.accent}> (active)</Text>}
            </Box>
          );
        })}
        {scrollTop + visibleCount < providers.length && (
          <Text color={theme.muted}>
            {"  "}... {providers.length - scrollTop - visibleCount} more below
          </Text>
        )}
      </Box>
      <Box marginTop={1}>
        <Text color={theme.muted} dimColor>
          Use /connect to add API keys for new providers
        </Text>
      </Box>
    </Box>
  );
}
