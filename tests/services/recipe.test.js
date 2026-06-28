global.wx = {
  cloud: {
    callFunction: jest.fn()
  }
};

const {
  deleteRecipe,
  fetchRecipes,
  fetchMyRecipes,
  fetchRecipeDetail,
  mapRecipeCard,
  mapRecipeDetail
} = require("../../services/recipe");

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

  test("fetchMyRecipes requests personal recipe function", async () => {
    wx.cloud.callFunction.mockResolvedValueOnce({ result: { items: [] } });
    await fetchMyRecipes();
    expect(wx.cloud.callFunction).toHaveBeenCalledWith({
      name: "getMyRecipes",
      data: {}
    });
  });

  test("fetchRecipeDetail requests recipe detail function with recipeId", async () => {
    wx.cloud.callFunction.mockResolvedValueOnce({ result: { item: null } });
    await fetchRecipeDetail("recipe-1");
    expect(wx.cloud.callFunction).toHaveBeenCalledWith({
      name: "getRecipeDetail",
      data: { recipeId: "recipe-1" }
    });
  });

  test("deleteRecipe requests delete cloud function with recipeId", async () => {
    wx.cloud.callFunction.mockResolvedValueOnce({ result: { recipeId: "recipe-1" } });
    await deleteRecipe("recipe-1");
    expect(wx.cloud.callFunction).toHaveBeenCalledWith({
      name: "deleteRecipe",
      data: { recipeId: "recipe-1" }
    });
  });

  test("mapRecipeDetail returns detail fields", () => {
    expect(
      mapRecipeDetail({
        _id: "r1",
        name: "番茄牛腩",
        ingredientsText: "牛腩、番茄、洋葱",
        photoUrl: "cloud://demo/image.jpg",
        category: "家常菜",
        ownerUserId: "owner-1",
        aiNameSuggestion: "番茄牛腩",
        aiIngredientsSuggestion: "牛腩、番茄、洋葱",
        createdAt: "2026-06-28T10:20:00.000Z",
        updatedAt: "2026-06-29T11:30:00.000Z"
      })
    ).toEqual({
      id: "r1",
      title: "番茄牛腩",
      ingredients: "牛腩、番茄、洋葱",
      photoUrl: "cloud://demo/image.jpg",
      category: "家常菜",
      ownerUserId: "owner-1",
      aiNameSuggestion: "番茄牛腩",
      aiIngredientsSuggestion: "牛腩、番茄、洋葱",
      createdAtText: "创建于 2026.06.28",
      updatedAtText: "更新于 2026.06.29"
    });
  });
});
