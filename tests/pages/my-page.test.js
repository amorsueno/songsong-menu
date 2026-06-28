describe("my page", () => {
  let pageConfig;
  let clearUser;
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
      onLogoutTap: pageConfig.onLogoutTap,
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

    global.wx = {
      redirectTo: jest.fn(),
      showModal: jest.fn()
    };

    jest.doMock("../../services/auth", () => {
      clearUser = jest.fn();
      requireLogin = jest.fn();
      return { clearUser, requireLogin };
    });

    jest.doMock("../../services/recipe", () => {
      fetchMyRecipes = jest.fn();
      mapRecipeCard = jest.fn((item) => ({
        id: item._id,
        title: item.name,
        summary: item.ingredientsText,
        photoUrl: item.photoUrl
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
    delete global.wx;
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
        title: "糖醋排骨",
        summary: undefined,
        photoUrl: undefined
      }
    ]);
    expect(page.data.featuredRecipe).toEqual({
      id: "dish-1",
      title: "糖醋排骨",
      summary: undefined,
      photoUrl: undefined
    });
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
    expect(page.data.featuredRecipe).toBe(null);
    expect(page.data.errorText).toBe("我的菜谱加载失败，请稍后重试");
  });

  test("onLogoutTap clears login state and returns to login page after confirmation", async () => {
    require("../../pages/my/my");
    ({ clearUser } = require("../../services/auth"));
    const page = createPageInstance();
    wx.showModal.mockResolvedValue({ confirm: true, cancel: false });

    await page.onLogoutTap.call(page);

    expect(wx.showModal).toHaveBeenCalledWith({
      title: "退出登录",
      content: "退出后可重新登录其他账号，确认现在退出吗？"
    });
    expect(clearUser).toHaveBeenCalled();
    expect(wx.redirectTo).toHaveBeenCalledWith({
      url: "/pages/login/login?redirect=%2Fpages%2Fdiscover%2Fdiscover"
    });
  });

  test("onLogoutTap keeps current page when user cancels", async () => {
    require("../../pages/my/my");
    ({ clearUser } = require("../../services/auth"));
    const page = createPageInstance();
    wx.showModal.mockResolvedValue({ confirm: false, cancel: true });

    await page.onLogoutTap.call(page);

    expect(clearUser).not.toHaveBeenCalled();
    expect(wx.redirectTo).not.toHaveBeenCalled();
  });
});
