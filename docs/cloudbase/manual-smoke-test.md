# Manual Smoke Test

## Before you start

先确认这三个步骤都已经完成：

1. 运行 `npm run generate:cloudbase`
2. 运行 `npm run doctor:cloudbase`
3. 在微信开发者工具中部署 8 个云函数

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
  - 若 `AI_RECOGNIZE_PROVIDER=generic`，自定义识别服务会收到 `{ photoUrl }`
  - 若 `AI_RECOGNIZE_PROVIDER=openai_responses`，兼容 Responses API 的服务会收到图片识别请求
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

### 5. 编辑与删除菜谱

- 从我的页进入任意一条自己上传的菜谱详情
- 点击 `编辑菜谱`，修改菜名或食材后保存
- 预期结果：
  - 成功回到菜谱详情页
  - 详情页展示更新后的内容
- 再点击 `删除菜谱`
- 预期结果：
  - 确认后返回我的页
  - `recipes` 集合中对应记录已被删除

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
- 如果编辑或删除失败，先检查 `getRecipeDetail`、`updateRecipe`、`deleteRecipe` 是否已部署到当前云环境
- 如果 AI 一直返回空建议，优先检查 `AI_RECOGNIZE_ENDPOINT` 和 `AI_RECOGNIZE_API_KEY`
