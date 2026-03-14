import React, { useState, useCallback } from "react";
import { Box, Text, useApp, useInput, useStdout } from "ink";
import type {
  Message,
  ProviderType,
  DialogType,
  AgentMode,
  ThemeName,
  ThemeColors,
  StreamChunk,
  Session,
} from "../types.js";
import { getThemeColors } from "./themes.js";
import { ChatPanel } from "./ChatPanel.js";
import { InputBox } from "./InputBox.js";
import { StatusBar } from "./StatusBar.js";
import { Sidebar } from "./Sidebar.js";
import { ProviderSelector } from "./ProviderSelector.js";
import { ModelSelector } from "./ModelSelector.js";
import { HelpDialog } from "./HelpDialog.js";
import { ConnectDialog } from "./ConnectDialog.js";
import { Conversation } from "../conversation.js";
import { createProvider } from "../providers/index.js";
import { getAllTools } from "../tools/index.js";
import { getConfig, setConfig, saveConnectedProvider, getTheme, setTheme } from "../config.js";
import { getProviderInfo } from "../providers/registry.js";
import type { AppConfig } from "../types.js";

interface AppProps {
  initialConfig: AppConfig;
}

export function App({ initialConfig }: AppProps) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const termWidth = stdout?.columns || 120;
  const termHeight = stdout?.rows || 40;

  // ─── State ──────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [currentProvider, setCurrentProvider] = useState<ProviderType>(initialConfig.provider);
  const [currentModel, setCurrentModel] = useState(initialConfig.model);
  const [dialog, setDialog] = useState<DialogType>("none");
  const [agentMode, setAgentMode] = useState<AgentMode>("build");
  const [showSidebar, setShowSidebar] = useState(false);
  const [themeName, setThemeName] = useState<ThemeName>(getTheme());
  const [toolStatus, setToolStatus] = useState<string>("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(
    `session-${Date.now()}`
  );
  const [scrollOffset, setScrollOffset] = useState(0);
  const [inputFocused, setInputFocused] = useState(true);

  const theme = getThemeColors(themeName);

  // ─── Provider + Conversation ────────────────────────────────────────────────
  const [config, setAppConfig] = useState<AppConfig>(initialConfig);
  const [conversation, setConversation] = useState<Conversation>(() => {
    const provider = createProvider(initialConfig);
    const tools = getAllTools();
    return new Conversation(provider, tools);
  });

  const recreateConversation = useCallback(
    (newConfig: AppConfig) => {
      const provider = createProvider(newConfig);
      const tools = getAllTools();
      const conv = new Conversation(provider, tools);
      setConversation(conv);
      setAppConfig(newConfig);
    },
    []
  );

  // ─── Handle Sending Message ────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing) return;

      // Slash commands
      if (text.trim().startsWith("/")) {
        const cmd = text.trim().split(/\s+/)[0].toLowerCase();
        switch (cmd) {
          case "/help":
          case "/h":
            setDialog("help");
            return;
          case "/connect":
            setDialog("provider-connect");
            return;
          case "/models":
          case "/model":
            setDialog("model-select");
            return;
          case "/provider":
            setDialog("provider-select");
            return;
          case "/clear":
          case "/new":
            setMessages([]);
            conversation.clear();
            setStreamingText("");
            setCurrentSessionId(`session-${Date.now()}`);
            return;
          case "/exit":
          case "/quit":
          case "/q":
            exit();
            return;
          case "/themes":
          case "/theme":
            setDialog("themes");
            return;
          case "/sessions":
            setDialog("sessions");
            return;
          case "/compact":
            setMessages([]);
            conversation.clear();
            return;
          default:
            // Unknown command - show as error message
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant" as const,
                content: `Unknown command: ${cmd}. Type /help for available commands.`,
                timestamp: Date.now(),
              },
            ]);
            return;
        }
      }

      // Add user message
      const userMsg: Message = {
        role: "user",
        content: text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsProcessing(true);
      setStreamingText("");
      setToolStatus("");
      setScrollOffset(0);

      try {
        let accumulated = "";
        await conversation.run(
          text,
          (chunk: StreamChunk) => {
            if (chunk.type === "text" && chunk.content) {
              accumulated += chunk.content;
              setStreamingText(accumulated);
            }
          },
          (name: string, _args: Record<string, unknown>) => {
            setToolStatus(`Running ${name}...`);
          },
          (name: string, _result: string, isError: boolean) => {
            setToolStatus(
              isError ? `${name} failed` : `${name} done`
            );
          }
        );

        // Add assistant response
        const assistantMsg: Message = {
          role: "assistant",
          content: accumulated,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setStreamingText("");
      } catch (err) {
        const errorMsg: Message = {
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : String(err)}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        setStreamingText("");
      }

      setIsProcessing(false);
      setToolStatus("");
    },
    [isProcessing, conversation, exit]
  );

  // ─── Keybindings (leader key: Ctrl+X) ─────────────────────────────────────
  const [leaderPressed, setLeaderPressed] = useState(false);

  useInput(
    (input, key) => {
      // Escape closes any dialog
      if (key.escape) {
        if (dialog !== "none") {
          setDialog("none");
          return;
        }
        if (isProcessing) {
          // TODO: cancel processing
          return;
        }
      }

      // Don't handle other keys if a dialog is open
      if (dialog !== "none") return;

      // Ctrl+X = leader key
      if (key.ctrl && input === "x") {
        setLeaderPressed(true);
        setTimeout(() => setLeaderPressed(false), 2000);
        return;
      }

      if (leaderPressed) {
        setLeaderPressed(false);
        switch (input) {
          case "h":
            setDialog("help");
            break;
          case "m":
            setDialog("model-select");
            break;
          case "b":
            setShowSidebar((s) => !s);
            break;
          case "n":
            setMessages([]);
            conversation.clear();
            setCurrentSessionId(`session-${Date.now()}`);
            break;
          case "q":
            exit();
            break;
          case "t":
            setDialog("themes");
            break;
          case "l":
            setDialog("sessions");
            break;
        }
        return;
      }

      // Tab to cycle agent mode
      if (key.tab && !key.shift) {
        setAgentMode((m) => (m === "build" ? "plan" : "build"));
        return;
      }

      // Page up/down for scrolling
      if (key.pageUp) {
        setScrollOffset((s) => Math.min(s + 10, messages.length));
        return;
      }
      if (key.pageDown) {
        setScrollOffset((s) => Math.max(s - 10, 0));
        return;
      }
    },
    { isActive: true }
  );

  // ─── Provider/Model change handlers ────────────────────────────────────────
  const handleProviderChange = useCallback(
    (provider: ProviderType) => {
      const newConfig = getConfig();
      newConfig.provider = provider;
      const providerInfo = getProviderInfo(provider);
      if (providerInfo && providerInfo.models.length > 0) {
        newConfig.model = providerInfo.models[0].id;
      }
      setCurrentProvider(provider);
      setCurrentModel(newConfig.model);
      setConfig("provider", provider);
      setConfig("model", newConfig.model);
      recreateConversation(newConfig);
      setDialog("none");
    },
    [recreateConversation]
  );

  const handleModelChange = useCallback(
    (model: string) => {
      const newConfig = { ...config, model };
      setCurrentModel(model);
      setConfig("model", model);
      recreateConversation(newConfig);
      setDialog("none");
    },
    [config, recreateConversation]
  );

  const handleConnect = useCallback(
    (provider: ProviderType, apiKey: string, baseUrl?: string) => {
      saveConnectedProvider(provider, apiKey, baseUrl);
      const providerInfo = getProviderInfo(provider);
      const model = providerInfo?.models[0]?.id || "default";
      const newConfig: AppConfig = {
        provider,
        apiKey,
        model,
        baseUrl: baseUrl || providerInfo?.defaultBaseUrl,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
      };
      setCurrentProvider(provider);
      setCurrentModel(model);
      setConfig("provider", provider);
      setConfig("model", model);
      recreateConversation(newConfig);
      setDialog("none");
    },
    [config.maxTokens, config.temperature, recreateConversation]
  );

  const handleThemeChange = useCallback((name: ThemeName) => {
    setThemeName(name);
    setTheme(name);
    setDialog("none");
  }, []);

  // ─── Layout ─────────────────────────────────────────────────────────────────

  const sidebarWidth = showSidebar ? 28 : 0;
  const mainWidth = termWidth - sidebarWidth - (showSidebar ? 1 : 0);
  const chatHeight = termHeight - 6; // status bar (2) + input (3) + border (1)

  return (
    <Box flexDirection="column" width={termWidth} height={termHeight}>
      {/* ─── Header Bar ──────────────────────────────────────────────────── */}
      <Box
        width={termWidth}
        height={1}
        justifyContent="space-between"
        paddingLeft={1}
        paddingRight={1}
      >
        <Text bold color={theme.primary}>
          selfcode
        </Text>
        <Box>
          <Text color={theme.muted}>
            {leaderPressed ? "[LEADER] " : ""}
          </Text>
          <Text color={theme.accent}>
            {agentMode}
          </Text>
          <Text color={theme.muted}> | </Text>
          <Text color={theme.secondary}>
            {currentProvider}
          </Text>
          <Text color={theme.muted}>/</Text>
          <Text color={theme.text}>
            {currentModel}
          </Text>
        </Box>
      </Box>

      {/* ─── Border ──────────────────────────────────────────────────────── */}
      <Box width={termWidth}>
        <Text color={theme.border}>
          {"─".repeat(termWidth)}
        </Text>
      </Box>

      {/* ─── Main Area ───────────────────────────────────────────────────── */}
      <Box flexDirection="row" height={chatHeight}>
        {/* Sidebar */}
        {showSidebar && (
          <Box flexDirection="column" width={sidebarWidth}>
            <Sidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelectSession={(id) => {
                setCurrentSessionId(id);
                setDialog("none");
              }}
              theme={theme}
              width={sidebarWidth}
              height={chatHeight}
            />
          </Box>
        )}

        {/* Separator */}
        {showSidebar && (
          <Box flexDirection="column" width={1}>
            {Array.from({ length: chatHeight }).map((_, i) => (
              <Text key={i} color={theme.border}>
                {"│"}
              </Text>
            ))}
          </Box>
        )}

        {/* Chat Area */}
        <Box flexDirection="column" width={mainWidth}>
          <ChatPanel
            messages={messages}
            streamingText={streamingText}
            isProcessing={isProcessing}
            toolStatus={toolStatus}
            theme={theme}
            width={mainWidth}
            height={chatHeight - 4}
            scrollOffset={scrollOffset}
          />

          {/* ─── Border ─────────────────────────────────────────────── */}
          <Box width={mainWidth}>
            <Text color={theme.border}>
              {"─".repeat(mainWidth)}
            </Text>
          </Box>

          {/* ─── Input ──────────────────────────────────────────────── */}
          <InputBox
            onSubmit={handleSendMessage}
            isProcessing={isProcessing}
            theme={theme}
            width={mainWidth}
          />
        </Box>
      </Box>

      {/* ─── Status Bar ──────────────────────────────────────────────────── */}
      <Box width={termWidth}>
        <Text color={theme.border}>
          {"─".repeat(termWidth)}
        </Text>
      </Box>
      <StatusBar
        provider={currentProvider}
        model={currentModel}
        agentMode={agentMode}
        messageCount={messages.length}
        isProcessing={isProcessing}
        theme={theme}
        width={termWidth}
      />

      {/* ─── Dialogs (overlaid) ──────────────────────────────────────────── */}
      {dialog === "help" && (
        <HelpDialog
          onClose={() => setDialog("none")}
          theme={theme}
          width={Math.min(70, termWidth - 4)}
        />
      )}
      {dialog === "provider-select" && (
        <ProviderSelector
          currentProvider={currentProvider}
          onSelect={handleProviderChange}
          onClose={() => setDialog("none")}
          theme={theme}
          width={Math.min(60, termWidth - 4)}
        />
      )}
      {dialog === "model-select" && (
        <ModelSelector
          currentProvider={currentProvider}
          currentModel={currentModel}
          onSelect={handleModelChange}
          onClose={() => setDialog("none")}
          theme={theme}
          width={Math.min(60, termWidth - 4)}
        />
      )}
      {dialog === "provider-connect" && (
        <ConnectDialog
          onConnect={handleConnect}
          onClose={() => setDialog("none")}
          theme={theme}
          width={Math.min(65, termWidth - 4)}
        />
      )}
      {dialog === "themes" && (
        <ThemeSelector
          currentTheme={themeName}
          onSelect={handleThemeChange}
          onClose={() => setDialog("none")}
          theme={theme}
          width={Math.min(45, termWidth - 4)}
        />
      )}
    </Box>
  );
}

