// pages/product/coupon/index.js
var app = getApp()
var config = require('../../../config');

Page({
  data: {
    showModalStatus: false,
    hiddenLoading: false,
    userInfo: {},
    pid: 0,
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      pid: options.pid
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
    that.getcouponlistData();
  },
  // 获取优惠券列表数据
  getcouponlistData: function () {
    var that = this;
    let pid = that.data.pid;
    let userId = that.data.userInfo.Uid || 0;
    var that = this;
    wx.request({
      url: config.host + '/getCanUseCouponData.htm',
      data: { pid: pid, uId: userId },
      header: { 'content-type': 'application/json' },
      success: function (res) {
        if (res.statusCode != 200) {
          return;
        }
        that.setData({
          canUseCoupons: res.data.canUseCoupons
        })
      },
      complete: function () {
        that.setData({
          hiddenLoading: true
        })
      }
    })
  },
  //领取优惠券
  GetShopCoupon: function (e) {
    var that = this;
    let shopcouponid = e.currentTarget.dataset.shopcouponid || 0;
    let userId = that.data.userInfo.Uid || 0;
    wx.request({
      url: config.host + '/GetShopCoupon.htm',
      data: { uId: userId, shopcouponid: shopcouponid },
      header: { 'content-type': 'application/json' },
      success: function (res) {
        if (res.statusCode != 200) {
          return;
        }
        if (res.data.Success) {
          wx.showToast({
            title: '成功领取',
            icon: 'loading',
            duration: 1000
          });
          that.getcouponlistData();
        }
      },
    })

  },
  gotoShopping: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  powerDrawer: function (e) {
    var exclude = e.currentTarget.dataset.exclude;
    this.setData({
      excludeAreaNameStr: exclude
    })

    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200, //动画时长 
      timingFunction: "ease", //线性 
      delay: 0 //0则不延迟 
    });

    // 第2步：这个动画实例赋给当前的动画实例 
    this.animation = animation;

    // 第3步：执行第一组动画 
    animation.opacity(0).step();

    // 第4步：导出动画对象赋给数据对象储存 
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      })

      //关闭 
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)

    // 显示 
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
  },
  onShareAppMessage: function (res) {
    var that = this;
    if (res && res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '优惠券列表',
      path: 'pages/product/coupon/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }

})