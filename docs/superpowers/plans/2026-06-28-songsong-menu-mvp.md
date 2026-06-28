# Songsong Menu Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 1 WeChat Mini Program MVP: login/onboarding, shared recipe browsing, recipe upload, and AI-assisted recognition for dish name and ingredients.

**Architecture:** Use a native WeChat Mini Program frontend and WeChat Cloud Development backend. Keep auth, recipe, upload, and AI suggestion logic in separate services so Phase 1 stays focused on recipe-library behavior.

**Tech Stack:** Native WeChat Mini Program, JavaScript, WeChat Cloud Development (`wx.cloud`), AI vision API adapter through cloud function, Jest, `miniprogram-simulate`

---

## Scope Boundary

This implementation plan is only for **Phase 1**.

Included:

- login and onboarding
- recipe list browsing
- recipe upload
- AI suggestion for dish name and ingredients
- personal recipe view

Explicitly excluded from this plan:

- collaborative dish requests
- request boards
- request status workflow
- invite scopes
- `我点过的菜`

Those belong to a separate Phase 2 spec and plan.

---

## File Structure

### App shell

- Create: `package.json`
- Create: `project.config.json`
- Create: `app.js`
- Create: `app.json`
- Create: `app.wxss`
- Create: `sitemap.json`

### Pages

- Create: `pages/login/login.js`
- Create: `pages/login/login.json`
- Create: `pages/login/login.wxml`
- Create: `pages/login/login.wxss`
- Create: `pages/discover/discover.js`
- Create: `pages/discover/discover.json`
- Create: `pages/discover/discover.wxml`
- Create: `pages/discover/discover.wxss`
- Create: `pages/upload/upload.js`
- Create: `pages/upload/upload.json`
- Create: `pages/upload/upload.wxml`
- Create: `pages/upload/upload.wxss`
- Create: `pages/my/my.js`
- Create: `pages/my/my.json`
- Create: `pages/my/my.wxml`
- Create: `pages/my/my.wxss`

### Services and shared utilities

- Create: `services/auth.js`
- Create: `services/recipe.js`
- Create: `services/upload.js`
- Create: `services/ai.js`
- Create: `utils/validators.js`
- Create: `utils/formatters.js`
- Create: `utils/constants.js`

### Cloud functions

- Create: `cloudfunctions/login/index.js`
- Create: `cloudfunctions/getRecipes/index.js`
- Create: `cloudfunctions/createRecipe/index.js`
- Create: `cloudfunctions/getMyRecipes/index.js`
- Create: `cloudfunctions/recognizeRecipe/index.js`

### Tests

- Create: `jest.config.cjs`
- Create: `tests/utils/validators.test.js`
- Create: `tests/services/recipe.test.js`
- Create: `tests/services/ai.test.js`
- Create: `tests/pages/upload-page.test.js`

---

### Task 1: Scaffold the mini program shell

**Files:**
- Create: `package.json`
- Create: `project.config.json`
- Create: `app.js`
- Create: `app.json`
- Create: `app.wxss`
- Create: `sitemap.json`
- Create: `jest.config.cjs`

- [ ] **Step 1: Write the failing setup check**

```json
{
  "name": "songsong-menu",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "test": "jest --runInBand"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "miniprogram-simulate": "^1.6.1"
  }
}
```

Run:

```bash
npm test
```

Expected: FAIL with a Jest configuration error because config and tests do not exist yet.

- [ ] **Step 2: Add app shell files**

```js
// app.js
App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({ traceUser: true });
    }
  },
  globalData: {
    user: null,
    categories: ["全部", "家常菜", "汤羹", "快手菜", "轻食"]
  }
});
```

