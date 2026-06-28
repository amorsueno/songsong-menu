function buildCollectionsConfig() {
  return {
    collections: [
      {
        name: "users",
        fields: ["openId", "nickname", "avatarUrl", "createdAt"]
      },
      {
        name: "recipes",
        fields: [
          "ownerUserId",
          "name",
          "ingredientsText",
          "photoUrl",
          "aiNameSuggestion",
          "aiIngredientsSuggestion",
          "category",
          "createdAt",
          "updatedAt"
        ]
      }
    ]
  };
}

function buildIndexesConfig() {
  return {
    indexes: [
      {
        collectionName: "users",
        fields: [{ name: "openId", order: "asc" }],
        note: "用于按 openId 查询用户，建议在控制台设置唯一约束"
      },
      {
        collectionName: "recipes",
        fields: [
          { name: "category", order: "asc" },
          { name: "createdAt", order: "desc" }
        ],
        note: "用于发现页分类浏览"
      },
      {
        collectionName: "recipes",
        fields: [
          { name: "ownerUserId", order: "asc" },
          { name: "createdAt", order: "desc" }
        ],
        note: "用于我的菜谱列表"
      }
    ]
  };
}

function buildPermissionsConfig() {
  return {
    permissions: [
      {
        collectionName: "users",
        read: "仅创建者和云函数可读",
        write: "仅云函数可写"
      },
      {
        collectionName: "recipes",
        read: "所有登录用户可读，云函数可读写",
        write: "仅云函数可写"
      }
    ]
  };
}

function buildCloudbaseFiles() {
  return {
    "cloudbase/collections.json": JSON.stringify(buildCollectionsConfig(), null, 2) + "\n",
    "cloudbase/indexes.json": JSON.stringify(buildIndexesConfig(), null, 2) + "\n",
    "cloudbase/permissions.json": JSON.stringify(buildPermissionsConfig(), null, 2) + "\n"
  };
}

module.exports = {
  buildCollectionsConfig,
  buildIndexesConfig,
  buildPermissionsConfig,
  buildCloudbaseFiles
};
