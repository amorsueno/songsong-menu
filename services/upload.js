const { normalizeIngredients } = require("../utils/formatters");

async function chooseRecipeImage() {
  const result = await wx.chooseMedia({
    count: 1,
    mediaType: ["image"],
    sourceType: ["album", "camera"]
  });
  return result.tempFiles[0].tempFilePath;
}

async function uploadRecipeImage(filePath) {
  const cloudPath = `recipes/${Date.now()}.jpg`;
  const result = await wx.cloud.uploadFile({
    cloudPath,
    filePath
  });
  return result.fileID;
}

function buildRecipePayload(form) {
  return {
    name: form.name.trim(),
    ingredients: normalizeIngredients(form.ingredients),
    photoUrl: form.photoUrl
  };
}

module.exports = {
  chooseRecipeImage,
  uploadRecipeImage,
  buildRecipePayload
};