```json
// app.json
{
  "pages": [
    "pages/login/login",
    "pages/discover/discover",
    "pages/upload/upload",
    "pages/my/my"
  ],
  "window": {
    "navigationBarTitleText": "Songsong Menu",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#ffffff",
    "backgroundTextStyle": "light"
  },
  "tabBar": {
    "color": "#666666",
    "selectedColor": "#111111",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      { "pagePath": "pages/discover/discover", "text": "发现" },
      { "pagePath": "pages/upload/upload", "text": "上传" },
      { "pagePath": "pages/my/my", "text": "我的" }
    ]
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

```css
/* app.wxss */
page {
  background: #ffffff;
  color: #111111;
  font-family: "PingFang SC", "Helvetica Neue", Arial, sans-serif;
}

.page-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff7fb 0%, #ffffff 220rpx);
}

.panel {
  background: #ffffff;
  border: 1rpx solid #f2dfe8;
  border-radius: 32rpx;
  box-shadow: 0 12rpx 40rpx rgba(235, 192, 210, 0.14);
}

.primary-button {
  background: #111111;
  color: #ffffff;
  border-radius: 24rpx;
}

.secondary-button {
  background: #fff4f8;
  color: #111111;
  border: 1rpx solid #f2dce6;
  border-radius: 24rpx;
}
```

```js
// jest.config.cjs
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["services/**/*.js", "utils/**/*.js"]
};
```

- [ ] **Step 3: Run test command again**

Run:

```bash
npm test
```

Expected: FAIL with "No tests found".

- [ ] **Step 4: Commit**

```bash
git add package.json project.config.json app.js app.json app.wxss sitemap.json jest.config.cjs
git commit -m "chore: scaffold mini program shell"
```

### Task 2: Implement login and onboarding

**Files:**
- Create: `utils/validators.js`
- Create: `services/auth.js`
- Create: `pages/login/login.js`
- Create: `pages/login/login.json`
- Create: `pages/login/login.wxml`
- Create: `pages/login/login.wxss`
- Create: `cloudfunctions/login/index.js`
- Test: `tests/utils/validators.test.js`

- [ ] **Step 1: Write failing validator tests**

```js
// tests/utils/validators.test.js
const { validateNickname, validateRecipePayload } = require("../../utils/validators");

describe("validators", () => {
  test("validateNickname rejects blank nickname", () => {
    expect(validateNickname("   ")).toEqual({
      ok: false,
      message: "请输入昵称"
    });
  });

  test("validateRecipePayload rejects empty recipe fields", () => {
    expect(
      validateRecipePayload({
        name: "",
        ingredients: "",
        photoUrl: ""
      })
    ).toEqual({
      ok: false,
      message: "请上传菜品照片"
    });
  });
});
```

Run:

```bash
npm test -- --runTestsByPath tests/utils/validators.test.js
```

Expected: FAIL with "Cannot find module '../../utils/validators'".

- [ ] **Step 2: Implement validators, auth service, and login cloud function**

```js
// utils/validators.js
function validateNickname(value) {
  if (!value || !value.trim()) {
    return { ok: false, message: "请输入昵称" };
  }
  return { ok: true };
}

function validateRecipePayload(payload) {
  if (!payload.photoUrl) return { ok: false, message: "请上传菜品照片" };
  if (!payload.name || !payload.name.trim()) return { ok: false, message: "请输入菜名" };
  if (!payload.ingredients || !payload.ingredients.trim()) {
    return { ok: false, message: "请输入食材" };
  }
  return { ok: true };
}

module.exports = {
  validateNickname,
  validateRecipePayload
};
```

```js
// services/auth.js
async function loginWithWechat(nickname) {
  return wx.cloud.callFunction({
    name: "login",
    data: { nickname }
  });
}

function saveUser(app, user) {
  app.globalData.user = user;
}

module.exports = {
  loginWithWechat,
  saveUser
};
```

```js
// cloudfunctions/login/index.js
const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const nickname = (event.nickname || "").trim();
  const users = db.collection("users");
  const existing = await users.where({ openId: OPENID }).limit(1).get();

  if (existing.data.length > 0) {
    return { user: existing.data[0], isNew: false };
  }

  const record = {
    openId: OPENID,
    nickname,
    avatarUrl: "",
    createdAt: db.serverDate()
  };

  const { _id } = await users.add({ data: record });
  return { user: { ...record, _id }, isNew: true };
};
```

- [ ] **Step 3: Build the login page**

```js
// pages/login/login.js
const { loginWithWechat, saveUser } = require("../../services/auth");
const { validateNickname } = require("../../utils/validators");

