const { deleteRecipe, fetchRecipeDetail, mapRecipeDetail } = require("../../services/recipe");

Page({
  data: {
    recipeId: "",
    recipe: null,
    loading: false,
    errorText: "",
    canEdit: false,
    deleting: false,
    actionError: ""
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
      errorText: "",
      actionError: ""
    });

    try {
      const result = await fetchRecipeDetail(this.data.recipeId);
      const recipe = mapRecipeDetail(result.result.item);
      const app = getApp();
      this.setData({
        recipe,
        canEdit: recipe.ownerUserId && app.globalData.user && recipe.ownerUserId === app.globalData.user.openId
      });
    } catch (error) {
      this.setData({
        recipe: null,
        errorText: "菜谱详情加载失败，请稍后重试",
        canEdit: false
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async onRetryTap() {
    await this.loadRecipe();
  },

  onEditTap(e) {
    wx.navigateTo({
      url: `/pages/upload/upload?mode=edit&recipeId=${e.currentTarget.dataset.id}`
    });
  },

  async onDeleteTap() {
    const modalResult = await wx.showModal({
      title: "删除菜谱",
      content: "删除后将无法恢复，确认删除这道菜谱吗？"
    });

    if (!modalResult.confirm) {
      return;
    }

    this.setData({
      deleting: true,
      actionError: ""
    });

    try {
      await deleteRecipe(this.data.recipeId);
      wx.switchTab({
        url: "/pages/my/my"
      });
    } catch (error) {
      this.setData({
        actionError: "删除失败，请稍后重试"
      });
    } finally {
      this.setData({
        deleting: false
      });
    }
  }
});
