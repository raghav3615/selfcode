import type { ToolDefinition } from "../types.js";
import { glob as globFn } from "glob";
import fs from "fs";
import path from "path";

export const globTool: ToolDefinition = {
  name: "glob",
  description:
    "Search for files matching a glob pattern. Returns matching file paths. Use patterns like '**/*.ts' to find TypeScript files, 'src/**/*.js' to search in src directory, etc.",
  parameters: {
    type: "object",
    properties: {
      pattern: {
        type: "string",
        description: "Glob pattern to match files (e.g., '**/*.ts', 'src/**/*.{js,jsx}')",
      },
      cwd: {
        type: "string",
        description: "Directory to search in. Defaults to current directory.",
      },
    },
    required: ["pattern"],
  },
  execute: async (args) => {
    const pattern = String(args.pattern);
    const cwd = args.cwd ? String(args.cwd) : process.cwd();

    try {
      const matches = await globFn(pattern, {
        cwd: path.resolve(cwd),
        nodir: false,
        ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**"],
      });

      if (matches.length === 0) {
        return "No files found matching the pattern.";
      }

      return matches.join("\n");
    } catch (err) {
      return `Error: ${err instanceof Error ? err.message : String(err)}`;
    }
  },
};

export const grepTool: ToolDefinition = {
  name: "grep",
  description:
    "Search file contents for a regex pattern. Returns matching file paths and line numbers with the matching content.",
  parameters: {
    type: "object",
    properties: {
      pattern: {
        type: "string",
        description: "Regex pattern to search for in file contents",
      },
      path: {
        type: "string",
        description: "Directory to search in. Defaults to current directory.",
      },
      include: {
        type: "string",
        description: "File glob pattern to filter which files to search (e.g., '*.ts', '*.{js,jsx}')",
      },
    },
    required: ["pattern"],
  },
  execute: async (args) => {
    const pattern = String(args.pattern);
    const searchPath = args.path ? String(args.path) : process.cwd();
    const include = args.include ? String(args.include) : "**/*";

    try {
      const regex = new RegExp(pattern, "i");
      const resolvedPath = path.resolve(searchPath);

      // Find files matching include pattern
      const files = await globFn(include, {
        cwd: resolvedPath,
        nodir: true,
        ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**"],
      });

      const results: string[] = [];
      const maxResults = 50;

      for (const file of files) {
        if (results.length >= maxResults) break;

        const fullPath = path.join(resolvedPath, file);
        try {
          const stat = fs.statSync(fullPath);
          // Skip large files and binary files
          if (stat.size > 1024 * 1024) continue;

          const content = fs.readFileSync(fullPath, "utf-8");
          const lines = content.split("\n");

          for (let i = 0; i < lines.length; i++) {
            if (regex.test(lines[i])) {
              results.push(`${file}:${i + 1}: ${lines[i].trim()}`);
              if (results.length >= maxResults) break;
            }
          }
        } catch {
          // Skip files that can't be read
        }
      }

      if (results.length === 0) {
        return "No matches found.";
      }

      return results.join("\n");
    } catch (err) {
      return `Error: ${err instanceof Error ? err.message : String(err)}`;
    }
  },
};
