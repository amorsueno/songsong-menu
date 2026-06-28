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

2. 用微信开发者工具打开项目根目录：

```text
/Users/yu/Documents/songsong-menu
```

3. 在微信开发者工具中开启云开发，并部署以下云函数目录：

- `cloudfunctions/login`
- `cloudfunctions/getRecipes`
- `cloudfunctions/createRecipe`
- `cloudfunctions/getMyRecipes`
- `cloudfunctions/recognizeRecipe`

每个云函数目录都已包含自己的 `package.json`。如果微信开发者工具提示安装依赖，进入对应目录执行依赖安装后再部署即可。

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

## AI 识别配置

`recognizeRecipe` 云函数会读取两个环境变量：

- `AI_RECOGNIZE_ENDPOINT`
- `AI_RECOGNIZE_API_KEY`

如果没有配置，AI 识别不会阻塞发布，只会返回空建议值。

## 测试

```bash
npm test
```
