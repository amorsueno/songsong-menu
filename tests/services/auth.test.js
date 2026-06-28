global.wx = {
  navigateTo: jest.fn()
};

const { saveUser, requireLogin } = require("../../services/auth");

describe("auth service", () => {
  test("saveUser stores current user in app globalData", () => {
    const app = { globalData: { user: null } };
    const user = { nickname: "淞淞" };
    saveUser(app, user);
    expect(app.globalData.user).toEqual(user);
  });

  test("requireLogin redirects to login when user is missing", () => {
    const app = { globalData: { user: null } };
    const result = requireLogin(app, "/pages/upload/upload");
    expect(result).toBe(false);
    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: "/pages/login/login?redirect=/pages/upload/upload"
    });
  });

  test("requireLogin returns true when user exists", () => {
    const app = { globalData: { user: { nickname: "淞淞" } } };
    expect(requireLogin(app, "/pages/my/my")).toBe(true);
  });
});
