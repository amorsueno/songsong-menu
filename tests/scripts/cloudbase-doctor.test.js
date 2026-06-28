const {
  REQUIRED_CLOUDBASE_FILES,
  REQUIRED_CLOUDFUNCTIONS,
  REQUIRED_AI_ENV_VARS,
  runDoctor
} = require("../../scripts/lib/cloudbase-doctor");

describe("cloudbase doctor", () => {
  test("exports required setup inputs", () => {
    expect(REQUIRED_CLOUDBASE_FILES).toEqual([
      "cloudbase/collections.json",
      "cloudbase/indexes.json",
      "cloudbase/permissions.json"
    ]);
    expect(REQUIRED_CLOUDFUNCTIONS).toEqual([
      "login",
      "getRecipes",
      "createRecipe",
      "getMyRecipes",
      "recognizeRecipe",
      "getRecipeDetail",
      "updateRecipe",
      "deleteRecipe"
    ]);
    expect(REQUIRED_AI_ENV_VARS).toEqual([
      "AI_RECOGNIZE_ENDPOINT",
      "AI_RECOGNIZE_API_KEY"
    ]);
  });

  test("reports missing cloudbase files and cloudfunctions as errors", () => {
    expect(
      runDoctor({
        hasPath: (pathName) => pathName !== "cloudbase/indexes.json" && pathName !== "cloudfunctions/getMyRecipes/package.json",
        env: {}
      })
    ).toEqual({
      ok: false,
      errors: [
        "缺少 cloudbase 配置文件：cloudbase/indexes.json",
        "缺少云函数依赖清单：cloudfunctions/getMyRecipes/package.json"
      ],
      warnings: [
        "未检测到 AI_RECOGNIZE_ENDPOINT，AI 识别会退化为手动填写",
        "未检测到 AI_RECOGNIZE_API_KEY，AI 识别会退化为手动填写"
      ],
      checks: [
        { label: "cloudbase/collections.json", ok: true },
        { label: "cloudbase/indexes.json", ok: false },
        { label: "cloudbase/permissions.json", ok: true },
        { label: "cloudfunctions/login/package.json", ok: true },
        { label: "cloudfunctions/getRecipes/package.json", ok: true },
        { label: "cloudfunctions/createRecipe/package.json", ok: true },
        { label: "cloudfunctions/getMyRecipes/package.json", ok: false },
        { label: "cloudfunctions/recognizeRecipe/package.json", ok: true },
        { label: "cloudfunctions/getRecipeDetail/package.json", ok: true },
        { label: "cloudfunctions/updateRecipe/package.json", ok: true },
        { label: "cloudfunctions/deleteRecipe/package.json", ok: true },
        { label: "env.AI_RECOGNIZE_ENDPOINT", ok: false },
        { label: "env.AI_RECOGNIZE_API_KEY", ok: false }
      ],
      nextSteps: [
        "先运行 npm run generate:cloudbase 补齐 cloudbase 模板",
        "确认每个云函数目录都已安装依赖并可部署",
        "在微信云开发环境变量中配置 AI_RECOGNIZE_ENDPOINT 和 AI_RECOGNIZE_API_KEY"
      ]
    });
  });

  test("returns ok when files and env vars are ready", () => {
    const report = runDoctor({
      hasPath: () => true,
      env: {
        AI_RECOGNIZE_ENDPOINT: "https://example.com/recognize",
        AI_RECOGNIZE_API_KEY: "secret"
      }
    });

    expect(report.ok).toBe(true);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
    expect(report.nextSteps).toEqual([
      "可进入微信开发者工具，按 cloudbase 模板创建集合、索引和权限",
      "部署 8 个云函数后，执行登录、上传、发现页、我的菜谱、详情编辑删除五条主流程验收"
    ]);
  });
});
