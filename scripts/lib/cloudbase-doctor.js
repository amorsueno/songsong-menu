const REQUIRED_CLOUDBASE_FILES = [
  "cloudbase/collections.json",
  "cloudbase/indexes.json",
  "cloudbase/permissions.json"
];

const REQUIRED_CLOUDFUNCTIONS = [
  "login",
  "getRecipes",
  "createRecipe",
  "getMyRecipes",
  "recognizeRecipe"
];

const REQUIRED_AI_ENV_VARS = [
  "AI_RECOGNIZE_ENDPOINT",
  "AI_RECOGNIZE_API_KEY"
];

function runDoctor({ hasPath, env }) {
  const checks = [];
  const errors = [];
  const warnings = [];

  REQUIRED_CLOUDBASE_FILES.forEach((filePath) => {
    const ok = hasPath(filePath);
    checks.push({ label: filePath, ok });
    if (!ok) {
      errors.push(`缺少 cloudbase 配置文件：${filePath}`);
    }
  });

  REQUIRED_CLOUDFUNCTIONS.forEach((functionName) => {
    const packagePath = `cloudfunctions/${functionName}/package.json`;
    const ok = hasPath(packagePath);
    checks.push({ label: packagePath, ok });
    if (!ok) {
      errors.push(`缺少云函数依赖清单：${packagePath}`);
    }
  });

  REQUIRED_AI_ENV_VARS.forEach((envKey) => {
    const ok = Boolean(env[envKey]);
    checks.push({ label: `env.${envKey}`, ok });
    if (!ok) {
      warnings.push(`未检测到 ${envKey}，AI 识别会退化为手动填写`);
    }
  });

  const nextSteps = [];

  if (checks.slice(0, REQUIRED_CLOUDBASE_FILES.length).some((item) => !item.ok)) {
    nextSteps.push("先运行 npm run generate:cloudbase 补齐 cloudbase 模板");
  }

  if (
    checks
      .slice(REQUIRED_CLOUDBASE_FILES.length, REQUIRED_CLOUDBASE_FILES.length + REQUIRED_CLOUDFUNCTIONS.length)
      .some((item) => !item.ok)
  ) {
    nextSteps.push("确认每个云函数目录都已安装依赖并可部署");
  }

  if (REQUIRED_AI_ENV_VARS.some((envKey) => !env[envKey])) {
    nextSteps.push("在微信云开发环境变量中配置 AI_RECOGNIZE_ENDPOINT 和 AI_RECOGNIZE_API_KEY");
  }

  if (errors.length === 0 && warnings.length === 0) {
    nextSteps.push("可进入微信开发者工具，按 cloudbase 模板创建集合、索引和权限");
    nextSteps.push("部署 5 个云函数后，执行登录、上传、发现页、我的菜谱四条主流程验收");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    checks,
    nextSteps
  };
}

module.exports = {
  REQUIRED_CLOUDBASE_FILES,
  REQUIRED_CLOUDFUNCTIONS,
  REQUIRED_AI_ENV_VARS,
  runDoctor
};
