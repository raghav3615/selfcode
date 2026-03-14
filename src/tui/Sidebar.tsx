import React from "react";
import { Box, Text } from "ink";
import type { Session, ThemeColors } from "../types.js";

interface SidebarProps {
  sessions: Session[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  theme: ThemeColors;
  width: number;
  height: number;
}

export function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  theme,
  width,
  height,
}: SidebarProps) {
  return (
    <Box flexDirection="column" width={width} height={height} paddingX={1}>
      <Box marginBottom={1}>
        <Text bold color={theme.primary}>
          Sessions
        </Text>
      </Box>

      {sessions.length === 0 ? (
        <Box flexDirection="column">
          <Text color={theme.muted} dimColor>
            No saved sessions
          </Text>
          <Text color={theme.muted} dimColor>
            Start chatting to
          </Text>
          <Text color={theme.muted} dimColor>
            create one
          </Text>
        </Box>
      ) : (
        sessions.map((session) => (
          <Box key={session.id} marginBottom={0}>
            <Text
              color={
                session.id === currentSessionId
                  ? theme.accent
                  : theme.text
              }
              bold={session.id === currentSessionId}
            >
              {session.id === currentSessionId ? "> " : "  "}
              {truncate(session.name || session.id, width - 4)}
            </Text>
          </Box>
        ))
      )}

      <Box marginTop={1} flexDirection="column">
        <Text color={theme.border}>
          {"─".repeat(width - 2)}
        </Text>
        <Text color={theme.muted} dimColor>
          Ctrl+X L: sessions
        </Text>
        <Text color={theme.muted} dimColor>
          Ctrl+X N: new
        </Text>
        <Text color={theme.muted} dimColor>
          Ctrl+X B: toggle
        </Text>
      </Box>
    </Box>
  );
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "~";
}
