// pages/my/lottery_winitem/lottery_winitem.js
var app = getApp()
var config = require('../../../config');

Page({
  data: {
    tpid: 0,
    userInfo: {},
    hiddenLoading: true,
    hiddenbuttomMsg: true,
    keyWord: '',
    teamLuck: {}
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      tpid: options.tpid || 0,
    })
    that.getUserInfo();
  },
  //检查登录
  getUserInfo: function () {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //console.log(userInfo)
      that.setData({
        userInfo: userInfo
      });
      //登录成功
      that.loginSuccess();
    })
  },
  //登录成功
  loginSuccess: function () {
    var that = this;
    let userId = that.data.userInfo.Uid || 0;
    if (userId <= 0) {
      wx.switchTab({
        url: '../../index/index'
      })
      return;
    }
    that.getorderLuckData(userId);
  },
  // 获取订单列表数据
  getorderLuckData: function (userId) {
    var that = this;
    let tpid = that.data.tpid || 0;
    var that = this;
    wx.request({
      url: config.host + '/UserTeam/GetTeamLotteryLuckyList.htm',
      data: { tpid: tpid, userId: userId },
      header: { 'content-type': 'application/json' },
      success: function (res) {
        if (res.statusCode != 200) {
          return;
        }
        that.setData({
          teamLuck: res.data
        })
      },
      complete: function () {
        that.setData({
          hiddenLoading: true
        })
      }
    })
  },


})