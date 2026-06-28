const {
  getTroubleshootingItems,
  buildTroubleshootingMarkdown
} = require("../../scripts/lib/devtools-troubleshooting");

describe("devtools troubleshooting guide", () => {
  test("exports key mini program debugging scenarios", () => {
    const items = getTroubleshootingItems();

    expect(items.map((item) => item.title)).toEqual([
      "云函数调用失败",
      "发现页或我的页加载失败",
      "上传图片后无法发布",
      "AI 识别始终没有结果",
      "登录后仍然跳回登录页"
    ]);
  });

  test("each troubleshooting item includes checks and actions", () => {
    const items = getTroubleshootingItems();

    items.forEach((item) => {
      expect(item.summary).toBeTruthy();
      expect(Array.isArray(item.checks)).toBe(true);
      expect(item.checks.length).toBeGreaterThan(1);
      expect(Array.isArray(item.actions)).toBe(true);
      expect(item.actions.length).toBeGreaterThan(0);
    });
  });

  test("buildTroubleshootingMarkdown renders headings and checklist bullets", () => {
    const markdown = buildTroubleshootingMarkdown();

    expect(markdown).toContain("# Devtools Troubleshooting");
    expect(markdown).toContain("## 1. 云函数调用失败");
    expect(markdown).toContain("- 先执行 `npm run doctor:cloudbase`");
    expect(markdown).toContain("确认 8 个云函数都已部署成功");
    expect(markdown).toContain("检查 `getRecipeDetail`、`updateRecipe`、`deleteRecipe` 是否部署到当前云环境");
    expect(markdown).toContain("## 5. 登录后仍然跳回登录页");
  });
});
