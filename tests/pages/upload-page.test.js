describe("upload page", () => {
  let pageConfig;

  beforeEach(() => {
    jest.resetModules();
    pageConfig = null;
    global.Page = (config) => {
      pageConfig = config;
    };
  });

  afterEach(() => {
    delete global.Page;
  });

  test("page starts with empty recipe form", () => {
    require("../../pages/upload/upload");
    expect(pageConfig.data.form).toEqual({
      name: "",
      ingredients: "",
      photoUrl: ""
    });
  });

  test("page starts with empty ai suggestion state", () => {
    require("../../pages/upload/upload");
    expect(pageConfig.data.aiSuggestion).toEqual({
      name: "",
      ingredients: "",
      isPartial: false
    });
  });
});
