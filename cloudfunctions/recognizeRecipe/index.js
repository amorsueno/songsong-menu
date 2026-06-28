const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const photoUrl = event.photoUrl;
  const endpoint = process.env.AI_RECOGNIZE_ENDPOINT;
  const apiKey = process.env.AI_RECOGNIZE_API_KEY;

  if (!endpoint || !apiKey) {
    return {
      name: "",
      ingredients: "",
      warning: "AI service not configured"
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ photoUrl })
  });

  if (!response.ok) {
    return {
      name: "",
      ingredients: "",
      warning: `AI request failed: ${response.status}`
    };
  }

  const data = await response.json();
  return {
    name: data.name || "",
    ingredients: data.ingredients || "",
    warning: ""
  };
};
