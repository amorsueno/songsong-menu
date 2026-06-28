const { loadStoredUser } = require("./services/auth");

App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({ traceUser: true });
    }

    this.globalData.user = loadStoredUser();
  },
  globalData: {
    user: null,
    categories: ["全部", "家常菜", "汤羹", "快手菜", "轻食"]
  }
});
