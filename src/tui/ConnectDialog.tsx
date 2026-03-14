import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { ProviderType, ThemeColors } from "../types.js";
import { getAllProviders } from "../providers/registry.js";
import { listConnectedProviderIds } from "../config.js";

interface ConnectDialogProps {
  onConnect: (provider: ProviderType, apiKey: string, baseUrl?: string) => void;
  onClose: () => void;
  theme: ThemeColors;
  width: number;
}

type ConnectStep = "select-provider" | "enter-key" | "enter-url" | "confirm";

export function ConnectDialog({
  onConnect,
  onClose,
  theme,
  width,
}: ConnectDialogProps) {
  const providers = getAllProviders();
  const connected = listConnectedProviderIds();
  const [step, setStep] = useState<ConnectStep>("select-provider");
  const [selectedProvider, setSelectedProvider] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const visibleCount = 12;

  const chosenProvider = providers[selectedProvider];

  useInput((ch, key) => {
    if (key.escape) {
      if (step === "select-provider") {
        onClose();
      } else {
        setStep("select-provider");
        setApiKey("");
        setBaseUrl("");
        setCursorPos(0);
      }
      return;
    }

    // ─── Step: Select Provider ─────────────────────────────────────────
    if (step === "select-provider") {
      if (key.return) {
        if (chosenProvider.requiresApiKey) {
          setStep("enter-key");
          setCursorPos(0);
        } else {
          // No API key needed (Ollama, LM Studio)
          setStep("enter-url");
          setBaseUrl(chosenProvider.defaultBaseUrl || "");
          setCursorPos((chosenProvider.defaultBaseUrl || "").length);
        }
        return;
      }
      if (key.upArrow) {
        setSelectedProvider((i) => {
          const next = i > 0 ? i - 1 : providers.length - 1;
          if (next < scrollTop) setScrollTop(next);
          if (next >= scrollTop + visibleCount) setScrollTop(next - visibleCount + 1);
          return next;
        });
      }
      if (key.downArrow) {
        setSelectedProvider((i) => {
          const next = i < providers.length - 1 ? i + 1 : 0;
          if (next >= scrollTop + visibleCount) setScrollTop(next - visibleCount + 1);
          if (next < scrollTop) setScrollTop(next);
          return next;
        });
      }
      return;
    }

    // ─── Step: Enter API Key ───────────────────────────────────────────
    if (step === "enter-key") {
      if (key.return) {
        if (apiKey.trim()) {
          if (chosenProvider.defaultBaseUrl) {
            setStep("enter-url");
            setBaseUrl(chosenProvider.defaultBaseUrl);
            setCursorPos(chosenProvider.defaultBaseUrl.length);
          } else {
            onConnect(chosenProvider.id, apiKey.trim(), undefined);
          }
        }
        return;
      }
      if (key.backspace || key.delete) {
        if (cursorPos > 0) {
          setApiKey((prev) => prev.slice(0, cursorPos - 1) + prev.slice(cursorPos));
          setCursorPos((p) => p - 1);
        }
        return;
      }
      if (key.leftArrow) {
        setCursorPos((p) => Math.max(0, p - 1));
        return;
      }
      if (key.rightArrow) {
        setCursorPos((p) => Math.min(apiKey.length, p + 1));
        return;
      }
      if (ch && !key.ctrl && !key.meta) {
        setApiKey((prev) => prev.slice(0, cursorPos) + ch + prev.slice(cursorPos));
        setCursorPos((p) => p + ch.length);
      }
      return;
    }

    // ─── Step: Enter Base URL ──────────────────────────────────────────
    if (step === "enter-url") {
      if (key.return) {
        onConnect(
          chosenProvider.id,
          apiKey.trim() || "not-needed",
          baseUrl.trim() || chosenProvider.defaultBaseUrl
        );
        return;
      }
      if (key.backspace || key.delete) {
        if (cursorPos > 0) {
          setBaseUrl((prev) => prev.slice(0, cursorPos - 1) + prev.slice(cursorPos));
          setCursorPos((p) => p - 1);
        }
        return;
      }
      if (key.leftArrow) {
        setCursorPos((p) => Math.max(0, p - 1));
        return;
      }
      if (key.rightArrow) {
        setCursorPos((p) => Math.min(baseUrl.length, p + 1));
        return;
      }
      if (ch && !key.ctrl && !key.meta) {
        setBaseUrl((prev) => prev.slice(0, cursorPos) + ch + prev.slice(cursorPos));
        setCursorPos((p) => p + ch.length);
      }
      return;
    }
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  if (step === "select-provider") {
    const visibleProviders = providers.slice(scrollTop, scrollTop + visibleCount);
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={theme.accent}
        paddingX={2}
        paddingY={1}
        width={width}
      >
        <Text bold color={theme.accent}>
          Connect a Provider
        </Text>
        <Text color={theme.muted}>
          Select a provider to connect. Arrow keys + Enter.
        </Text>
        <Box marginTop={1} flexDirection="column">
          {scrollTop > 0 && (
            <Text color={theme.muted}>  ... {scrollTop} more above</Text>
          )}
          {visibleProviders.map((p, i) => {
            const realIdx = scrollTop + i;
            const isSelected = realIdx === selectedProvider;
            const isConnected = connected.includes(p.id);
            return (
              <Box key={p.id} flexDirection="row">
                <Text color={isSelected ? theme.accent : theme.text}>
                  {isSelected ? "> " : "  "}
                </Text>
                <Text
                  bold={isSelected}
                  color={isConnected ? theme.success : theme.text}
                >
                  {p.name}
                </Text>
                <Text color={theme.muted} dimColor>
                  {" - " + p.description}
                </Text>
                {isConnected && (
                  <Text color={theme.success}> [connected]</Text>
                )}
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
          <Text color={theme.muted}>Esc to cancel</Text>
        </Box>
      </Box>
    );
  }

  if (step === "enter-key") {
    const masked = apiKey ? "*".repeat(Math.max(0, apiKey.length - 4)) + apiKey.slice(-4) : "";
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={theme.accent}
        paddingX={2}
        paddingY={1}
        width={width}
      >
        <Text bold color={theme.accent}>
          Connect {chosenProvider.name}
        </Text>
        <Text color={theme.muted}>
          {chosenProvider.website}
        </Text>
        <Box marginTop={1} flexDirection="column">
          <Text color={theme.text}>
            Enter your API key
            {chosenProvider.apiKeyEnvVar && (
              <Text color={theme.muted}> (or set {chosenProvider.apiKeyEnvVar})</Text>
            )}
          </Text>
          <Box marginTop={1}>
            <Text color={theme.primary}>Key: </Text>
            <Text color={theme.text}>{masked || "(type your key)"}</Text>
          </Box>
        </Box>
        <Box marginTop={1}>
          <Text color={theme.muted}>Enter to continue, Esc to go back</Text>
        </Box>
      </Box>
    );
  }

  if (step === "enter-url") {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={theme.accent}
        paddingX={2}
        paddingY={1}
        width={width}
      >
        <Text bold color={theme.accent}>
          Connect {chosenProvider.name} - Base URL
        </Text>
        <Box marginTop={1} flexDirection="column">
          <Text color={theme.text}>
            Base URL (press Enter to use default):
          </Text>
          <Box marginTop={1}>
            <Text color={theme.primary}>URL: </Text>
            <Text color={theme.text}>{baseUrl || "(default)"}</Text>
          </Box>
        </Box>
        <Box marginTop={1}>
          <Text color={theme.muted}>Enter to connect, Esc to go back</Text>
        </Box>
      </Box>
    );
  }

  return null;
}
