const { clearUser, requireLogin } = require("../../services/auth");
const { fetchMyRecipes, mapRecipeCard } = require("../../services/recipe");

Page({
  data: {
    user: null,
    recipes: [],
    featuredRecipe: null,
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
      const recipes = result.result.items.map(mapRecipeCard);
      this.setData({
        recipes,
        featuredRecipe: recipes[0] || null
      });
    } catch (error) {
      this.setData({
        recipes: [],
        featuredRecipe: null,
        errorText: "我的菜谱加载失败，请稍后重试"
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async onRetryTap() {
    await this.onShow();
  },

  onRecipeTap(e) {
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?recipeId=${e.currentTarget.dataset.id}`
    });
  },

  async onLogoutTap() {
    const result = await wx.showModal({
      title: "退出登录",
      content: "退出后可重新登录其他账号，确认现在退出吗？"
    });

    if (!result.confirm) {
      return;
    }

    const app = getApp();
    clearUser(app);
    wx.redirectTo({
      url: "/pages/login/login?redirect=%2Fpages%2Fdiscover%2Fdiscover"
    });
  }
});
