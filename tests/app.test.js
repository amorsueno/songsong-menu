describe("app bootstrap", () => {
  let appConfig;
  let loadStoredUser;

  beforeEach(() => {
    jest.resetModules();
    appConfig = null;

    global.App = (config) => {
      appConfig = config;
    };

    global.wx = {
      cloud: {
        init: jest.fn()
      }
    };

    jest.doMock("../services/auth", () => {
      loadStoredUser = jest.fn();
      return { loadStoredUser };
    });
  });

  afterEach(() => {
    delete global.App;
    delete global.wx;
  });

  test("onLaunch restores cached user profile after cloud init", () => {
    require("../app");
    loadStoredUser.mockReturnValue({
      openId: "owner-1",
      nickname: "淞淞"
    });

    appConfig.onLaunch();

    expect(wx.cloud.init).toHaveBeenCalledWith({ traceUser: true });
    expect(loadStoredUser).toHaveBeenCalled();
    expect(appConfig.globalData.user).toEqual({
      openId: "owner-1",
      nickname: "淞淞"
    });
  });
});
