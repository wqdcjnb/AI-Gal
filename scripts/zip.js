#!/usr/bin/env node
/**
 * Minimal zip utility for CloudBase CLI compatibility on Windows.
 * Usage: node zip.js <output.zip> <file1> [file2...]
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node zip.js <output.zip> <file1> [file2...]");
  process.exit(1);
}

const output = args[0];
const files = args.slice(1);

// Use PowerShell Compress-Archive to create zip
const psCmd = `Compress-Archive -Path ${files.map(f => `'${f}'`).join(",")} -DestinationPath '${output}' -Force`;
try {
  execSync(`powershell -Command "${psCmd}"`, { stdio: "inherit" });
} catch (e) {
  process.exit(1);
}
