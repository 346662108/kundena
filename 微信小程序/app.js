//app.js
var config = require('config');
var isRunLogin = false;
App({
  onLaunch: function() {
    //调用API从本地缓存中获取数据
    //var logs = wx.getStorageSync('logs') || []
    //logs.unshift(Date.now())
    //wx.setStorageSync('logs', logs),
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })
  },
  getUserInfo: function(cb) {
    var that = this;
    wx.checkSession({
      success: function() {
        //session 未过期，并且在本生命周期一直有效
        var userInfo = wx.getStorageSync('UserInfo');
        if (userInfo) {
          typeof cb == "function" && cb(userInfo);
        } else {
          //console.log("缓存里取会员基础信息异常，重新调用登录");
          //调用微信登录接口
          that.WxLogin(cb);
        }
      },
      fail: function() {
        //登录态过期，调用微信登录接口
        that.WxLogin(cb);
      }
    })
  },
  //获取用户信息
  GetUserData: function (cb,userId) {
    var that = this;
    wx.request({
      url: config.ucHost + '/Login/GetUserInfo.htm',
      method: 'POST',
      data: {
        MemberId: userId
      },
      success: function (result) {
        if (result.statusCode != 200) {
          return;
        }
        if (result.data.Success) {
          var userInfo = result.data;

          wx.setStorageSync('UserInfo', userInfo);
          typeof cb == "function" && cb(userInfo)
        }
      },
      complete: function () {
      }
    })
  },
  WxLogin: function(cb) {
    var that = this;
    wx.login({
      success: function(res) {
        if (res.code) {
          //console.log('获取用户登录态成功！' + res.code);
          //调用服务端登录
          that.HbLogin(res, cb);
        } else {
          //console.log('获取用户登录态失败！' + res.errMsg);
        }
      }
    })
  },
  HbLogin: function(res, cb) {
    var that = this;
    if (isRunLogin) return;
    isRunLogin = true;
    //发起网络请求
    wx.request({
      url: config.ucHost + '/Login/NewLogin.htm',
      method: 'POST',
      data: {
        code: res.code
      },
      success: function(result) {
        if (result.statusCode != 200) {
          //console.log("服务器请求异常", res);
          return;
        }
        if (result.data.Success) {
          var userInfo = result.data;
          wx.setStorageSync('UserInfo', userInfo);
          typeof cb == "function" && cb(userInfo)
        } else {
          //console.log('服务端登录异常');
        }
      },
      complete: function() {
        isRunLogin = false;
      }
    })
  },
  //转发
  showShare: function() {
    wx.showShareMenu({
      //withShareTicket: true
    })
  },
  // 适配iphoneX XS XR
  globalData: {
    isIphoneX: false,
    userInfo: null
  },
  onShow: function() {
    let that = this;
    wx.getSystemInfo({
      success: res => {
        // console.log('手机信息res'+res.model)  
        let modelmes = res.model;
        if (modelmes.search('iPhone X') != -1) {
          that.globalData.isIphoneX = true
        }
      }
    })
  }
})