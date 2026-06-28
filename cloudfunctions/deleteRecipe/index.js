const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const recipes = db.collection("recipes");
  const { data } = await recipes.where({ _id: event.recipeId, ownerUserId: OPENID }).limit(1).get();

  if (data.length === 0) {
    throw new Error("Recipe not found or no permission");
  }

  await recipes.doc(event.recipeId).remove();

  return { recipeId: event.recipeId };
};
