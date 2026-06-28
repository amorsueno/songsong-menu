const { formatRecipeDate, normalizeIngredients } = require("../../utils/formatters");

describe("formatters", () => {
  test("normalizeIngredients joins trimmed ingredient fragments", () => {
    expect(normalizeIngredients("鸡蛋, 番茄， 葱花")).toBe("鸡蛋、番茄、葱花");
  });

  test("formatRecipeDate converts iso date strings into recipe meta text", () => {
    expect(formatRecipeDate("2026-06-28T10:20:00.000Z", "创建于")).toBe("创建于 2026.06.28");
  });

  test("formatRecipeDate returns empty text when date is missing", () => {
    expect(formatRecipeDate("", "更新于")).toBe("");
  });
});
