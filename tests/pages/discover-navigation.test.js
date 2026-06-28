describe("discover page navigation", () => {
  let pageConfig;

  beforeEach(() => {
    jest.resetModules();
    pageConfig = null;
    global.Page = (config) => {
      pageConfig = config;
    };
    global.wx = {
      navigateTo: jest.fn()
    };
    jest.doMock("../../services/recipe", () => ({
      fetchRecipes: jest.fn(),
      mapRecipeCard: jest.fn()
    }));
  });

  afterEach(() => {
    delete global.Page;
    delete global.wx;
  });

  test("onRecipeTap navigates to recipe detail page", () => {
    require("../../pages/discover/discover");

    pageConfig.onRecipeTap({
      currentTarget: {
        dataset: {
          id: "recipe-1"
        }
      }
    });

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: "/pages/recipe-detail/recipe-detail?recipeId=recipe-1"
    });
  });
});
