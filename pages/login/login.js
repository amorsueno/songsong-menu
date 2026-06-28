const { loginWithWechat, saveUser } = require("../../services/auth");
const { validateNickname } = require("../../utils/validators");

Page({
  data: {
    nickname: "",
    loading: false,
    errorMessage: ""
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
      wx.switchTab({ url: "/pages/discover/discover" });
    } catch (error) {
      this.setData({ errorMessage: "登录失败，请稍后再试" });
    } finally {
      this.setData({ loading: false });
    }
  }
});