Page({
  data: {
    nickname: "",
    loading: false,
    errorMessage: ""
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value, errorMessage: "" });
  },

  async onLoginTap() {
    const check = validateNickname(this.data.nickname);
    if (!check.ok) {
      this.setData({ errorMessage: check.message });
      return;
    }

    this.setData({ loading: true });
    try {
      const app = getApp();
      const result = await loginWithWechat(this.data.nickname);
      saveUser(app, result.result.user);
      wx.switchTab({ url: "/pages/discover/discover" });
    } catch (error) {
      this.setData({ errorMessage: "登录失败，请稍后再试" });
    } finally {
      this.setData({ loading: false });
    }
  }
});
```

```xml
<!-- pages/login/login.wxml -->
<view class="page-shell login-page">
  <view class="panel login-panel">
    <view class="eyebrow">SONGSONG MENU</view>
    <view class="title">把家常菜谱收进来</view>
    <view class="hero">品牌菜谱视觉区</view>
    <input class="input" placeholder="昵称（首次登录填写）" bindinput="onNicknameInput" />
    <view wx:if="{{errorMessage}}" class="error">{{errorMessage}}</view>
    <button class="primary-button login-button" loading="{{loading}}" bindtap="onLoginTap">
      微信一键登录
    </button>
  </view>
</view>
```

- [ ] **Step 4: Run validator tests**

Run:

```bash
npm test -- --runTestsByPath tests/utils/validators.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add utils/validators.js services/auth.js pages/login/login.* cloudfunctions/login/index.js tests/utils/validators.test.js
git commit -m "feat: add login onboarding flow"
```

### Task 3: Implement shared recipe list

**Files:**
- Create: `utils/constants.js`
- Create: `services/recipe.js`
- Create: `pages/discover/discover.js`
- Create: `pages/discover/discover.json`
- Create: `pages/discover/discover.wxml`
- Create: `pages/discover/discover.wxss`
- Create: `cloudfunctions/getRecipes/index.js`
- Test: `tests/services/recipe.test.js`

- [ ] **Step 1: Write failing recipe service tests**

```js
// tests/services/recipe.test.js
global.wx = {
  cloud: {
    callFunction: jest.fn()
  }
};

const { fetchRecipes, mapRecipeCard } = require("../../services/recipe");

describe("recipe service", () => {
  test("fetchRecipes requests cloud function with category", async () => {
    wx.cloud.callFunction.mockResolvedValueOnce({ result: { items: [] } });
    await fetchRecipes("家常菜");
    expect(wx.cloud.callFunction).toHaveBeenCalledWith({
      name: "getRecipes",
      data: { category: "家常菜" }
    });
  });

  test("mapRecipeCard returns summary fields", () => {
    expect(
      mapRecipeCard({
        _id: "r1",
        name: "番茄牛腩",
        ingredientsText: "牛腩、番茄、洋葱",
        photoUrl: "cloud://demo/image.jpg"
      })
    ).toEqual({
      id: "r1",
      title: "番茄牛腩",
      summary: "牛腩、番茄、洋葱",
      photoUrl: "cloud://demo/image.jpg"
    });
  });
});
```

Run:

```bash
npm test -- --runTestsByPath tests/services/recipe.test.js
```

Expected: FAIL with "Cannot find module '../../services/recipe'".

- [ ] **Step 2: Implement recipe service, constants, and cloud function**

```js
// utils/constants.js
const RECIPE_CATEGORIES = ["全部", "家常菜", "汤羹", "快手菜", "轻食"];

module.exports = {
  RECIPE_CATEGORIES
};
```

```js
// services/recipe.js
function fetchRecipes(category) {
  return wx.cloud.callFunction({
    name: "getRecipes",
    data: { category }
  });
}

