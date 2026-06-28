const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { data } = await db.collection("recipes").where({ _id: event.recipeId }).limit(1).get();

  if (data.length === 0) {
    throw new Error("Recipe not found");
  }

  return { item: data[0] };
};
