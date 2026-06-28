#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { buildCloudbaseFiles } = require("./lib/cloudbase-config");

const rootDir = path.resolve(__dirname, "..");
const files = buildCloudbaseFiles();

Object.entries(files).forEach(([relativePath, contents]) => {
  const absolutePath = path.join(rootDir, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, contents, "utf8");
  process.stdout.write(`generated ${relativePath}\n`);
});