function fetchMyRecipes() {
  return wx.cloud.callFunction({
    name: "getMyRecipes",
    data: {}
  });
}

function mapRecipeCard(item) {
  return {
    id: item._id,
    title: item.name,
    summary: item.ingredientsText,
    photoUrl: item.photoUrl
  };
}

module.exports = {
  fetchRecipes,
  fetchMyRecipes,
  mapRecipeCard
};
```

```js
// cloudfunctions/getRecipes/index.js
const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const category = event.category || "全部";
  const collection = db.collection("recipes");
  const query = category === "全部" ? collection : collection.where({ category });
  const { data } = await query.orderBy("createdAt", "desc").limit(20).get();
  return { items: data };
};
```

- [ ] **Step 3: Build the discover page**

```js
// pages/discover/discover.js
const { RECIPE_CATEGORIES } = require("../../utils/constants");
const { fetchRecipes, mapRecipeCard } = require("../../services/recipe");

Page({
  data: {
    categories: RECIPE_CATEGORIES,
    activeCategory: "全部",
    recipes: [],
    loading: false
  },

  onLoad() {
    this.loadRecipes();
  },

  async loadRecipes() {
    this.setData({ loading: true });
    try {
      const result = await fetchRecipes(this.data.activeCategory);
      this.setData({
        recipes: result.result.items.map(mapRecipeCard)
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async onCategoryTap(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.category });
    await this.loadRecipes();
  }
});
```

```xml
<!-- pages/discover/discover.wxml -->
<view class="page-shell discover-page">
  <view class="discover-header panel">
    <view class="eyebrow">SONGSONG MENU</view>
    <view class="title">今天想做哪一道菜</view>
    <view class="hero">推荐菜谱大图区域</view>
  </view>

  <scroll-view class="category-scroll" scroll-x="true">
    <view class="category-row">
      <view
        wx:for="{{categories}}"
        wx:key="*this"
        class="category-chip {{activeCategory === item ? 'category-chip--active' : ''}}"
        data-category="{{item}}"
        bindtap="onCategoryTap"
      >
        {{item}}
      </view>
    </view>
  </scroll-view>

  <view class="recipe-list">
    <view wx:for="{{recipes}}" wx:key="id" class="panel recipe-card">
      <image class="recipe-image" src="{{item.photoUrl}}" mode="aspectFill" />
      <view class="recipe-title">{{item.title}}</view>
      <view class="recipe-summary">{{item.summary}}</view>
    </view>
  </view>
</view>
```

- [ ] **Step 4: Run recipe service tests**

Run:

```bash
npm test -- --runTestsByPath tests/services/recipe.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add utils/constants.js services/recipe.js pages/discover/discover.* cloudfunctions/getRecipes/index.js tests/services/recipe.test.js
git commit -m "feat: add shared recipe list"
```

### Task 4: Implement AI-assisted recipe upload

**Files:**
- Create: `utils/formatters.js`
- Create: `services/upload.js`
- Create: `services/ai.js`
- Create: `pages/upload/upload.js`
- Create: `pages/upload/upload.json`
- Create: `pages/upload/upload.wxml`
- Create: `pages/upload/upload.wxss`
- Create: `cloudfunctions/createRecipe/index.js`
- Create: `cloudfunctions/recognizeRecipe/index.js`
- Test: `tests/services/ai.test.js`
- Test: `tests/pages/upload-page.test.js`

- [ ] **Step 1: Write failing AI and upload page tests**

```js
// tests/services/ai.test.js
global.wx = {
  cloud: {
    callFunction: jest.fn()
  }
};

const { mapRecognitionResult } = require("../../services/ai");

describe("ai recognition mapping", () => {
  test("empty recognition result becomes editable empty suggestions", () => {
    expect(mapRecognitionResult({})).toEqual({
      name: "",
      ingredients: "",
      isPartial: true
    });
  });

  test("complete recognition result returns suggestions", () => {
    expect(
      mapRecognitionResult({
        name: "红烧鸡翅",
        ingredients: "鸡翅、可乐、生姜"
      })
    ).toEqual({
      name: "红烧鸡翅",
      ingredients: "鸡翅、可乐、生姜",
      isPartial: false
    });
  });
});
```

```js
// tests/pages/upload-page.test.js
const simulate = require("miniprogram-simulate");

describe("upload page", () => {
  test("page starts with empty recipe form", () => {
    const id = simulate.load("/Users/yu/Documents/songsong-menu/pages/upload/upload");
    const page = simulate.render(id);
    expect(page.instance.data.form).toEqual({
      name: "",
      ingredients: "",
      photoUrl: ""
    });
  });

  test("page starts with empty ai suggestion state", () => {
    const id = simulate.load("/Users/yu/Documents/songsong-menu/pages/upload/upload");
    const page = simulate.render(id);
    expect(page.instance.data.aiSuggestion).toEqual({
      name: "",
      ingredients: "",
      isPartial: false
    });
  });
});
```

Run:

```bash
npm test -- --runTestsByPath tests/services/ai.test.js tests/pages/upload-page.test.js
```

Expected: FAIL because the AI service and upload page do not exist yet.

- [ ] **Step 2: Implement formatters, upload service, AI service, and cloud functions**

```js
// utils/formatters.js
function normalizeIngredients(value) {
  return value
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join("、");
}

module.exports = {
  normalizeIngredients
};
```

```js
// services/upload.js
const { normalizeIngredients } = require("../utils/formatters");

async function chooseRecipeImage() {
  const result = await wx.chooseMedia({
    count: 1,
    mediaType: ["image"],
    sourceType: ["album", "camera"]
  });
  return result.tempFiles[0].tempFilePath;
}

async function uploadRecipeImage(filePath) {
  const cloudPath = `recipes/${Date.now()}.jpg`;
  const result = await wx.cloud.uploadFile({
    cloudPath,
    filePath
  });
  return result.fileID;
}

function buildRecipePayload(form) {
  return {
    name: form.name.trim(),
    ingredients: normalizeIngredients(form.ingredients),
    photoUrl: form.photoUrl
  };
}

module.exports = {
  chooseRecipeImage,
  uploadRecipeImage,
  buildRecipePayload
};
```

```js
// services/ai.js
async function recognizeRecipeFromImage(photoUrl) {
  return wx.cloud.callFunction({
    name: "recognizeRecipe",
    data: { photoUrl }
  });
}

function mapRecognitionResult(result) {
  const name = result.name || "";
  const ingredients = result.ingredients || "";
  return {
    name,
    ingredients,
    isPartial: !name || !ingredients
  };
}

module.exports = {
  recognizeRecipeFromImage,
  mapRecognitionResult
};
```

```js
// cloudfunctions/createRecipe/index.js
const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const recipe = {
    ownerUserId: OPENID,
    name: event.name,
    ingredientsText: event.ingredients,
    photoUrl: event.photoUrl,
    aiNameSuggestion: event.aiNameSuggestion || "",
    aiIngredientsSuggestion: event.aiIngredientsSuggestion || "",
    category: event.category || "家常菜",
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };

  const { _id } = await db.collection("recipes").add({ data: recipe });
  return { recipeId: _id };
};
```

```js
// cloudfunctions/recognizeRecipe/index.js
const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const photoUrl = event.photoUrl;
  const endpoint = process.env.AI_RECOGNIZE_ENDPOINT;
  const apiKey = process.env.AI_RECOGNIZE_API_KEY;

  if (!endpoint || !apiKey) {
    return {
      name: "",
      ingredients: "",
      warning: "AI service not configured"
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ photoUrl })
  });

  if (!response.ok) {
    return {
      name: "",
      ingredients: "",
      warning: `AI request failed: ${response.status}`
    };
  }

  const data = await response.json();
  return {
    name: data.name || "",
    ingredients: data.ingredients || "",
    warning: ""
  };
};
```

- [ ] **Step 3: Build the upload page with non-blocking AI suggestions**

```js
// pages/upload/upload.js
const { validateRecipePayload } = require("../../utils/validators");
const { chooseRecipeImage, uploadRecipeImage, buildRecipePayload } = require("../../services/upload");
const { recognizeRecipeFromImage, mapRecognitionResult } = require("../../services/ai");

