global.wx = {
  cloud: {
    callFunction: jest.fn()
  }
};

const { mapRecognitionResult } = require("../../services/ai");

describe("ai recognition mapping", () => {
  test("empty recognition result becomes editable empty suggestions", () => {
    expect(mapRecognitionResult({})).toEqual({
      name: "",
      ingredients: "",
      isPartial: true
    });
  });

  test("complete recognition result returns suggestions", () => {
    expect(
      mapRecognitionResult({
        name: "红烧鸡翅",
        ingredients: "鸡翅、可乐、生姜"
      })
    ).toEqual({
      name: "红烧鸡翅",
      ingredients: "鸡翅、可乐、生姜",
      isPartial: false
    });
  });
});
