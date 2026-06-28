#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  runDoctor
} = require("./lib/cloudbase-doctor");

const rootDir = path.resolve(__dirname, "..");

function hasPath(relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath));
}

const report = runDoctor({
  hasPath,
  env: process.env
});

process.stdout.write(`cloudbase doctor: ${report.ok ? "OK" : "ERROR"}\n`);

report.checks.forEach((check) => {
  process.stdout.write(`${check.ok ? "PASS" : "FAIL"} ${check.label}\n`);
});

report.warnings.forEach((warning) => {
  process.stdout.write(`WARN ${warning}\n`);
});

report.errors.forEach((error) => {
  process.stdout.write(`ERROR ${error}\n`);
});

if (report.nextSteps.length > 0) {
  process.stdout.write("next steps:\n");
  report.nextSteps.forEach((step, index) => {
    process.stdout.write(`${index + 1}. ${step}\n`);
  });
}

process.exitCode = report.ok ? 0 : 1;