Page({
  data: {
    form: {
      name: "",
      ingredients: "",
      photoUrl: ""
    },
    aiSuggestion: {
      name: "",
      ingredients: "",
      isPartial: false
    },
    recognizing: false,
    submitting: false,
    errorMessage: "",
    aiMessage: ""
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`form.${field}`]: e.detail.value
    });
  },

  async onChooseImage() {
    const tempFilePath = await chooseRecipeImage();
    const photoUrl = await uploadRecipeImage(tempFilePath);
    this.setData({
      "form.photoUrl": photoUrl,
      aiSuggestion: { name: "", ingredients: "", isPartial: false },
      aiMessage: "",
      errorMessage: ""
    });
  },

  async onRecognizeTap() {
    if (!this.data.form.photoUrl) {
      this.setData({ errorMessage: "请先上传菜品照片" });
      return;
    }

    this.setData({ recognizing: true, errorMessage: "", aiMessage: "" });
    try {
      const result = await recognizeRecipeFromImage(this.data.form.photoUrl);
      const suggestion = mapRecognitionResult(result.result);
      this.setData({
        aiSuggestion: suggestion,
        "form.name": suggestion.name || this.data.form.name,
        "form.ingredients": suggestion.ingredients || this.data.form.ingredients,
        aiMessage: suggestion.isPartial ? "识别结果不完整，请手动补充" : "已根据图片自动回填，可继续修改"
      });
    } catch (error) {
      this.setData({ aiMessage: "AI识别失败，请手动填写" });
    } finally {
      this.setData({ recognizing: false });
    }
  },

  async onSubmit() {
    const payload = buildRecipePayload(this.data.form);
    const check = validateRecipePayload(payload);
    if (!check.ok) {
      this.setData({ errorMessage: check.message });
      return;
    }

    this.setData({ submitting: true });
    try {
      await wx.cloud.callFunction({
        name: "createRecipe",
        data: {
          ...payload,
          aiNameSuggestion: this.data.aiSuggestion.name,
          aiIngredientsSuggestion: this.data.aiSuggestion.ingredients
        }
      });
      this.setData({
        form: { name: "", ingredients: "", photoUrl: "" },
        aiSuggestion: { name: "", ingredients: "", isPartial: false },
        submitting: false,
        errorMessage: "",
        aiMessage: ""
      });
      wx.switchTab({ url: "/pages/discover/discover" });
    } catch (error) {
      this.setData({ submitting: false, errorMessage: "发布失败，请稍后重试" });
    }
  }
});
```

```xml
<!-- pages/upload/upload.wxml -->
<view class="page-shell upload-page">
  <view class="panel upload-panel">
    <view class="title">上传一道新菜</view>
    <view class="upload-box" bindtap="onChooseImage">
      {{form.photoUrl ? "已上传照片" : "点击上传菜品照片"}}
    </view>
    <button class="secondary-button" loading="{{recognizing}}" bindtap="onRecognizeTap">
      AI识别菜名和食材
    </button>
    <view wx:if="{{aiMessage}}" class="ai-tip">{{aiMessage}}</view>
    <input class="input" data-field="name" placeholder="菜名" bindinput="onInput" value="{{form.name}}" />
    <input class="input" data-field="ingredients" placeholder="食材，例如：虾仁、鸡蛋、葱花" bindinput="onInput" value="{{form.ingredients}}" />
    <view wx:if="{{errorMessage}}" class="error">{{errorMessage}}</view>
    <button class="primary-button" loading="{{submitting}}" bindtap="onSubmit">发布菜谱</button>
  </view>
