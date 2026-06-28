function normalizeIngredients(value) {
  return value
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join("、");
}

function formatRecipeDate(value, prefix) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${prefix} ${year}.${month}.${day}`;
}

module.exports = {
  formatRecipeDate,
  normalizeIngredients
};
