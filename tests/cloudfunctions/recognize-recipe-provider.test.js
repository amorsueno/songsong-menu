const {
  recognizeRecipe,
  buildProviderConfig
} = require("../../cloudfunctions/recognizeRecipe/provider");

describe("recognize recipe provider", () => {
  test("buildProviderConfig defaults to generic provider", () => {
    expect(
      buildProviderConfig({
        AI_RECOGNIZE_ENDPOINT: "https://example.com/recognize",
        AI_RECOGNIZE_API_KEY: "secret"
      })
    ).toEqual({
      provider: "generic",
      endpoint: "https://example.com/recognize",
      apiKey: "secret",
      model: ""
    });
  });

  test("missing endpoint or api key returns non-blocking warning", async () => {
    await expect(
      recognizeRecipe({
        photoUrl: "cloud://demo/recipe.jpg",
        providerConfig: buildProviderConfig({})
      })
    ).resolves.toEqual({
      name: "",
      ingredients: "",
      warning: "AI service not configured"
    });
  });

  test("generic provider posts photo url and returns normalized fields", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        name: "番茄炒蛋",
        ingredients: "番茄、鸡蛋"
      })
    });

    await expect(
      recognizeRecipe({
        photoUrl: "cloud://demo/recipe.jpg",
        providerConfig: buildProviderConfig({
          AI_RECOGNIZE_PROVIDER: "generic",
          AI_RECOGNIZE_ENDPOINT: "https://example.com/recognize",
          AI_RECOGNIZE_API_KEY: "secret"
        }),
        fetchImpl
      })
    ).resolves.toEqual({
      name: "番茄炒蛋",
      ingredients: "番茄、鸡蛋",
      warning: ""
    });

    expect(fetchImpl).toHaveBeenCalledWith("https://example.com/recognize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer secret"
      },
      body: JSON.stringify({
        photoUrl: "cloud://demo/recipe.jpg"
      })
    });
  });

  test("openai_responses provider sends image input and parses output_text JSON", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        output_text: "{\"name\":\"红烧鸡翅\",\"ingredients\":\"鸡翅、可乐、生姜\"}"
      })
    });

    await expect(
      recognizeRecipe({
        photoUrl: "cloud://demo/recipe.jpg",
        providerConfig: buildProviderConfig({
          AI_RECOGNIZE_PROVIDER: "openai_responses",
          AI_RECOGNIZE_ENDPOINT: "https://api.openai.com/v1/responses",
          AI_RECOGNIZE_API_KEY: "secret",
          AI_RECOGNIZE_MODEL: "gpt-5.5"
        }),
        fetchImpl
      })
    ).resolves.toEqual({
      name: "红烧鸡翅",
      ingredients: "鸡翅、可乐、生姜",
      warning: ""
    });

    expect(fetchImpl).toHaveBeenCalledWith("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer secret"
      },
      body: JSON.stringify({
        model: "gpt-5.5",
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
                image_url: "cloud://demo/recipe.jpg"
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
  });

  test("unknown provider returns warning instead of throwing", async () => {
    await expect(
      recognizeRecipe({
        photoUrl: "cloud://demo/recipe.jpg",
        providerConfig: buildProviderConfig({
          AI_RECOGNIZE_PROVIDER: "mystery",
          AI_RECOGNIZE_ENDPOINT: "https://example.com/recognize",
          AI_RECOGNIZE_API_KEY: "secret"
        })
      })
    ).resolves.toEqual({
      name: "",
      ingredients: "",
      warning: "Unsupported AI provider: mystery"
    });
  });
});
