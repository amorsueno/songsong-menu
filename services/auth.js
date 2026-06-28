const TAB_PAGE_PATHS = new Set([
  "/pages/discover/discover",
  "/pages/upload/upload",
  "/pages/my/my"
]);
const USER_STORAGE_KEY = "songsong-menu:user";

async function loginWithWechat(nickname) {
  return wx.cloud.callFunction({
    name: "login",
    data: { nickname }
  });
}

function saveUser(app, user) {
  app.globalData.user = user;
  wx.setStorageSync(USER_STORAGE_KEY, user);
}

function loadStoredUser() {
  return wx.getStorageSync(USER_STORAGE_KEY) || null;
}

function clearUser(app) {
  app.globalData.user = null;
  wx.removeStorageSync(USER_STORAGE_KEY);
}

function requireLogin(app, redirect) {
  if (app.globalData.user) {
    return true;
  }

  wx.navigateTo({
    url: `/pages/login/login?redirect=${encodeURIComponent(redirect)}`
  });
  return false;
}

function isTabPage(url) {
  return !url.includes("?") && TAB_PAGE_PATHS.has(url);
}

module.exports = {
  clearUser,
  isTabPage,
  loadStoredUser,
  loginWithWechat,
  saveUser,
  requireLogin
};
