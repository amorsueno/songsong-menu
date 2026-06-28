const cloud = require("wx-server-sdk");
const { buildProviderConfig, recognizeRecipe } = require("./provider");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  return recognizeRecipe({
    photoUrl: event.photoUrl,
    providerConfig: buildProviderConfig(process.env)
  });
};
