import type { Message, ToolDefinition, ToolResult, StreamChunk } from "./types.js";
import type { LLMProvider } from "./providers/base.js";
import { getSystemPrompt } from "./config.js";

export class Conversation {
  private messages: Message[] = [];
  private provider: LLMProvider;
  private tools: ToolDefinition[];
  private systemPrompt: string;

  constructor(provider: LLMProvider, tools: ToolDefinition[]) {
    this.provider = provider;
    this.tools = tools;
    this.systemPrompt = getSystemPrompt();
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  addUserMessage(content: string): void {
    this.messages.push({ role: "user", content });
  }

  async run(
    userMessage: string,
    onChunk: (chunk: StreamChunk) => void,
    onToolStart?: (name: string, args: Record<string, unknown>) => void,
    onToolEnd?: (name: string, result: string, isError: boolean) => void
  ): Promise<string> {
    this.addUserMessage(userMessage);

    let finalContent = "";
    let iterations = 0;
    const maxIterations = 25; // prevent infinite tool loops

    while (iterations < maxIterations) {
      iterations++;

      const assistantMessage = await this.provider.chat(
        this.messages,
        this.tools,
        this.systemPrompt,
        onChunk
      );

      this.messages.push(assistantMessage);
      finalContent = assistantMessage.content;

      // If no tool calls, we're done
      if (!assistantMessage.toolCalls || assistantMessage.toolCalls.length === 0) {
        break;
      }

      // Execute tool calls
      for (const toolCall of assistantMessage.toolCalls) {
        const tool = this.tools.find((t) => t.name === toolCall.function.name);
        let result: string;
        let isError = false;

        if (!tool) {
          result = `Error: Unknown tool "${toolCall.function.name}"`;
          isError = true;
        } else {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            if (onToolStart) onToolStart(toolCall.function.name, args);
            result = await tool.execute(args);
          } catch (err) {
            result = `Error executing tool: ${err instanceof Error ? err.message : String(err)}`;
            isError = true;
          }
        }

        if (onToolEnd) onToolEnd(toolCall.function.name, result, isError);

        // Add tool result to messages
        this.messages.push({
          role: "tool",
          content: result,
          toolCallId: toolCall.id,
          name: toolCall.function.name,
        });
      }
    }

    return finalContent;
  }
}
