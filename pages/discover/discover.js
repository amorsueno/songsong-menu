const { RECIPE_CATEGORIES } = require("../../utils/constants");
const { fetchRecipes, mapRecipeCard } = require("../../services/recipe");

Page({
  data: {
    categories: RECIPE_CATEGORIES,
    activeCategory: "全部",
    recipes: [],
    loading: false,
    errorText: "",
    emptyText: "还没有菜谱，先上传第一道拿手菜吧"
  },

  onLoad() {
    this.loadRecipes();
  },

  onShow() {
    this.loadRecipes();
  },

  async loadRecipes() {
    this.setData({
      loading: true,
      errorText: ""
    });

    try {
      const result = await fetchRecipes(this.data.activeCategory);
      this.setData({
        recipes: result.result.items.map(mapRecipeCard)
      });
    } catch (error) {
      this.setData({
        recipes: [],
        errorText: "菜谱加载失败，请稍后重试"
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async onCategoryTap(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.category });
    await this.loadRecipes();
  },

  onRecipeTap(e) {
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?recipeId=${e.currentTarget.dataset.id}`
    });
  },

  async onRetryTap() {
    await this.loadRecipes();
  }
});
