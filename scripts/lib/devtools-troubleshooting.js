function getTroubleshootingItems() {
  return [
    {
      title: "云函数调用失败",
      summary: "通常是云环境、函数部署或依赖没有准备完整。",
      checks: [
        "先执行 `npm run doctor:cloudbase`，确认 cloudbase 模板和云函数目录都通过检查",
        "在微信开发者工具里确认当前选择的是正确的云环境",
        "打开云开发控制台，确认 5 个云函数都已部署成功"
      ],
      actions: [
        "重新部署报错的云函数",
        "若提示缺少依赖，先执行 `npm run install:cloudfunctions` 后再部署"
      ]
    },
    {
      title: "发现页或我的页加载失败",
      summary: "通常是 `getRecipes`、`getMyRecipes` 未部署，或集合权限不匹配。",
      checks: [
        "确认 `recipes` 集合已经创建",
        "确认 `cloudbase/permissions.json` 对应的权限已在控制台配置",
        "检查 `getRecipes` 和 `getMyRecipes` 是否部署到当前云环境"
      ],
      actions: [
        "重新部署列表相关云函数",
        "按 `cloudbase/indexes.json` 补齐索引后再重试"
      ]
    },
    {
      title: "上传图片后无法发布",
      summary: "通常是图片没有成功上传到云存储，或 `createRecipe` 云函数未部署。",
      checks: [
        "确认选择图片后 `photoUrl` 已成功回填",
        "确认云存储中已经出现对应图片文件",
        "检查 `createRecipe` 云函数是否已部署"
      ],
      actions: [
        "重新上传图片并重试发布",
        "若云函数报错，优先查看 `createRecipe` 的运行日志"
      ]
    },
    {
      title: "AI 识别始终没有结果",
      summary: "当前 MVP 允许 AI 缺省退化，所以最常见原因是环境变量没有配置。",
      checks: [
        "运行 `npm run doctor:cloudbase`，看是否提示缺少 AI 环境变量",
        "确认 `AI_RECOGNIZE_ENDPOINT` 和 `AI_RECOGNIZE_API_KEY` 已在云开发环境变量中配置",
        "确认 AI 服务地址本身可访问并能返回 JSON"
      ],
      actions: [
        "先用手动填写完成发布，避免阻塞录入流程",
        "补齐环境变量后重新部署 `recognizeRecipe` 云函数"
      ]
    },
    {
      title: "登录后仍然跳回登录页",
      summary: "通常是 `login` 云函数未正常写入用户档案，或本地登录态没有成功保存。",
      checks: [
        "检查 `login` 云函数是否部署成功",
        "确认 `users` 集合已创建，且能写入 `openId`、`nickname`、`createdAt`",
        "确认登录成功后页面是否回跳到原始目标页"
      ],
      actions: [
        "清理开发者工具缓存后重新登录",
        "查看 `login` 云函数日志，确认是否成功返回 user 数据"
      ]
    }
  ];
}

function buildTroubleshootingMarkdown() {
  const lines = [
    "# Devtools Troubleshooting",
    "",
    "这份清单聚焦微信开发者工具联调时最常见的阻塞点。每次排查前，建议先跑一次 `npm run doctor:cloudbase`。"
  ];

  getTroubleshootingItems().forEach((item, index) => {
    lines.push("");
    lines.push(`## ${index + 1}. ${item.title}`);
    lines.push("");
    lines.push(item.summary);
    lines.push("");
    lines.push("检查项：");
    lines.push(...item.checks.map((check) => `- ${check}`));
    lines.push("");
    lines.push("建议操作：");
    lines.push(...item.actions.map((action) => `- ${action}`));
  });

  lines.push("");
  return `${lines.join("\n")}\n`;
}

module.exports = {
  getTroubleshootingItems,
  buildTroubleshootingMarkdown
};
