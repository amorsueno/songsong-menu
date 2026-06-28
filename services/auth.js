async function loginWithWechat(nickname) {
  return wx.cloud.callFunction({
    name: "login",
    data: { nickname }
  });
}

function saveUser(app, user) {
  app.globalData.user = user;
}

module.exports = {
  loginWithWechat,
  saveUser
};
