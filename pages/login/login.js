const { isTabPage, loginWithWechat, saveUser } = require("../../services/auth");
const { validateNickname } = require("../../utils/validators");

Page({
  data: {
    nickname: "",
    loading: false,
    errorMessage: "",
    redirect: "",
    registerHint: "首次登录会自动注册账号，后续可直接登录使用。"
  },

  onLoad(query) {
    this.setData({
      redirect: query.redirect ? decodeURIComponent(query.redirect) : "/pages/discover/discover"
    });
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value, errorMessage: "" });
  },

  async onLoginTap() {
    const check = validateNickname(this.data.nickname);
    if (!check.ok) {
      this.setData({ errorMessage: check.message });
      return;
    }

    this.setData({ loading: true });
    try {
      const app = getApp();
      const result = await loginWithWechat(this.data.nickname);
      saveUser(app, result.result.user);
      if (isTabPage(this.data.redirect)) {
        wx.switchTab({ url: this.data.redirect.split("?")[0] });
      } else {
        wx.redirectTo({ url: this.data.redirect });
      }
    } catch (error) {
      this.setData({ errorMessage: "登录失败，请稍后再试" });
    } finally {
      this.setData({ loading: false });
    }
  }
});
