describe("upload page", () => {
  let pageConfig;
  let requireLogin;
  let chooseRecipeImage;
  let uploadRecipeImage;
  let buildRecipePayload;
  let recognizeRecipeFromImage;
  let mapRecognitionResult;
  let fetchRecipeDetail;
  let mapRecipeDetail;

  function setValueByPath(target, path, value) {
    const keys = path.split(".");
    let current = target;

    keys.slice(0, -1).forEach((key) => {
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    });

    current[keys[keys.length - 1]] = value;
  }

  function createPageInstance() {
    return {
      data: JSON.parse(JSON.stringify(pageConfig.data)),
      setData(update) {
        Object.entries(update).forEach(([key, value]) => {
          if (key.includes(".")) {
            setValueByPath(this.data, key, value);
            return;
          }

          this.data[key] = value;
        });
      },
      onCategoryTap: pageConfig.onCategoryTap,
      getLoginRedirect: pageConfig.getLoginRedirect,
      onLoad: pageConfig.onLoad,
      onShow: pageConfig.onShow,
      onRecognizeTap: pageConfig.onRecognizeTap,
      onSubmit: pageConfig.onSubmit
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
      cloud: {
        callFunction: jest.fn()
      },
      switchTab: jest.fn()
    };

    jest.doMock("../../services/auth", () => {
      requireLogin = jest.fn();
      return { requireLogin };
    });

    jest.doMock("../../services/upload", () => {
      chooseRecipeImage = jest.fn();
      uploadRecipeImage = jest.fn();
      buildRecipePayload = jest.fn((form) => ({
        name: form.name.trim(),
        ingredients: form.ingredients.trim(),
        photoUrl: form.photoUrl,
        category: form.category || "家常菜"
      }));

      return {
        chooseRecipeImage,
        uploadRecipeImage,
        buildRecipePayload
      };
    });

    jest.doMock("../../services/ai", () => {
      recognizeRecipeFromImage = jest.fn();
      mapRecognitionResult = jest.fn();

      return {
        recognizeRecipeFromImage,
        mapRecognitionResult
      };
    });

    jest.doMock("../../services/recipe", () => {
      fetchRecipeDetail = jest.fn();
      mapRecipeDetail = jest.fn((item) => ({
        id: item._id,
        title: item.name,
        ingredients: item.ingredientsText,
        photoUrl: item.photoUrl,
        category: item.category,
        aiNameSuggestion: item.aiNameSuggestion || "",
        aiIngredientsSuggestion: item.aiIngredientsSuggestion || "",
        ownerUserId: item.ownerUserId || ""
      }));

      return {
        fetchRecipeDetail,
        mapRecipeDetail
      };
    });
  });

  afterEach(() => {
    delete global.Page;
    delete global.getApp;
    delete global.wx;
  });

  test("page starts with empty recipe form", () => {
    require("../../pages/upload/upload");

    expect(pageConfig.data.form).toEqual({
      name: "",
      ingredients: "",
      photoUrl: "",
      category: "家常菜"
    });
  });

  test("page exposes available upload categories", () => {
    require("../../pages/upload/upload");

    expect(pageConfig.data.categories).toEqual([
      "家常菜",
      "汤羹",
      "快手菜",
      "轻食"
    ]);
  });

  test("category tap updates current recipe category", () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();

    page.onCategoryTap.call(page, {
      currentTarget: {
        dataset: {
          category: "轻食"
        }
      }
    });

    expect(page.data.form.category).toBe("轻食");
  });

  test("page starts with empty ai suggestion state", () => {
    require("../../pages/upload/upload");

    expect(pageConfig.data.aiSuggestion).toEqual({
      name: "",
      ingredients: "",
      isPartial: false
    });
  });

  test("edit mode loads existing recipe into form", async () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();

    fetchRecipeDetail.mockResolvedValue({
      result: {
        item: {
          _id: "recipe-1",
          name: "红烧排骨",
          ingredientsText: "排骨、酱油",
          photoUrl: "cloud://demo/recipe.jpg",
          category: "家常菜",
          aiNameSuggestion: "红烧排骨",
          aiIngredientsSuggestion: "排骨、酱油"
        }
      }
    });

    await page.onLoad.call(page, {
      mode: "edit",
      recipeId: "recipe-1"
    });

    expect(fetchRecipeDetail).toHaveBeenCalledWith("recipe-1");
    expect(page.data.mode).toBe("edit");
    expect(page.data.recipeId).toBe("recipe-1");
    expect(page.data.form).toEqual({
      name: "红烧排骨",
      ingredients: "排骨、酱油",
      photoUrl: "cloud://demo/recipe.jpg",
      category: "家常菜"
    });
    expect(page.data.aiSuggestion).toEqual({
      name: "红烧排骨",
      ingredients: "排骨、酱油",
      isPartial: false
    });
  });

  test("edit mode login guard preserves recipe return path", async () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();
    fetchRecipeDetail.mockResolvedValue({
      result: {
        item: {
          _id: "recipe-1",
          name: "红烧排骨",
          ingredientsText: "排骨、酱油",
          photoUrl: "cloud://demo/recipe.jpg",
          category: "家常菜"
        }
      }
    });

    await page.onLoad.call(page, {
      mode: "edit",
      recipeId: "recipe-1"
    });
    page.onShow.call(page);

    expect(requireLogin).toHaveBeenCalledWith(
      expect.anything(),
      "/pages/upload/upload?mode=edit&recipeId=recipe-1"
    );
  });

  test("successful recognition autofills editable suggestions", async () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();

    page.data.form.photoUrl = "cloud://demo/recipe.jpg";
    recognizeRecipeFromImage.mockResolvedValue({
      result: { model: "demo" }
    });
    mapRecognitionResult.mockReturnValue({
      name: "蒜香排骨",
      ingredients: "排骨、蒜末",
      isPartial: false
    });

    await page.onRecognizeTap.call(page);

    expect(recognizeRecipeFromImage).toHaveBeenCalledWith("cloud://demo/recipe.jpg");
    expect(page.data.form.name).toBe("蒜香排骨");
    expect(page.data.form.ingredients).toBe("排骨、蒜末");
    expect(page.data.aiSuggestion).toEqual({
      name: "蒜香排骨",
      ingredients: "排骨、蒜末",
      isPartial: false
    });
    expect(page.data.aiMessage).toBe("识别完成，已自动回填，你仍可继续修改");
    expect(page.data.recognizing).toBe(false);
  });

  test("partial recognition prompts manual completion", async () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();

    page.data.form.photoUrl = "cloud://demo/recipe.jpg";
    page.data.form.ingredients = "鸡蛋";
    recognizeRecipeFromImage.mockResolvedValue({
      result: { model: "demo" }
    });
    mapRecognitionResult.mockReturnValue({
      name: "",
      ingredients: "番茄、鸡蛋",
      isPartial: true
    });

    await page.onRecognizeTap.call(page);

    expect(page.data.form.name).toBe("");
    expect(page.data.form.ingredients).toBe("番茄、鸡蛋");
    expect(page.data.aiMessage).toBe("识别结果不完整，请手动补充缺少的菜名或食材");
  });

  test("warning-only recognition result keeps publish unblocked and explains fallback", async () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();

    page.data.form.photoUrl = "cloud://demo/recipe.jpg";
    page.data.form.name = "凉拌黄瓜";
    mapRecognitionResult.mockReturnValue({
      name: "",
      ingredients: "",
      isPartial: true,
      warning: "AI response could not be parsed"
    });
    recognizeRecipeFromImage.mockResolvedValue({
      result: { provider: "openai_responses" }
    });

    await page.onRecognizeTap.call(page);

    expect(page.data.form.name).toBe("凉拌黄瓜");
    expect(page.data.aiMessage).toBe("AI识别未返回完整结果（AI response could not be parsed），可手动填写后继续发布");
    expect(page.data.recognizing).toBe(false);
  });

  test("recognition failure does not block later manual submission", async () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();

    page.data.form = {
      name: "手撕包菜",
      ingredients: "包菜、蒜末",
      photoUrl: "cloud://demo/recipe.jpg",
      category: "快手菜"
    };

    recognizeRecipeFromImage.mockRejectedValue(new Error("network"));
    wx.cloud.callFunction.mockResolvedValue({ result: { id: "recipe-1" } });

    await page.onRecognizeTap.call(page);

    expect(page.data.aiMessage).toBe("AI识别失败，不影响发布，可手动填写后直接发布");
    expect(page.data.errorMessage).toBe("");

    await page.onSubmit.call(page);

    expect(buildRecipePayload).toHaveBeenCalledWith({
      name: "手撕包菜",
      ingredients: "包菜、蒜末",
      photoUrl: "cloud://demo/recipe.jpg",
      category: "快手菜"
    });
    expect(wx.cloud.callFunction).toHaveBeenCalledWith({
      name: "createRecipe",
      data: {
        name: "手撕包菜",
        ingredients: "包菜、蒜末",
        photoUrl: "cloud://demo/recipe.jpg",
        category: "快手菜",
        aiNameSuggestion: "",
        aiIngredientsSuggestion: ""
      }
    });
    expect(wx.switchTab).toHaveBeenCalledWith({ url: "/pages/discover/discover" });
  });

  test("edit submit uses updateRecipe cloud function and redirects to detail page", async () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();

    page.data.mode = "edit";
    page.data.recipeId = "recipe-1";
    page.data.form = {
      name: "清炒西兰花",
      ingredients: "西兰花、蒜末",
      photoUrl: "cloud://demo/recipe.jpg",
      category: "轻食"
    };
    wx.redirectTo = jest.fn();
    wx.cloud.callFunction.mockResolvedValue({ result: { recipeId: "recipe-1" } });

    await page.onSubmit.call(page);

    expect(wx.cloud.callFunction).toHaveBeenCalledWith({
      name: "updateRecipe",
      data: {
        recipeId: "recipe-1",
        name: "清炒西兰花",
        ingredients: "西兰花、蒜末",
        photoUrl: "cloud://demo/recipe.jpg",
        category: "轻食",
        aiNameSuggestion: "",
        aiIngredientsSuggestion: ""
      }
    });
    expect(wx.redirectTo).toHaveBeenCalledWith({
      url: "/pages/recipe-detail/recipe-detail?recipeId=recipe-1"
    });
  });
});
