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
