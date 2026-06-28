#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { buildTroubleshootingMarkdown } = require("./lib/devtools-troubleshooting");

const rootDir = path.resolve(__dirname, "..");
const targetPath = path.join(rootDir, "docs/cloudbase/devtools-troubleshooting.md");

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, buildTroubleshootingMarkdown(), "utf8");
process.stdout.write("generated docs/cloudbase/devtools-troubleshooting.md\n");
