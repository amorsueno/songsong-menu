describe("my page navigation", () => {
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
    global.getApp = jest.fn(() => ({
      globalData: {
        user: { nickname: "松松" }
      }
    }));
    jest.doMock("../../services/auth", () => ({
      requireLogin: jest.fn(() => true)
    }));
    jest.doMock("../../services/recipe", () => ({
      fetchMyRecipes: jest.fn(),
      mapRecipeCard: jest.fn()
    }));
  });

  afterEach(() => {
    delete global.Page;
    delete global.wx;
    delete global.getApp;
  });

  test("onRecipeTap navigates to recipe detail page", () => {
    require("../../pages/my/my");

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
