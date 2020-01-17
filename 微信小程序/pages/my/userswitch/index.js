var app = getApp()
var config = require('../../../config');
var cache = require('../../../utils/wcache.js');
Page({
  data: {
    Uid: 0,
    hiddenLoading: false,
    user: []//当前账号
  },
  onLoad: function(options) {
    if (options.uid&&options.uid!=0) {
      var that = this;
      var user = wx.getStorageSync('UserInfo');
      that.setData({
        Uid: options.uid,
        user: user
      });
      that.GetUserinfo();
    } else {
      wx.showModal({
        title: '提示',
        content: '无其他账号，不能切换',
        icon: 'success',
        confirmText: "确定",
        success: function(res) {
          wx.switchTab({
            url: '../index'
          })
        }
      })
    }
  },
  GetUserinfo: function() {
    var that = this;
    var Uid = that.data.Uid
    wx.request({
      url: config.ucHost + '/GetUserInfo.htm',
      method: 'POST',
      data: {
        MemberId: Uid
      },
      success: function(result) {
        console.log(result.data)
        if (result.statusCode != 200) {
          return;
        }
        if (result.data.Success) {
          var userInfo = result.data;//能切换的账号
          that.setData({
            userInfo: userInfo,
            hiddenLoading: true
          });
        }
      },
      complete: function() {
        //that.onShow();
      }
    })
  },
  getswith: function() {
    var that = this;
    var userInfo = that.data.userInfo;
    wx.setStorageSync('UserInfo', userInfo);
    wx.switchTab({
      url: '../index'
    })
  },
  //跳转到我的
  navigateIndex: function() {
    wx.switchTab({
      url: '../index'
    })
  },

})