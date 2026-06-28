describe("recipe detail page", () => {
  let pageConfig;
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
      onLoad: pageConfig.onLoad
    };
  }

  beforeEach(() => {
    jest.resetModules();
    pageConfig = null;

    global.Page = (config) => {
      pageConfig = config;
    };

    jest.doMock("../../services/recipe", () => {
      fetchRecipeDetail = jest.fn();
      mapRecipeDetail = jest.fn((item) => ({
        id: item._id,
        title: item.name
      }));

      return {
        fetchRecipeDetail,
        mapRecipeDetail
      };
    });
  });

  afterEach(() => {
    delete global.Page;
  });

  test("onLoad stores recipeId and loads recipe detail", async () => {
    require("../../pages/recipe-detail/recipe-detail");
    const page = createPageInstance();
    fetchRecipeDetail.mockResolvedValue({
      result: {
        item: {
          _id: "recipe-1",
          name: "糖醋排骨"
        }
      }
    });

    await page.onLoad.call(page, { recipeId: "recipe-1" });

    expect(fetchRecipeDetail).toHaveBeenCalledWith("recipe-1");
    expect(page.data.recipeId).toBe("recipe-1");
    expect(page.data.recipe).toEqual({
      id: "recipe-1",
      title: "糖醋排骨"
    });
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
});
