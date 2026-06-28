const { formatRecipeDate } = require("../utils/formatters");

function fetchRecipes(category) {
  return wx.cloud.callFunction({
    name: "getRecipes",
    data: { category }
  });
}

function fetchMyRecipes() {
  return wx.cloud.callFunction({
    name: "getMyRecipes",
    data: {}
  });
}

function fetchRecipeDetail(recipeId) {
  return wx.cloud.callFunction({
    name: "getRecipeDetail",
    data: { recipeId }
  });
}

function deleteRecipe(recipeId) {
  return wx.cloud.callFunction({
    name: "deleteRecipe",
    data: { recipeId }
  });
}

function mapRecipeCard(item) {
  return {
    id: item._id,
    title: item.name,
    summary: item.ingredientsText,
    photoUrl: item.photoUrl
  };
}

function mapRecipeDetail(item) {
  return {
    id: item._id,
    title: item.name,
    ingredients: item.ingredientsText,
    photoUrl: item.photoUrl,
    category: item.category || "家常菜",
    ownerUserId: item.ownerUserId || "",
    aiNameSuggestion: item.aiNameSuggestion || "",
    aiIngredientsSuggestion: item.aiIngredientsSuggestion || "",
    createdAtText: formatRecipeDate(item.createdAt, "创建于"),
    updatedAtText: formatRecipeDate(item.updatedAt, "更新于")
  };
}

module.exports = {
  deleteRecipe,
  fetchRecipes,
  fetchMyRecipes,
  fetchRecipeDetail,
  mapRecipeCard,
  mapRecipeDetail
};
