const { requireLogin } = require("../../services/auth");
const { validateRecipePayload } = require("../../utils/validators");
const { chooseRecipeImage, uploadRecipeImage, buildRecipePayload } = require("../../services/upload");
const { recognizeRecipeFromImage, mapRecognitionResult } = require("../../services/ai");
const { RECIPE_CATEGORIES } = require("../../utils/constants");

const UPLOAD_CATEGORIES = RECIPE_CATEGORIES.filter((item) => item !== "全部");

Page({
  data: {
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
    errorMessage: "",
    aiMessage: ""
  },

  onShow() {
    const app = getApp();
    requireLogin(app, "/pages/upload/upload");
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
      this.setData({
        aiSuggestion: suggestion,
        "form.name": suggestion.name || this.data.form.name,
        "form.ingredients": suggestion.ingredients || this.data.form.ingredients,
        aiMessage: suggestion.isPartial
          ? "识别结果不完整，请手动补充缺少的菜名或食材"
          : "识别完成，已自动回填，你仍可继续修改"
      });
    } catch (error) {
      this.setData({ aiMessage: "AI识别失败，不影响发布，可手动填写后直接发布" });
    } finally {
      this.setData({ recognizing: false });
    }
  },

  async onSubmit() {
    const payload = buildRecipePayload(this.data.form);
    const check = validateRecipePayload(payload);
    if (!check.ok) {
      this.setData({ errorMessage: check.message });
      return;
    }

    this.setData({ submitting: true });
    try {
      await wx.cloud.callFunction({
        name: "createRecipe",
        data: {
          ...payload,
          aiNameSuggestion: this.data.aiSuggestion.name,
          aiIngredientsSuggestion: this.data.aiSuggestion.ingredients
        }
      });
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
