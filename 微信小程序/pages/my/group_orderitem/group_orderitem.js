// pages/my/group_orderitem/group_orderitem.js
var app = getApp()
var config = require('../../../config');
var t = Math.random();

Page({
  data: {
    userInfo: {},
    OrderItem: {},
    toid: 0,
    hiddenLoading: false,
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      toid: options.toid
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
    let userId = that.data.userInfo.Uid || 0;
    if (userId <= 0) {
      wx.switchTab({
        url: '../../index/index'
      })
      return;
    }
    that.getorderlistData(userId);
  },
  // 获取订单列表数据
  getorderlistData: function (userId) {
    var that = this;
    let toid = that.data.toid || 0;
    var that = this;
    wx.request({
      url: config.host + '/UserTeam/getTeamOrderInfoData.htm?t=' + t,
      data: { toid: toid, userId: userId },
      header: { 'content-type': 'application/json' },
      success: function (res) {
        if (res.statusCode != 200) {
          return;
        }
        that.setData({
          OrderItem: res.data.OrderItem
        })
      },
      complete: function () {
        that.setData({
          hiddenLoading: true
        })
      }
    })
  },

  // 跳转至商品详情页
  urlProitem: function (e) {
    let tpid = e.currentTarget.dataset.tpid || 0;
    wx.navigateTo({
      url: '../../product/group_proitem/group_proitem?tpid=' + tpid
    })
  },

  // 跳转至团详情
  urlGroupitem: function (e) {
    let toid = e.currentTarget.dataset.toid || 0;
    wx.navigateTo({
      url: '../../product/group_item/group_item?toid=' + toid
    })
  },

  // 跳转至中奖详情
  urlWinitem: function (e) {
    let tpid = e.currentTarget.dataset.tpid || 0;
    wx.navigateTo({
      url: '../lottery_winitem/lottery_winitem?tpid=' + tpid
    })
  },

  //确认收货跳转
  gotoConfimOrder: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认收货需跳转到商城订单详情页面操作，确认跳转？',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          wx.reLaunch({
            url: '../order_detail/index'
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  Copywaybill: function (e) {
    wx.setClipboardData({
      data: 'data',
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            console.log(res.data) // data
          }
        })
      }
    })
  },

  //取消订单询问
  closeOrder: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定取消订单么？',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          that.closeOrderSubmit(e);
        } else if (res.cancel) {
          //console.log('用户点击取消')
        }
      }
    })
  },
  //取消订单
  closeOrderSubmit: function (e) {
    var that = this;
    let toid = e.currentTarget.dataset.toid || 0;
    let userId = that.data.userInfo.Uid || 0;
    wx.request({
      url: config.host + '/UserTeam/CloseTeamOrder.htm',
      data: { toId: toid, userId: userId },
      header: { 'content-type': 'application/json' },
      success: function (res) {
        if (res.statusCode != 200) {
          wx.showToast({
            title: '服务器请求异常',
            icon: 'loading',
            duration: 1000
          });
          return;
        }
        if (res.data.success) {
          wx.showToast({
            title: '订单已取消',
            icon: 'sucess',
            duration: 1000
          });
          t = Math.random();
          that.getorderlistData();
        } else {
          wx.showToast({
            title: '操作失败',
            icon: 'loading',
            duration: 1000
          });
        }
      }
    })
  },

  //支付请求
  gotoPayment: function (e) {
    var that = this;
    let fromid = e.detail.formId;
    let oid = e.currentTarget.dataset.toid || 0;
    let userId = that.data.userInfo.Uid;
    let openid = that.data.userInfo.Openid;

    wx.request({
      url: config.host + '/UserTeam/PayMoneyRequest.htm',
      method: 'POST',
      data: { oid: oid, userId: userId, openid: openid, Form_Id: fromid },
      header: { 'content-type': 'application/json' },
      success: function (res) {
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
      fail: function () {
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
        wx.redirectTo({
          url: 'index'
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
  
  // 拨打电话
  callmeTap: function () {
    wx.makePhoneCall({
      phoneNumber: '4006960618',
    })
  },
  // 查看订单详情
  gotoMyOrder:function(e){
    let oid = e.currentTarget.dataset.oid || 0;
    wx.navigateTo({
      url: '../order_detail/index?oid=' + oid
    })
  }

})