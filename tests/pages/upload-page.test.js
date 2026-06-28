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
      loadEditRecipe: pageConfig.loadEditRecipe,
      onLoad: pageConfig.onLoad,
      onRetryEditLoadTap: pageConfig.onRetryEditLoadTap,
      onChooseImage: pageConfig.onChooseImage,
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
    expect(pageConfig.data.headerTitle).toBe("上传一道新菜");
    expect(pageConfig.data.submitLabel).toBe("发布菜谱");
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
    expect(page.data.headerTitle).toBe("编辑这道菜");
    expect(page.data.submitLabel).toBe("保存修改");
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
    expect(page.data.editLoadFailed).toBe(false);
  });

  test("edit mode surfaces a recoverable message when recipe detail loading fails", async () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();
    fetchRecipeDetail.mockRejectedValue(new Error("network"));

    await page.onLoad.call(page, {
      mode: "edit",
      recipeId: "recipe-1"
    });

    expect(page.data.mode).toBe("edit");
    expect(page.data.recipeId).toBe("recipe-1");
    expect(page.data.editLoadFailed).toBe(true);
    expect(page.data.errorMessage).toBe("原菜谱加载失败，请返回上一页后重试");
    expect(page.data.submitting).toBe(false);
  });

  test("retrying edit load replaces failure state with recipe data after success", async () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();

    fetchRecipeDetail
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        result: {
          item: {
            _id: "recipe-1",
            name: "清炒虾仁",
            ingredientsText: "虾仁、玉米、黄瓜",
            photoUrl: "cloud://demo/retry.jpg",
            category: "轻食",
            aiNameSuggestion: "清炒虾仁",
            aiIngredientsSuggestion: "虾仁、玉米、黄瓜"
          }
        }
      });

    await page.onLoad.call(page, {
      mode: "edit",
      recipeId: "recipe-1"
    });
    await page.onRetryEditLoadTap.call(page);

    expect(page.data.editLoadFailed).toBe(false);
    expect(page.data.errorMessage).toBe("");
    expect(page.data.form).toEqual({
      name: "清炒虾仁",
      ingredients: "虾仁、玉米、黄瓜",
      photoUrl: "cloud://demo/retry.jpg",
      category: "轻食"
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

  test("image chooser cancellation keeps upload page state unchanged", async () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();
    page.data.form.name = "凉拌黄瓜";
    chooseRecipeImage.mockRejectedValue(new Error("choose canceled"));

    await page.onChooseImage.call(page);

    expect(uploadRecipeImage).not.toHaveBeenCalled();
    expect(page.data.form.name).toBe("凉拌黄瓜");
    expect(page.data.errorMessage).toBe("");
    expect(page.data.uploadingImage).toBe(false);
  });

  test("image upload failure shows clear fallback message", async () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();
    chooseRecipeImage.mockResolvedValue("/tmp/recipe.jpg");
    uploadRecipeImage.mockRejectedValue(new Error("upload failed"));

    await page.onChooseImage.call(page);

    expect(uploadRecipeImage).toHaveBeenCalledWith("/tmp/recipe.jpg");
    expect(page.data.form.photoUrl).toBe("");
    expect(page.data.errorMessage).toBe("图片上传失败，请稍后重试");
    expect(page.data.uploadingImage).toBe(false);
  });

  test("successful image upload clears error state and finishes uploading mode", async () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();
    page.data.errorMessage = "旧错误";
    chooseRecipeImage.mockResolvedValue("/tmp/recipe.jpg");
    uploadRecipeImage.mockResolvedValue("cloud://demo/recipe.jpg");

    await page.onChooseImage.call(page);

    expect(page.data.form.photoUrl).toBe("cloud://demo/recipe.jpg");
    expect(page.data.errorMessage).toBe("");
    expect(page.data.uploadingImage).toBe(false);
  });

  test("recognize tap is blocked while image is still uploading", async () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();
    page.data.uploadingImage = true;
    page.data.form.photoUrl = "cloud://demo/recipe.jpg";

    await page.onRecognizeTap.call(page);

    expect(recognizeRecipeFromImage).not.toHaveBeenCalled();
    expect(page.data.errorMessage).toBe("图片仍在上传中，请稍后再试");
  });

  test("submit is blocked while image is still uploading", async () => {
    require("../../pages/upload/upload");
    const page = createPageInstance();
    page.data.uploadingImage = true;
    page.data.form = {
      name: "清炒时蔬",
      ingredients: "西兰花、胡萝卜",
      photoUrl: "cloud://demo/recipe.jpg",
      category: "轻食"
    };

    await page.onSubmit.call(page);

    expect(buildRecipePayload).not.toHaveBeenCalled();
    expect(wx.cloud.callFunction).not.toHaveBeenCalled();
    expect(page.data.errorMessage).toBe("图片仍在上传中，请稍后再试");
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
