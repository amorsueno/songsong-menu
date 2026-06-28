global.wx = {
  cloud: {
    callFunction: jest.fn()
  }
};

const { fetchRecipes, mapRecipeCard } = require("../../services/recipe");

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
    const { fetchMyRecipes } = require("../../services/recipe");
    wx.cloud.callFunction.mockResolvedValueOnce({ result: { items: [] } });
    await fetchMyRecipes();
    expect(wx.cloud.callFunction).toHaveBeenCalledWith({
      name: "getMyRecipes",
      data: {}
    });
  });
});
