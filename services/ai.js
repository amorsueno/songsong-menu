async function recognizeRecipeFromImage(photoUrl) {
  return wx.cloud.callFunction({
    name: "recognizeRecipe",
    data: { photoUrl }
  });
}

function mapRecognitionResult(result) {
  const name = result.name || "";
  const ingredients = result.ingredients || "";

  return {
    name,
    ingredients,
    isPartial: !name || !ingredients
  };
}

module.exports = {
  recognizeRecipeFromImage,
  mapRecognitionResult
};
