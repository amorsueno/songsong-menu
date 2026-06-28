function validateNickname(value) {
  if (!value || !value.trim()) {
    return { ok: false, message: "请输入昵称" };
  }
  return { ok: true };
}

function validateRecipePayload(payload) {
  if (!payload.photoUrl) {
    return { ok: false, message: "请上传菜品照片" };
  }
  if (!payload.name || !payload.name.trim()) {
    return { ok: false, message: "请输入菜名" };
  }
  if (!payload.ingredients || !payload.ingredients.trim()) {
    return { ok: false, message: "请输入食材" };
  }
  return { ok: true };
}

module.exports = {
  validateNickname,
  validateRecipePayload
};
