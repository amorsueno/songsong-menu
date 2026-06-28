const { requireLogin } = require("../../services/auth");
const { fetchMyRecipes, mapRecipeCard } = require("../../services/recipe");

Page({
  data: {
    user: null,
    recipes: []
  },

  async onShow() {
    const app = getApp();
    if (!requireLogin(app, "/pages/my/my")) {
      return;
    }
    this.setData({ user: app.globalData.user });
    const result = await fetchMyRecipes();
    this.setData({
      recipes: result.result.items.map(mapRecipeCard)
    });
  }
});
