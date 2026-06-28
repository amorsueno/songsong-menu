async function loginWithWechat(nickname) {
  return wx.cloud.callFunction({
    name: "login",
    data: { nickname }
  });
}

function saveUser(app, user) {
  app.globalData.user = user;
}

function requireLogin(app, redirect) {
  if (app.globalData.user) {
    return true;
  }

  wx.navigateTo({
    url: `/pages/login/login?redirect=${redirect}`
  });
  return false;
}

module.exports = {
  loginWithWechat,
  saveUser,
  requireLogin
};
