import type { ToolDefinition } from "../types.js";
import { spawn } from "child_process";
import path from "path";

export const bashTool: ToolDefinition = {
  name: "bash",
  description:
    "Execute a bash/shell command and return the output. Use this for git commands, build commands, running tests, installing packages, and other terminal operations. On Windows, commands run in cmd/PowerShell.",
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The shell command to execute",
      },
      workdir: {
        type: "string",
        description: "Working directory for the command. Defaults to the current directory.",
      },
      timeout: {
        type: "number",
        description: "Timeout in milliseconds. Defaults to 120000 (2 minutes).",
      },
    },
    required: ["command"],
  },
  execute: async (args) => {
    const command = String(args.command);
    const workdir = args.workdir ? String(args.workdir) : process.cwd();
    const timeout = Number(args.timeout || 120000);

    return new Promise((resolve) => {
      const isWindows = process.platform === "win32";
      const shell = isWindows ? "cmd" : "/bin/bash";
      const shellArgs = isWindows ? ["/c", command] : ["-c", command];

      const child = spawn(shell, shellArgs, {
        cwd: path.resolve(workdir),
        timeout,
        env: { ...process.env },
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("error", (err) => {
        resolve(`Error: ${err.message}`);
      });

      child.on("close", (code) => {
        let output = "";
        if (stdout) output += stdout;
        if (stderr) output += (output ? "\n" : "") + stderr;
        if (code !== 0) {
          output += `\n\nProcess exited with code ${code}`;
        }
        resolve(output || "(no output)");
      });
    });
  },
};
