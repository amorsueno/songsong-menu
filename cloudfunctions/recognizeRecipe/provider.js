function buildProviderConfig(env) {
  return {
    provider: env.AI_RECOGNIZE_PROVIDER || "generic",
    endpoint: env.AI_RECOGNIZE_ENDPOINT || "",
    apiKey: env.AI_RECOGNIZE_API_KEY || "",
    model: env.AI_RECOGNIZE_MODEL || ""
  };
}

function notConfiguredResult() {
  return {
    name: "",
    ingredients: "",
    warning: "AI service not configured"
  };
}

function unsupportedProviderResult(provider) {
  return {
    name: "",
    ingredients: "",
    warning: `Unsupported AI provider: ${provider}`
  };
}

function normalizeRecognitionResult(data) {
  return {
    name: data.name || "",
    ingredients: data.ingredients || "",
    warning: data.warning || ""
  };
}

async function callGenericProvider({ photoUrl, providerConfig, fetchImpl }) {
  const response = await fetchImpl(providerConfig.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${providerConfig.apiKey}`
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

  return normalizeRecognitionResult(await response.json());
}

async function callOpenAIResponsesProvider({ photoUrl, providerConfig, fetchImpl }) {
  const response = await fetchImpl(providerConfig.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${providerConfig.apiKey}`
    },
    body: JSON.stringify({
      model: providerConfig.model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "请识别图片中的菜名和主要食材，并返回 JSON：{\"name\":\"\",\"ingredients\":\"食材1、食材2\"}"
            },
            {
              type: "input_image",
              image_url: photoUrl
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_object"
        }
      }
    })
  });

  if (!response.ok) {
    return {
      name: "",
      ingredients: "",
      warning: `AI request failed: ${response.status}`
    };
  }

  const data = await response.json();

  try {
    const parsed = JSON.parse(data.output_text || "{}");
    return normalizeRecognitionResult(parsed);
  } catch (error) {
    return {
      name: "",
      ingredients: "",
      warning: "AI response could not be parsed"
    };
  }
}

async function recognizeRecipe({ photoUrl, providerConfig, fetchImpl = fetch }) {
  if (!providerConfig.endpoint || !providerConfig.apiKey) {
    return notConfiguredResult();
  }

  if (providerConfig.provider === "generic") {
    return callGenericProvider({ photoUrl, providerConfig, fetchImpl });
  }

  if (providerConfig.provider === "openai_responses") {
    return callOpenAIResponsesProvider({ photoUrl, providerConfig, fetchImpl });
  }

  return unsupportedProviderResult(providerConfig.provider);
}

module.exports = {
  buildProviderConfig,
  recognizeRecipe
};
