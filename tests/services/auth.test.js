global.wx = {
  getStorageSync: jest.fn(),
  navigateTo: jest.fn(),
  removeStorageSync: jest.fn(),
  setStorageSync: jest.fn()
};

const { clearUser, loadStoredUser, saveUser, requireLogin } = require("../../services/auth");

describe("auth service", () => {
  test("saveUser stores current user in app globalData", () => {
    const app = { globalData: { user: null } };
    const user = { nickname: "淞淞" };
    saveUser(app, user);
    expect(app.globalData.user).toEqual(user);
    expect(wx.setStorageSync).toHaveBeenCalledWith("songsong-menu:user", user);
  });

  test("requireLogin redirects to login when user is missing", () => {
    const app = { globalData: { user: null } };
    const result = requireLogin(app, "/pages/upload/upload");
    expect(result).toBe(false);
    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: "/pages/login/login?redirect=%2Fpages%2Fupload%2Fupload"
    });
  });

  test("requireLogin preserves query parameters in redirect target", () => {
    const app = { globalData: { user: null } };
    const result = requireLogin(app, "/pages/upload/upload?mode=edit&recipeId=recipe-1");
    expect(result).toBe(false);
    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: "/pages/login/login?redirect=%2Fpages%2Fupload%2Fupload%3Fmode%3Dedit%26recipeId%3Drecipe-1"
    });
  });

  test("requireLogin returns true when user exists", () => {
    const app = { globalData: { user: { nickname: "淞淞" } } };
    expect(requireLogin(app, "/pages/my/my")).toBe(true);
  });

  test("loadStoredUser returns locally cached user profile", () => {
    const user = { openId: "owner-1", nickname: "淞淞" };
    wx.getStorageSync.mockReturnValue(user);

    expect(loadStoredUser()).toEqual(user);
    expect(wx.getStorageSync).toHaveBeenCalledWith("songsong-menu:user");
  });

  test("clearUser removes current user from app state and local storage", () => {
    const app = { globalData: { user: { nickname: "淞淞" } } };

    clearUser(app);

    expect(app.globalData.user).toBe(null);
    expect(wx.removeStorageSync).toHaveBeenCalledWith("songsong-menu:user");
  });
});
