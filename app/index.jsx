#!/usr/bin/env node

import React from "react";
import { render } from "ink";
import App from "./src/App.jsx";

// Clear terminal and position cursor at top
process.stdout.write("\x1B[2J\x1B[0f");

// Enable raw mode for better input handling
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

// Handle terminal resize events
process.stdout.on("resize", () => {
  process.stdout.write("\x1B[2J\x1B[0f");
});

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

render(<App />);
