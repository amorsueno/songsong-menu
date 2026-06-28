# Cloudbase Database Setup

## Quick Start

在项目根目录执行：

```bash
npm run generate:cloudbase
```

执行后会生成三份模板文件：

- `cloudbase/collections.json`
- `cloudbase/indexes.json`
- `cloudbase/permissions.json`

它们分别用于集合创建、索引创建和权限配置。

## Collections

Create these two collections in Tencent Cloudbase:

- `users`
- `recipes`

## Suggested `users` document shape

```json
{
  "openId": "wx-open-id",
  "nickname": "淞淞",
  "avatarUrl": "",
  "createdAt": "serverDate"
}
```

## Suggested `recipes` document shape

```json
{
  "ownerUserId": "wx-open-id",
  "name": "红烧鸡翅",
  "ingredientsText": "鸡翅、可乐、生姜",
  "photoUrl": "cloud://...",
  "aiNameSuggestion": "红烧鸡翅",
  "aiIngredientsSuggestion": "鸡翅、可乐、生姜",
  "category": "家常菜",
  "createdAt": "serverDate",
  "updatedAt": "serverDate"
}
```

## Recommended indexes

### `users`

- `openId` ascending, unique intent

### `recipes`

- `category` ascending + `createdAt` descending
- `ownerUserId` ascending + `createdAt` descending

## Permission recommendations

### `users`

- read: 仅创建者和云函数可读
- write: 仅云函数可写

说明：
- `login` 云函数负责创建用户档案
- 小程序前端不应直接写入 `users` 集合

### `recipes`

- read: 所有登录用户可读，云函数可读写
- write: 仅云函数可写

说明：
- 发现页需要让已登录用户浏览菜谱列表
- 上传页和我的菜谱都通过云函数访问 `recipes`
- 当前 Phase 1 不支持前端直写或公开匿名读取

## Suggested setup order

1. 运行 `npm run generate:cloudbase`
2. 运行 `npm run doctor:cloudbase`
3. 运行 `npm run generate:troubleshooting`
4. 创建 `users` 和 `recipes` 集合
5. 根据 `cloudbase/indexes.json` 配置索引
6. 根据 `cloudbase/permissions.json` 配置权限
7. 部署 `login`、`getRecipes`、`createRecipe`、`getMyRecipes`、`recognizeRecipe`
8. 用微信开发者工具真机调试登录、上传、浏览和我的菜谱流程
9. 如果出现异常，优先查看 `docs/cloudbase/devtools-troubleshooting.md`
