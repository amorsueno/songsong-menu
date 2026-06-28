const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const recipe = {
    ownerUserId: OPENID,
    name: event.name,
    ingredientsText: event.ingredients,
    photoUrl: event.photoUrl,
    aiNameSuggestion: event.aiNameSuggestion || "",
    aiIngredientsSuggestion: event.aiIngredientsSuggestion || "",
    category: event.category || "家常菜",
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };

  const { _id } = await db.collection("recipes").add({ data: recipe });
  return { recipeId: _id };
};