</view>
```

- [ ] **Step 4: Run AI and upload tests**

Run:

```bash
npm test -- --runTestsByPath tests/services/ai.test.js tests/pages/upload-page.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add utils/formatters.js services/upload.js services/ai.js pages/upload/upload.* cloudfunctions/createRecipe/index.js cloudfunctions/recognizeRecipe/index.js tests/services/ai.test.js tests/pages/upload-page.test.js
git commit -m "feat: add ai-assisted recipe upload flow"
```

### Task 5: Implement my page and personal recipe list

**Files:**
- Create: `pages/my/my.js`
- Create: `pages/my/my.json`
- Create: `pages/my/my.wxml`
- Create: `pages/my/my.wxss`
- Create: `cloudfunctions/getMyRecipes/index.js`
- Modify: `services/recipe.js`
- Test: `tests/services/recipe.test.js`

- [ ] **Step 1: Extend recipe service test for personal recipes**

```js
test("fetchMyRecipes requests personal recipe function", async () => {
  wx.cloud.callFunction.mockResolvedValueOnce({ result: { items: [] } });
  const { fetchMyRecipes } = require("../../services/recipe");
  await fetchMyRecipes();
  expect(wx.cloud.callFunction).toHaveBeenCalledWith({
    name: "getMyRecipes",
    data: {}
  });
});
```

Run:

```bash
npm test -- --runTestsByPath tests/services/recipe.test.js
```

Expected: PASS

- [ ] **Step 2: Add personal recipe cloud function**

```js
// cloudfunctions/getMyRecipes/index.js
const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const { data } = await db
    .collection("recipes")
    .where({ ownerUserId: OPENID })
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  return { items: data };
};
```

- [ ] **Step 3: Build the my page**

```js
// pages/my/my.js
const { fetchMyRecipes, mapRecipeCard } = require("../../services/recipe");

