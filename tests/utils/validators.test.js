const { validateNickname, validateRecipePayload } = require("../../utils/validators");

describe("validators", () => {
  test("validateNickname rejects blank nickname", () => {
    expect(validateNickname("   ")).toEqual({
      ok: false,
      message: "请输入昵称"
    });
  });

  test("validateRecipePayload rejects empty recipe fields", () => {
    expect(
      validateRecipePayload({
        name: "",
        ingredients: "",
        photoUrl: ""
      })
    ).toEqual({
      ok: false,
      message: "请上传菜品照片"
    });
  });
});
