const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const nickname = (event.nickname || "").trim();
  const users = db.collection("users");
  const existing = await users.where({ openId: OPENID }).limit(1).get();

  if (existing.data.length > 0) {
    return { user: existing.data[0], isNew: false };
  }

  const record = {
    openId: OPENID,
    nickname,
    avatarUrl: "",
    createdAt: db.serverDate()
  };

  const { _id } = await users.add({ data: record });
  return { user: { ...record, _id }, isNew: true };
};
