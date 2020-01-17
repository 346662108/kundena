// pages/cart/payment/payment.js
var app = getApp()
var config = require('../../../config');
var t = Math.random();
Page({

  data: {
    userInfo: {},
    orderInfo: {},
    oid: 0,
    hiddenLoading: false,
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      oid: options.oid
    })
  },
  /* 调用数据 */
  onShow: function () {
    var that = this;
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
    var userId = that.data.userInfo.Uid || 0;
    if (userId <= 0) {
      wx.switchTab({
        url: '../../index/index'
      })
      return;
    }
    that.getorderlistData();
  },
  // 获取订单列表数据
  getorderlistData: function () {
    var that = this;
    let oid = that.data.oid || 0;
    let userId = that.data.userInfo.Uid || 0;
    var that = this;
    wx.request({
      url: config.host + '/User/getOrderInfoData.htm?t=' + t,
      data: { oid: oid, userId: userId },
      header: { 'content-type': 'application/json' },
      success: function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          return;
        }
        that.setData({
          orderInfo: res.data.OrderItem
        })
      },
      complete: function () {
        that.setData({
          hiddenLoading: true
        })
      }
    })
  },
  gotoPayment: function(e) {
    var that = this;
    let oid = that.data.oid || 0;
    let userId = that.data.userInfo.Uid;
    let openid = that.data.userInfo.Openid;
    console.log(oid)
    console.log(userId)
    console.log(openid)
    wx.request({
      url: config.host + '/PayMoneyRequest.htm',
      method: 'POST',
      data: {
        oid: oid,
        userId: userId,
        openid: openid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.statusCode != 200) {
          wx.showToast({
            title: '服务器请求异常',
            icon: 'loading',
            duration: 2000
          });
          return;
        }
        if (res.data.success) {
          that.setPayment(res.data);
        } else {
          wx.showToast({
            title: '支付请求失败，请重试',
            icon: 'loading',
            duration: 2000
          });
        }
      },
      fail: function() {
        wx.showToast({
          title: '支付请求异常，请重试',
          icon: 'loading',
          duration: 2000
        });
      }
    })

  },
  //调用支付API
  setPayment: function (result) {
    console.log(result)
    var par = result.Parameters;
    //console.log("支付返回参数", par);
    wx.requestPayment({
      timeStamp: par.timeStamp,
      nonceStr: par.nonceStr,
      package: par.package,
      signType: par.signType,
      paySign: par.paySign,
      success: function (res) {
     
        var msg = '支付失败';
        if (res.errMsg == 'requestPayment:ok') {
          msg = '支付成功';
        }
        wx.showToast({
          title: msg,
          icon: 'success',
          duration: 2000
        });
        // wx.redirectTo({
        //   url: 'index'
        // })
        wx.switchTab({
          url: '../../my/index'
        })
      },
      fail: function (res) {
        var msg = '';
        if (res.errMsg == 'requestPayment:fail cancel') {
          msg = '您取消支付了！';
        } else {
          msg = '支付失败！';
        }
        wx.showToast({
          title: msg,
          icon: 'loading',
          duration: 2000
        });
      }
    })
  },
  /* 跳转页银行转账 */
  bankTransfer: function() {
    var oid=this.data.oid;
    wx.navigateTo({
      url: '../../cart/transfer/transfer?oid='+oid,
    })
  }
})