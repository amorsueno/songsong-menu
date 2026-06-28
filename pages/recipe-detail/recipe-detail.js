const { fetchRecipeDetail, mapRecipeDetail } = require("../../services/recipe");

Page({
  data: {
    recipeId: "",
    recipe: null,
    loading: false,
    errorText: ""
  },

  async onLoad(query) {
    this.setData({
      recipeId: query.recipeId || ""
    });
    await this.loadRecipe();
  },

  async loadRecipe() {
    this.setData({
      loading: true,
      errorText: ""
    });

    try {
      const result = await fetchRecipeDetail(this.data.recipeId);
      this.setData({
        recipe: mapRecipeDetail(result.result.item)
      });
    } catch (error) {
      this.setData({
        recipe: null,
        errorText: "菜谱详情加载失败，请稍后重试"
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async onRetryTap() {
    await this.loadRecipe();
  }
});
