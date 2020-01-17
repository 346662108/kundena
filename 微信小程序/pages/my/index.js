//index.js
var app = getApp()
var config = require('../../config');
var cache = require('../../utils/wcache.js');

//获取应用实例
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    userInfo: {},
    navigation: false,
    items: {
      text: '我的订单',
      msg: '全部订单'
    },
    /* 导航数据 */
    nav: [{
        tid: 0,
        icon: 'cuIcon-form',
        text: '全部订单',
        shownum: false,
        num: '0'
      },
      {
        tid: 1,
        icon: 'cuIcon-pay',
        text: '待付款',
        shownum: false,
        num: '0'
      },
      {
        tid: 2,
        icon: 'cuIcon-send',
        text: '待发货',
        shownum: false,
        num: '0'
      },
      {
        tid: 3,
        icon: 'cuIcon-deliver',
        text: '运输中',
        shownum: false,
        num: '0',
      },
      {
        tid: 4,
        icon: 'cuIcon-squarecheck',
        text: '已完成',
        shownum: false,
        num: '0',
      },
      {
        tid: 5,
        icon: 'cuIcon-refund',
        text: '退换/退款',
        shownum: false,
        num: '0',
      }
    ],
    couponCount: 0,
    hiddenLoading: false,
    uid: 0
  },
  onLoad: function() {
    // var that = this
    // that.getUserInfo();
  },
  onShow: function() {
    var that = this
    that.getUserInfo();
  },
  getUserInfo: function() {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo) {
      console.log(userInfo)
      that.setData({
        userInfo: userInfo
      });
      that.getMenuData();
      that.getuserCount();
    })
  },
  getuserCount: function() {
    var that = this;
    var user = that.data.userInfo;
    wx.request({
      url: config.ucHost + '/login/UserSwitch.htm',
      method: 'POST',
      data: {
        openid: user.Openid,
        uid: user.Uid
      },
      success: function(result) {
        if (result.statusCode != 200) {
          return;
        }
        if (result.data.Success) {
          that.setData({
            uid: result.data.Uid
          })
        }
      }
    })
  },
  getMenuData: function() {
    var that = this;
    var userId = that.data.userInfo.Uid || 0;
    if (userId <= 0) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '会员登录异常,返回首页',
        success: function(res) {
          if (res.confirm) {
            //console.log('用户点击确定')
            wx.switchTab({
              url: '../index/index'
            })
          }
        }
      })
      return;
    }
    // var myIndexJson = cache.get('MyIndexJson');
    // if (myIndexJson) {
    //   that.setData({
    //     //nav: myIndexJson.menuList,
    //     couponCount: myIndexJson.couponCount
    //   })
    //   myIndexJson.menuList.forEach(function(item, index) {
    //     if (that.data.nav[index].tid == item.tid) {
    //       that.data.nav[index].shownum = item.shownum
    //       that.data.nav[index].num = item.num
    //     }
    //   });
    //   var data = that.data.nav;
    //   that.setData({
    //     nav: data
    //   })
    //   return;
    // }
    wx.request({
      url: config.host + '/User/Index.htm',
      data: {
        UserId: userId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.statusCode != 200) {
          console.log("服务器请求异常", res);
          return;
        }
        if (res.data.success) {
          that.setData({
            //nav: res.data.menuList,
            couponCount: res.data.couponCount
          });
          res.data.menuList.forEach(function(item, index) {
            if (that.data.nav[index].tid == item.tid) {
              that.data.nav[index].num = item.num
              that.data.nav[index].shownum = item.shownum
            }
          });
          var data = that.data.nav;
          that.setData({
            nav: data,
            hiddenLoading: true
          })
          //cache.put('MyIndexJson', res.data, 600);
        }
      },
      fail: function() {
        //console.log("获得失败");
      },
      complete: function() {
        //console.log("获得结束");
      }
    })
  },
  onPullDownRefresh: function() {
    var that = this;
    wx.stopPullDownRefresh()
    var userId = that.data.userInfo.Uid || 0;
    wx.removeStorageSync('UserInfo');
    if (userId > 0) {
      //cache.remove('MyIndexJson');
      that.getMenuData();
      that.GetUserData(userId);
    }
  },
  //获取用户信息
  GetUserData: function(userId) {
    var that = this;
    wx.request({
      url: config.ucHost + '/login/GetUserInfo.htm',
      method: 'POST',
      data: {
        MemberId: userId
      },
      success: function(result) {
        if (result.statusCode != 200) {
          return;
        }
        if (result.data.Success) {
          var userInfo = result.data;
          wx.setStorageSync('UserInfo', userInfo);
          console.log(userInfo)
        }
      },
      complete: function() {
        //that.onShow();
      }
    })
  },
  //跳转到订单列表
  onorder: function(e) {
    var tid = e.currentTarget.dataset.tid || 0;
    wx.navigateTo({
      url: 'order_list/index?tid=' + tid
    })
  },
  //佣金明细
  gotocommission: function() {
    wx.navigateTo({
      url: 'commission/index'
    })
  },
  //绑定手机号
  editLink: function() {
    wx.navigateTo({
      url: '../../../user/edit/edit?type=2'
    })
  },
  //账户资料
  userDateLink: function() {
    wx.navigateTo({
      url: '../../../user/user'
    })
  },
  //跳转到收货地址列表
  gotoaddresslist: function() {
    wx.navigateTo({
      url: '../cart/address_list/index?pageIndex=1&my=true'
    })
  },

  //跳转到我的优惠券
  navigateMycoupon: function() {
    wx.navigateTo({
      url: '../my/coupon/index'
    })
  },

  //跳转到我的拼团
  urlGrouporder: function() {
    wx.navigateTo({
      url: 'group_orderlist/group_orderlist'
    })
  },

  //跳转到我的抽奖
  urlGrouplottery: function() {
    wx.navigateTo({
      url: 'lottery_list/lottery_list'
    })
  },

  //跳转到退款售后
  urlService: function() {
    wx.navigateTo({
      url: 'repair_list/repair_list'
    })
  },

  //实名认证
  gotoattest: function() {
    wx.navigateTo({
      url: 'attest/index'
    })
  },
  //判断是切换还是授权登录
  UserSwith: function() {
    var that = this;
    var user = that.data.userInfo;
    if (that.data.uid > 0) {
      wx.navigateTo({
        url: '../my/userswitch/index?uid=' + that.data.uid
      })
    } else {
      wx.navigateTo({
        url: '/pages/auth/index'
      })
    }
  }
})