// ─── Theme Selector (inline component) ────────────────────────────────────────

interface ThemeSelectorProps {
  currentTheme: ThemeName;
  onSelect: (theme: ThemeName) => void;
  onClose: () => void;
  theme: ThemeColors;
  width: number;
}

function ThemeSelector({
  currentTheme,
  onSelect,
  onClose,
  theme,
  width,
}: ThemeSelectorProps) {
  const themes: ThemeName[] = ["dark", "light", "monokai", "dracula", "nord", "solarized"];
  const [selectedIndex, setSelectedIndex] = useState(
    themes.indexOf(currentTheme)
  );

  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }
    if (key.return) {
      onSelect(themes[selectedIndex]);
      return;
    }
    if (key.upArrow) {
      setSelectedIndex((i) => (i > 0 ? i - 1 : themes.length - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((i) => (i < themes.length - 1 ? i + 1 : 0));
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
        Select Theme
      </Text>
      <Text color={theme.muted}>Use arrow keys, Enter to select, Esc to close</Text>
      <Box marginTop={1} flexDirection="column">
        {themes.map((t, i) => (
          <Box key={t}>
            <Text color={i === selectedIndex ? theme.accent : theme.text}>
              {i === selectedIndex ? "> " : "  "}
              {t}
              {t === currentTheme ? " (current)" : ""}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
