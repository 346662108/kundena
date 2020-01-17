// pages/cart/group_paytips/group_paytips.js
Page({
  data: {

  },

  onLoad: function (options) {
    var toid = options.toid||0;
  },

  // 跳转至订单详情
  saveMyCarts: function () {
    wx.redirectTo({
      url: '../../my/group_orderitem/group_orderitem'
    })
  },

})