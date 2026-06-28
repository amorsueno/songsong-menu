describe("my page", () => {
  let pageConfig;
  let requireLogin;
  let fetchMyRecipes;
  let mapRecipeCard;

  function createPageInstance() {
    return {
      data: JSON.parse(JSON.stringify(pageConfig.data)),
      setData(update) {
        this.data = {
          ...this.data,
          ...update
        };
      },
      onShow: pageConfig.onShow
    };
  }

  beforeEach(() => {
    jest.resetModules();
    pageConfig = null;

    global.Page = (config) => {
      pageConfig = config;
    };

    global.getApp = jest.fn(() => ({
      globalData: {
        user: {
          nickname: "松松"
        }
      }
    }));

    jest.doMock("../../services/auth", () => {
      requireLogin = jest.fn();
      return { requireLogin };
    });

    jest.doMock("../../services/recipe", () => {
      fetchMyRecipes = jest.fn();
      mapRecipeCard = jest.fn((item) => ({
        id: item._id,
        title: item.name
      }));

      return {
        fetchMyRecipes,
        mapRecipeCard
      };
    });
  });

  afterEach(() => {
    delete global.Page;
    delete global.getApp;
  });

  test("onShow loads current user recipes after login passes", async () => {
    require("../../pages/my/my");
    ({ requireLogin } = require("../../services/auth"));
    ({ fetchMyRecipes, mapRecipeCard } = require("../../services/recipe"));

    requireLogin.mockReturnValue(true);
    fetchMyRecipes.mockResolvedValue({
      result: {
        items: [{ _id: "dish-1", name: "糖醋排骨" }]
      }
    });

    const page = createPageInstance();

    await page.onShow.call(page);

    expect(requireLogin).toHaveBeenCalled();
    expect(page.data.loading).toBe(false);
    expect(page.data.errorText).toBe("");
    expect(page.data.user).toEqual({ nickname: "松松" });
    expect(page.data.recipes).toEqual([
      {
        id: "dish-1",
        title: "糖醋排骨"
      }
    ]);
  });

  test("onShow sets an error state when recipe loading fails", async () => {
    require("../../pages/my/my");
    ({ requireLogin } = require("../../services/auth"));
    ({ fetchMyRecipes } = require("../../services/recipe"));

    requireLogin.mockReturnValue(true);
    fetchMyRecipes.mockRejectedValue(new Error("network"));

    const page = createPageInstance();

    await page.onShow.call(page);

    expect(page.data.loading).toBe(false);
    expect(page.data.recipes).toEqual([]);
    expect(page.data.errorText).toBe("我的菜谱加载失败，请稍后重试");
  });
});
