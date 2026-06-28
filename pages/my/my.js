const { requireLogin } = require("../../services/auth");
const { fetchMyRecipes, mapRecipeCard } = require("../../services/recipe");

Page({
  data: {
    user: null,
    recipes: [],
    loading: false,
    errorText: ""
  },

  async onShow() {
    const app = getApp();
    if (!requireLogin(app, "/pages/my/my")) {
      return;
    }

    this.setData({
      user: app.globalData.user,
      loading: true,
      errorText: ""
    });

    try {
      const result = await fetchMyRecipes();
      this.setData({
        recipes: result.result.items.map(mapRecipeCard)
      });
    } catch (error) {
      this.setData({
        recipes: [],
        errorText: "我的菜谱加载失败，请稍后重试"
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async onRetryTap() {
    await this.onShow();
  }
});
