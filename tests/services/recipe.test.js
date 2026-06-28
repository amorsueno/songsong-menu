global.wx = {
  cloud: {
    callFunction: jest.fn()
  }
};

const { fetchRecipes, fetchMyRecipes, fetchRecipeDetail, mapRecipeCard, mapRecipeDetail } = require("../../services/recipe");

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
      aiIngredientsSuggestion: "牛腩、番茄、洋葱"
    })
  ).toEqual({
    id: "r1",
      title: "番茄牛腩",
      ingredients: "牛腩、番茄、洋葱",
      photoUrl: "cloud://demo/image.jpg",
      category: "家常菜",
      ownerUserId: "owner-1",
      aiNameSuggestion: "番茄牛腩",
      aiIngredientsSuggestion: "牛腩、番茄、洋葱"
    });
  });
});
