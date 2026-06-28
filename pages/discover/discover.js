const { RECIPE_CATEGORIES } = require("../../utils/constants");
const { fetchRecipes, mapRecipeCard } = require("../../services/recipe");

Page({
  data: {
    categories: RECIPE_CATEGORIES,
    activeCategory: "全部",
    recipes: [],
    loading: false,
    emptyText: "还没有菜谱，先上传第一道拿手菜吧"
  },

  onLoad() {
    this.loadRecipes();
  },

  onShow() {
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
