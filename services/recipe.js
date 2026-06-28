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

function mapRecipeCard(item) {
  return {
    id: item._id,
    title: item.name,
    summary: item.ingredientsText,
    photoUrl: item.photoUrl
  };
}

module.exports = {
  fetchRecipes,
  fetchMyRecipes,
  mapRecipeCard
};
