const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const category = event.category || "全部";
  const collection = db.collection("recipes");
  const query = category === "全部" ? collection : collection.where({ category });
  const { data } = await query.orderBy("createdAt", "desc").limit(20).get();
  return { items: data };
};
