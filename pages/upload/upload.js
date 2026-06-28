const { requireLogin } = require("../../services/auth");
const { validateRecipePayload } = require("../../utils/validators");
const { chooseRecipeImage, uploadRecipeImage, buildRecipePayload } = require("../../services/upload");
const { recognizeRecipeFromImage, mapRecognitionResult } = require("../../services/ai");
const { fetchRecipeDetail, mapRecipeDetail } = require("../../services/recipe");
const { RECIPE_CATEGORIES } = require("../../utils/constants");

const UPLOAD_CATEGORIES = RECIPE_CATEGORIES.filter((item) => item !== "全部");

Page({
  data: {
    mode: "create",
    recipeId: "",
    headerTitle: "上传一道新菜",
    submitLabel: "发布菜谱",
    categories: UPLOAD_CATEGORIES,
    form: {
      name: "",
      ingredients: "",
      photoUrl: "",
      category: UPLOAD_CATEGORIES[0]
    },
    aiSuggestion: {
      name: "",
      ingredients: "",
      isPartial: false
    },
    recognizing: false,
    submitting: false,
    editLoadFailed: false,
    errorMessage: "",
    aiMessage: ""
  },

  async onLoad(query) {
    if (query.mode === "edit" && query.recipeId) {
      this.setData({
        mode: "edit",
        recipeId: query.recipeId,
        headerTitle: "编辑这道菜",
        submitLabel: "保存修改",
        editLoadFailed: false,
        errorMessage: ""
      });

      try {
        const result = await fetchRecipeDetail(query.recipeId);
        const recipe = mapRecipeDetail(result.result.item);

        this.setData({
          form: {
            name: recipe.title,
            ingredients: recipe.ingredients,
            photoUrl: recipe.photoUrl,
            category: recipe.category
          },
          aiSuggestion: {
            name: recipe.aiNameSuggestion,
            ingredients: recipe.aiIngredientsSuggestion,
            isPartial: !recipe.aiNameSuggestion || !recipe.aiIngredientsSuggestion
          }
        });
      } catch (error) {
        this.setData({
          editLoadFailed: true,
          errorMessage: "原菜谱加载失败，请返回上一页后重试"
        });
      }
    }
  },

  onShow() {
    const app = getApp();
    requireLogin(app, this.getLoginRedirect());
  },

  getLoginRedirect() {
    if (this.data.mode === "edit" && this.data.recipeId) {
      return `/pages/upload/upload?mode=edit&recipeId=${this.data.recipeId}`;
    }

    return "/pages/upload/upload";
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`form.${field}`]: e.detail.value
    });
  },

  onCategoryTap(e) {
    this.setData({
      "form.category": e.currentTarget.dataset.category
    });
  },

  async onChooseImage() {
    const tempFilePath = await chooseRecipeImage();
    const photoUrl = await uploadRecipeImage(tempFilePath);
    this.setData({
      "form.photoUrl": photoUrl,
      aiSuggestion: { name: "", ingredients: "", isPartial: false },
      aiMessage: "",
      errorMessage: ""
    });
  },

  async onRecognizeTap() {
    if (!this.data.form.photoUrl) {
      this.setData({ errorMessage: "请先上传菜品照片" });
      return;
    }

    this.setData({ recognizing: true, errorMessage: "", aiMessage: "" });
    try {
      const result = await recognizeRecipeFromImage(this.data.form.photoUrl);
      const suggestion = mapRecognitionResult(result.result);
      const aiMessage = suggestion.warning
        ? `AI识别未返回完整结果（${suggestion.warning}），可手动填写后继续发布`
        : suggestion.isPartial
          ? "识别结果不完整，请手动补充缺少的菜名或食材"
          : "识别完成，已自动回填，你仍可继续修改";

      this.setData({
        aiSuggestion: suggestion,
        "form.name": suggestion.name || this.data.form.name,
        "form.ingredients": suggestion.ingredients || this.data.form.ingredients,
        aiMessage
      });
    } catch (error) {
      this.setData({ aiMessage: "AI识别失败，不影响发布，可手动填写后直接发布" });
    } finally {
      this.setData({ recognizing: false });
    }
  },

  async onSubmit() {
    if (this.data.editLoadFailed) {
      this.setData({ errorMessage: "原菜谱加载失败，请返回上一页后重试" });
      return;
    }

    const payload = buildRecipePayload(this.data.form);
    const check = validateRecipePayload(payload);
    if (!check.ok) {
      this.setData({ errorMessage: check.message });
      return;
    }

    this.setData({ submitting: true });
    try {
      const functionName = this.data.mode === "edit" ? "updateRecipe" : "createRecipe";
      const submitData = {
        ...payload,
        aiNameSuggestion: this.data.aiSuggestion.name,
        aiIngredientsSuggestion: this.data.aiSuggestion.ingredients
      };

      if (this.data.mode === "edit") {
        submitData.recipeId = this.data.recipeId;
      }

      await wx.cloud.callFunction({
        name: functionName,
        data: submitData
      });

      if (this.data.mode === "edit") {
        this.setData({
          submitting: false,
          errorMessage: ""
        });
        wx.redirectTo({ url: `/pages/recipe-detail/recipe-detail?recipeId=${this.data.recipeId}` });
        return;
      }

      this.setData({
        form: {
          name: "",
          ingredients: "",
          photoUrl: "",
          category: UPLOAD_CATEGORIES[0]
        },
        aiSuggestion: { name: "", ingredients: "", isPartial: false },
        submitting: false,
        errorMessage: "",
        aiMessage: ""
      });
      wx.switchTab({ url: "/pages/discover/discover" });
    } catch (error) {
      this.setData({ submitting: false, errorMessage: "发布失败，请稍后重试" });
    }
  }
});
