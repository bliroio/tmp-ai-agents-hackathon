#!/usr/bin/env node

import React from "react";
import { render } from "ink";
import App from "./src/App.jsx";

// Clear terminal and position cursor at top
process.stdout.write("\x1B[2J\x1B[0f");

// Handle process exit
process.on("exit", () => {
  process.stdout.write("\x1B[2J\x1B[0f");
});

process.on("SIGINT", () => {
  process.stdout.write("\x1B[2J\x1B[0f");
  process.exit(0);
});

process.on("SIGTERM", () => {
  process.stdout.write("\x1B[2J\x1B[0f");
  process.exit(0);
});

// Check if raw mode is supported
if (process.stdin.isTTY && process.stdin.setRawMode) {
  render(<App />);
} else {
  console.log("This application requires a TTY environment to run properly.");
  process.exit(1);
}
