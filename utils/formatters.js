function normalizeIngredients(value) {
  return value
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join("、");
}

module.exports = {
  normalizeIngredients
};
