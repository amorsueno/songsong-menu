describe("discover page", () => {
  let pageConfig;
  let fetchRecipes;
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
      loadRecipes: pageConfig.loadRecipes,
      onCategoryTap: pageConfig.onCategoryTap
    };
  }

  beforeEach(() => {
    jest.resetModules();
    pageConfig = null;

    global.Page = (config) => {
      pageConfig = config;
    };

    jest.doMock("../../services/recipe", () => {
      fetchRecipes = jest.fn();
      mapRecipeCard = jest.fn((item) => ({
        id: item._id,
        title: item.name
      }));

      return {
        fetchRecipes,
        mapRecipeCard
      };
    });
  });

  afterEach(() => {
    delete global.Page;
  });

  test("loadRecipes stores mapped recipes after a successful fetch", async () => {
    require("../../pages/discover/discover");
    ({ fetchRecipes, mapRecipeCard } = require("../../services/recipe"));

    fetchRecipes.mockResolvedValue({
      result: {
        items: [{ _id: "dish-1", name: "番茄炒蛋" }]
      }
    });

    const page = createPageInstance();

    await page.loadRecipes.call(page);

    expect(fetchRecipes).toHaveBeenCalledWith("全部");
    expect(page.data.loading).toBe(false);
    expect(page.data.errorText).toBe("");
    expect(page.data.recipes).toEqual([
      {
        id: "dish-1",
        title: "番茄炒蛋"
      }
    ]);
  });

  test("loadRecipes sets an error state when the fetch fails", async () => {
    require("../../pages/discover/discover");
    ({ fetchRecipes } = require("../../services/recipe"));

    fetchRecipes.mockRejectedValue(new Error("network"));

    const page = createPageInstance();

    await page.loadRecipes.call(page);

    expect(page.data.loading).toBe(false);
    expect(page.data.recipes).toEqual([]);
    expect(page.data.errorText).toBe("菜谱加载失败，请稍后重试");
  });
});