Page({
  data: {
    user: null,
    recipes: []
  },

  async onShow() {
    const app = getApp();
    this.setData({ user: app.globalData.user });
    const result = await fetchMyRecipes();
    this.setData({
      recipes: result.result.items.map(mapRecipeCard)
    });
  }
});
```

```xml
<!-- pages/my/my.wxml -->
<view class="page-shell my-page">
  <view class="panel profile-panel">
    <view class="title">{{user.nickname || "未登录用户"}}</view>
    <view class="subtitle">我上传的菜谱 {{recipes.length}} 道</view>
  </view>

  <view class="recipe-list">
    <view wx:for="{{recipes}}" wx:key="id" class="panel recipe-card">
      <view class="recipe-title">{{item.title}}</view>
      <view class="recipe-summary">{{item.summary}}</view>
    </view>
  </view>
</view>
```

- [ ] **Step 4: Run the focused Phase 1 suite**

Run:

```bash
npm test -- --runTestsByPath tests/utils/validators.test.js tests/services/recipe.test.js tests/services/ai.test.js tests/pages/upload-page.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pages/my/my.* cloudfunctions/getMyRecipes/index.js tests/services/recipe.test.js
git commit -m "feat: add personal recipe page"
```

## Phase 2 Follow-Up

Collaborative dish requests should be planned separately after Phase 1 is working.

That future plan must define:

- request owner (`owner_user_id`)
- board or space container (`board_id` or `space_id`)
- access scope (`visibility_scope`)
- login gate and request-context return path
- requester history view (`我点过的菜`)
- status responsibility (`status_updated_by`, `status_updated_at`)

Do not start collaborative request implementation from this plan.

## Self-Review

### Spec coverage

- Login/register: covered by Task 2
- Shared recipe list: covered by Task 3
- Upload recipe with photo/name/ingredients: covered by Task 4
- AI-assisted recognition rules: covered by Task 4
- My page and personal recipes: covered by Task 5

### Placeholder scan

- No `TBD` or `TODO` placeholders remain
- Each task contains exact files, commands, and implementation snippets
- Collaborative request work has been intentionally removed from this plan

### Type consistency

- Recipe payload uses `name`, `ingredients`, `photoUrl` throughout
- Stored recipe model uses `ownerUserId`, `ingredientsText`, `aiNameSuggestion`, and `aiIngredientsSuggestion`
- AI mapping returns editable `name`, `ingredients`, and `isPartial`
