# Manual Smoke Test

## Before you start

先确认这三个步骤都已经完成：

1. 运行 `npm run generate:cloudbase`
2. 运行 `npm run doctor:cloudbase`
3. 在微信开发者工具中部署 5 个云函数

## Smoke test flow

### 1. 登录

- 打开小程序后进入登录页
- 输入昵称并完成登录
- 预期结果：
  - 成功进入发现页
  - `users` 集合新增一条当前用户记录

### 2. 浏览发现页

- 进入发现页
- 预期结果：
  - 页面能正常加载，不报错
  - 如果还没有菜谱，看到空态提示

### 3. 上传菜谱

- 进入上传页
- 上传一张菜品照片
- 点击 `AI识别菜名和食材`
- 预期结果：
  - 若已配置 AI 环境变量，页面出现识别建议
  - 若未配置 AI 环境变量，页面提示可手动填写且不影响发布
- 手动补齐菜名和食材后点击发布
- 预期结果：
  - 发布成功后跳回发现页
  - `recipes` 集合新增一条记录

### 4. 我的菜谱

- 进入我的页
- 预期结果：
  - 能看到当前登录用户上传的菜谱
  - 菜谱数量与 `recipes` 集合里当前用户的记录一致

## Suggested data checks

### `users`

确认最近一条记录包含：

- `openId`
- `nickname`
- `createdAt`

### `recipes`

确认最近一条记录包含：

- `ownerUserId`
- `name`
- `ingredientsText`
- `photoUrl`
- `aiNameSuggestion`
- `aiIngredientsSuggestion`
- `createdAt`
- `updatedAt`

## Common fallback checks

- 如果发现页加载失败，先检查 `getRecipes` 是否已部署到当前云环境
- 如果我的页加载失败，先检查当前账号是否已登录且 `getMyRecipes` 已部署
- 如果上传失败，先检查 `createRecipe` 是否已部署，并确认图片已成功上传到云存储
- 如果 AI 一直返回空建议，优先检查 `AI_RECOGNIZE_ENDPOINT` 和 `AI_RECOGNIZE_API_KEY`
