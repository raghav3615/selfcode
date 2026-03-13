import type { ToolDefinition } from "../types.js";
import fs from "fs";
import path from "path";

export const readFileTool: ToolDefinition = {
  name: "read_file",
  description:
    "Read the contents of a file at the given path. Returns the file content with line numbers. Use this to examine existing code or files.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The absolute or relative path to the file to read",
      },
      offset: {
        type: "number",
        description: "Line number to start reading from (1-indexed). Defaults to 1.",
      },
      limit: {
        type: "number",
        description: "Maximum number of lines to read. Defaults to 2000.",
      },
    },
    required: ["path"],
  },
  execute: async (args) => {
    const filePath = String(args.path);
    const offset = Number(args.offset || 1);
    const limit = Number(args.limit || 2000);

    try {
      const resolvedPath = path.resolve(filePath);
      const stat = fs.statSync(resolvedPath);

      if (stat.isDirectory()) {
        const entries = fs.readdirSync(resolvedPath);
        return entries
          .map((e) => {
            const fullPath = path.join(resolvedPath, e);
            const isDir = fs.statSync(fullPath).isDirectory();
            return isDir ? `${e}/` : e;
          })
          .join("\n");
      }

      const content = fs.readFileSync(resolvedPath, "utf-8");
      const lines = content.split("\n");
      const startLine = Math.max(0, offset - 1);
      const endLine = Math.min(lines.length, startLine + limit);
      const slice = lines.slice(startLine, endLine);

      return slice.map((line, i) => `${startLine + i + 1}: ${line}`).join("\n");
    } catch (err) {
      return `Error: ${err instanceof Error ? err.message : String(err)}`;
    }
  },
};

export const writeFileTool: ToolDefinition = {
  name: "write_file",
  description:
    "Write content to a file. Creates the file if it doesn't exist, or overwrites it. Creates parent directories if needed.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The path to the file to write",
      },
      content: {
        type: "string",
        description: "The content to write to the file",
      },
    },
    required: ["path", "content"],
  },
  execute: async (args) => {
    const filePath = String(args.path);
    const content = String(args.content);

    try {
      const resolvedPath = path.resolve(filePath);
      const dir = path.dirname(resolvedPath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(resolvedPath, content, "utf-8");
      return `Successfully wrote ${content.split("\n").length} lines to ${resolvedPath}`;
    } catch (err) {
      return `Error: ${err instanceof Error ? err.message : String(err)}`;
    }
  },
};

export const editFileTool: ToolDefinition = {
  name: "edit_file",
  description:
    "Replace a specific string in a file with a new string. The oldString must match exactly (including whitespace and indentation).",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The path to the file to edit",
      },
      old_string: {
        type: "string",
        description: "The exact string to find and replace",
      },
      new_string: {
        type: "string",
        description: "The string to replace it with",
      },
    },
    required: ["path", "old_string", "new_string"],
  },
  execute: async (args) => {
    const filePath = String(args.path);
    const oldString = String(args.old_string);
    const newString = String(args.new_string);

    try {
      const resolvedPath = path.resolve(filePath);
      const content = fs.readFileSync(resolvedPath, "utf-8");

      const count = content.split(oldString).length - 1;
      if (count === 0) {
        return `Error: oldString not found in file ${resolvedPath}`;
      }
      if (count > 1) {
        return `Error: Found ${count} matches for oldString. Please provide more context to identify a unique match.`;
      }

      const newContent = content.replace(oldString, newString);
      fs.writeFileSync(resolvedPath, newContent, "utf-8");

      return `Successfully edited ${resolvedPath}`;
    } catch (err) {
      return `Error: ${err instanceof Error ? err.message : String(err)}`;
    }
  },
};

export const listDirectoryTool: ToolDefinition = {
  name: "list_directory",
  description: "List files and directories at the given path. Directories have a trailing /.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The directory path to list. Defaults to current directory.",
      },
    },
    required: [],
  },
  execute: async (args) => {
    const dirPath = String(args.path || ".");

    try {
      const resolvedPath = path.resolve(dirPath);
      const entries = fs.readdirSync(resolvedPath);

      return entries
        .map((e) => {
          try {
            const fullPath = path.join(resolvedPath, e);
            const isDir = fs.statSync(fullPath).isDirectory();
            return isDir ? `${e}/` : e;
          } catch {
            return e;
          }
        })
        .join("\n");
    } catch (err) {
      return `Error: ${err instanceof Error ? err.message : String(err)}`;
    }
  },
};
