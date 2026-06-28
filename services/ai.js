async function recognizeRecipeFromImage(photoUrl) {
  return wx.cloud.callFunction({
    name: "recognizeRecipe",
    data: { photoUrl }
  });
}

function mapRecognitionResult(result) {
  const name = result.name || "";
  const ingredients = result.ingredients || "";
  const warning = result.warning || "";

  return {
    name,
    ingredients,
    isPartial: !name || !ingredients,
    warning
  };
}

module.exports = {
  recognizeRecipeFromImage,
  mapRecognitionResult
};
