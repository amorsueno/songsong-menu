App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({ traceUser: true });
    }
  },
  globalData: {
    user: null,
    categories: ["全部", "家常菜", "汤羹", "快手菜", "轻食"]
  }
});
