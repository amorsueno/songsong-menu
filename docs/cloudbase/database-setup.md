# Cloudbase Database Setup

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
