describe("login page", () => {
  let pageConfig;
  let loginWithWechat;
  let saveUser;
  let validateNickname;

  function createPageInstance() {
    return {
      data: JSON.parse(JSON.stringify(pageConfig.data)),
      setData(update) {
        this.data = {
          ...this.data,
          ...update
        };
      },
      onLoad: pageConfig.onLoad,
      onLoginTap: pageConfig.onLoginTap
    };
  }

  beforeEach(() => {
    jest.resetModules();
    pageConfig = null;

    global.Page = (config) => {
      pageConfig = config;
    };

    global.wx = {
      switchTab: jest.fn(),
      redirectTo: jest.fn()
    };

    global.getApp = jest.fn(() => ({
      globalData: {
        user: null
      }
    }));

    jest.doMock("../../services/auth", () => {
      loginWithWechat = jest.fn();
      saveUser = jest.fn();

      return {
        loginWithWechat,
        saveUser
      };
    });

    jest.doMock("../../utils/validators", () => {
      validateNickname = jest.fn();
      return { validateNickname };
    });
  });

  afterEach(() => {
    delete global.Page;
    delete global.wx;
    delete global.getApp;
  });

  test("page explains that first login creates the account automatically", () => {
    require("../../pages/login/login");

    expect(pageConfig.data.registerHint).toBe("首次登录会自动注册账号，后续可直接登录使用。");
  });

  test("onLoad defaults redirect to discover page", () => {
    require("../../pages/login/login");
    const page = createPageInstance();

    page.onLoad.call(page, {});

    expect(page.data.redirect).toBe("/pages/discover/discover");
  });

  test("successful login to discover uses switchTab", async () => {
    require("../../pages/login/login");
    const page = createPageInstance();

    page.data.nickname = "淞淞";
    page.data.redirect = "/pages/discover/discover";
    validateNickname.mockReturnValue({ ok: true });
    loginWithWechat.mockResolvedValue({
      result: {
        user: { nickname: "淞淞" }
      }
    });

    await page.onLoginTap.call(page);

    expect(saveUser).toHaveBeenCalled();
    expect(wx.switchTab).toHaveBeenCalledWith({ url: "/pages/discover/discover" });
    expect(wx.redirectTo).not.toHaveBeenCalled();
  });

  test("successful login back to protected page uses redirectTo", async () => {
    require("../../pages/login/login");
    const page = createPageInstance();

    page.data.nickname = "淞淞";
    page.data.redirect = "/pages/upload/upload";
    validateNickname.mockReturnValue({ ok: true });
    loginWithWechat.mockResolvedValue({
      result: {
        user: { nickname: "淞淞" }
      }
    });

    await page.onLoginTap.call(page);

    expect(wx.redirectTo).toHaveBeenCalledWith({ url: "/pages/upload/upload" });
    expect(wx.switchTab).not.toHaveBeenCalled();
  });
});
