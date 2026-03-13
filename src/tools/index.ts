import type { ToolDefinition } from "../types.js";
import { readFileTool, writeFileTool, editFileTool, listDirectoryTool } from "./files.js";
import { bashTool } from "./bash.js";
import { globTool, grepTool } from "./search.js";

export function getAllTools(): ToolDefinition[] {
  return [
    readFileTool,
    writeFileTool,
    editFileTool,
    listDirectoryTool,
    bashTool,
    globTool,
    grepTool,
  ];
}

export { readFileTool, writeFileTool, editFileTool, listDirectoryTool, bashTool, globTool, grepTool };
