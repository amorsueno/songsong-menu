# songsong-menu

淞淞菜谱微信小程序 Phase 1 原型，当前包含：

- 微信登录与首次建档
- 菜谱列表浏览
- 菜谱上传
- AI 辅助识别菜名和食材
- 我的菜谱

## 本地开发

1. 安装依赖

```bash
npm install
```

如果要一次性安装所有云函数依赖，可以执行：

```bash
npm run install:cloudfunctions
```

2. 生成云开发集合、索引和权限模板：

```bash
npm run generate:cloudbase
```

这会生成：

- `cloudbase/collections.json`
- `cloudbase/indexes.json`
- `cloudbase/permissions.json`

3. 运行云开发自检：

```bash
npm run doctor:cloudbase
```

这个命令会检查：

- `cloudbase` 模板文件是否齐全
- 5 个云函数目录是否都带有 `package.json`
- AI 环境变量是否已经准备好

4. 用微信开发者工具打开项目根目录：

```text
/Users/yu/Documents/GitHub/songsong-menu
```

5. 在微信开发者工具中开启云开发，并部署以下云函数目录：

- `cloudfunctions/login`
- `cloudfunctions/getRecipes`
- `cloudfunctions/createRecipe`
- `cloudfunctions/getMyRecipes`
- `cloudfunctions/recognizeRecipe`

每个云函数目录都已包含自己的 `package.json`。如果微信开发者工具提示安装依赖，进入对应目录执行依赖安装后再部署即可。

6. 在云开发控制台中创建集合、索引并配置权限：

- 按 `cloudbase/collections.json` 创建集合和字段约定
- 按 `cloudbase/indexes.json` 创建索引
- 按 `cloudbase/permissions.json` 配置集合权限

环境变量示例见：

- `.env.example`

## 云开发集合

需要准备两个集合：

- `users`
- `recipes`

### users 建议字段

- `openId`
- `nickname`
- `avatarUrl`
- `createdAt`

### recipes 建议字段

- `ownerUserId`
- `name`
- `ingredientsText`
- `photoUrl`
- `aiNameSuggestion`
- `aiIngredientsSuggestion`
- `category`
- `createdAt`
- `updatedAt`

更完整的数据库初始化说明见：

- `docs/cloudbase/database-setup.md`
- `docs/cloudbase/manual-smoke-test.md`

## AI 识别配置

`recognizeRecipe` 云函数会读取两个环境变量：

- `AI_RECOGNIZE_ENDPOINT`
- `AI_RECOGNIZE_API_KEY`

如果没有配置，AI 识别不会阻塞发布，只会返回空建议值。

## 测试

```bash
npm test
```
