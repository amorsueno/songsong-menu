describe("recipe detail page", () => {
  let pageConfig;
  let deleteRecipe;
  let fetchRecipeDetail;
  let mapRecipeDetail;

  function createPageInstance() {
    return {
      data: JSON.parse(JSON.stringify(pageConfig.data)),
      setData(update) {
        this.data = {
          ...this.data,
          ...update
        };
      },
      loadRecipe: pageConfig.loadRecipe,
      onDeleteTap: pageConfig.onDeleteTap,
      onLoad: pageConfig.onLoad
    };
  }

  beforeEach(() => {
    jest.resetModules();
    pageConfig = null;

    global.Page = (config) => {
      pageConfig = config;
    };

    global.wx = {
      navigateTo: jest.fn(),
      showModal: jest.fn(),
      switchTab: jest.fn()
    };

    global.getApp = jest.fn(() => ({
      globalData: {
        user: {
          openId: "owner-1"
        }
      }
    }));

    jest.doMock("../../services/recipe", () => {
      deleteRecipe = jest.fn();
      fetchRecipeDetail = jest.fn();
      mapRecipeDetail = jest.fn((item) => ({
        id: item._id,
        title: item.name,
        ownerUserId: item.ownerUserId,
        createdAtText: item.createdAtText,
        updatedAtText: item.updatedAtText
      }));

      return {
        deleteRecipe,
        fetchRecipeDetail,
        mapRecipeDetail
      };
    });
  });

  afterEach(() => {
    delete global.Page;
    delete global.wx;
    delete global.getApp;
  });

  test("onLoad stores recipeId and loads recipe detail", async () => {
    require("../../pages/recipe-detail/recipe-detail");
    const page = createPageInstance();
    fetchRecipeDetail.mockResolvedValue({
      result: {
        item: {
          _id: "recipe-1",
          name: "糖醋排骨",
          ownerUserId: "owner-1",
          createdAtText: "创建于 2026.06.28",
          updatedAtText: "更新于 2026.06.29"
        }
      }
    });

    await page.onLoad.call(page, { recipeId: "recipe-1" });

    expect(fetchRecipeDetail).toHaveBeenCalledWith("recipe-1");
    expect(page.data.recipeId).toBe("recipe-1");
    expect(page.data.recipe).toEqual({
      id: "recipe-1",
      title: "糖醋排骨",
      ownerUserId: "owner-1",
      createdAtText: "创建于 2026.06.28",
      updatedAtText: "更新于 2026.06.29"
    });
    expect(page.data.canEdit).toBe(true);
    expect(page.data.errorText).toBe("");
    expect(page.data.loading).toBe(false);
  });

  test("loadRecipe sets error state when request fails", async () => {
    require("../../pages/recipe-detail/recipe-detail");
    const page = createPageInstance();
    page.data.recipeId = "recipe-1";
    fetchRecipeDetail.mockRejectedValue(new Error("network"));

    await page.loadRecipe.call(page);

    expect(page.data.recipe).toBe(null);
    expect(page.data.errorText).toBe("菜谱详情加载失败，请稍后重试");
    expect(page.data.loading).toBe(false);
  });

  test("onEditTap navigates to upload page in edit mode", () => {
    require("../../pages/recipe-detail/recipe-detail");

    pageConfig.onEditTap({
      currentTarget: {
        dataset: {
          id: "recipe-1"
        }
      }
    });

    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: "/pages/upload/upload?mode=edit&recipeId=recipe-1"
    });
  });

  test("onDeleteTap confirms deletion and returns to my page after success", async () => {
    require("../../pages/recipe-detail/recipe-detail");
    const page = createPageInstance();
    page.data.recipeId = "recipe-1";
    deleteRecipe.mockResolvedValue({ result: { recipeId: "recipe-1" } });
    wx.showModal.mockResolvedValue({ confirm: true, cancel: false });

    await page.onDeleteTap.call(page);

    expect(wx.showModal).toHaveBeenCalledWith({
      title: "删除菜谱",
      content: "删除后将无法恢复，确认删除这道菜谱吗？"
    });
    expect(deleteRecipe).toHaveBeenCalledWith("recipe-1");
    expect(wx.switchTab).toHaveBeenCalledWith({
      url: "/pages/my/my"
    });
    expect(page.data.actionError).toBe("");
    expect(page.data.deleting).toBe(false);
  });

  test("onDeleteTap keeps detail page when user cancels", async () => {
    require("../../pages/recipe-detail/recipe-detail");
    const page = createPageInstance();
    page.data.recipeId = "recipe-1";
    wx.showModal.mockResolvedValue({ confirm: false, cancel: true });

    await page.onDeleteTap.call(page);

    expect(deleteRecipe).not.toHaveBeenCalled();
    expect(wx.switchTab).not.toHaveBeenCalled();
  });

  test("onDeleteTap shows inline error when deletion fails", async () => {
    require("../../pages/recipe-detail/recipe-detail");
    const page = createPageInstance();
    page.data.recipeId = "recipe-1";
    deleteRecipe.mockRejectedValue(new Error("permission"));
    wx.showModal.mockResolvedValue({ confirm: true, cancel: false });

    await page.onDeleteTap.call(page);

    expect(page.data.actionError).toBe("删除失败，请稍后重试");
    expect(page.data.deleting).toBe(false);
    expect(wx.switchTab).not.toHaveBeenCalled();
  });
});
