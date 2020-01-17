// pages/my/order_detail/index.js
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
  onLoad: function(options) {
    var that = this;
    let isIphoneX = app.globalData.isIphoneX;
    that.setData({
      oid: options.oid,
      isIphoneX: isIphoneX,
    })
  },
  /* 调用数据 */
  onShow: function() {
    var that = this;
    that.getUserInfo();
  },
  //检查登录
  getUserInfo: function() {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo) {
      //console.log(userInfo)
      that.setData({
        userInfo: userInfo
      });
      //登录成功
      that.loginSuccess();
    })
  },
  //登录成功
  loginSuccess: function() {
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
  getorderlistData: function() {
    var that = this;
    let oid = that.data.oid || 0;
    let userId = that.data.userInfo.Uid || 0;
    var that = this;
    wx.request({
      url: config.host + '/User/getOrderInfoData.htm?t=' + t,
      data: {
        oid: oid,
        userId: userId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode != 200) {
          return;
        }
        that.setData({
          orderInfo: res.data.OrderItem
        })
      },
      complete: function() {
        that.setData({
          hiddenLoading: true
        })
      }
    })
  },

  // 跳转至详情页
  navigateDetail: function(e) {
    let pid = e.currentTarget.dataset.pid || 0;
    wx.navigateTo({
      url: '../../product/detail/index?pid=' + pid
    })
  },

  // 跳转至退款申请页
  gotoReturn: function(e) {
    let itemid = e.currentTarget.dataset.itemid || 0;
    wx.navigateTo({
      url: '../refund/index?itemid=' + itemid
    })
  },

  // 跳转至退款查询页
  gotoReturnDetail: function(e) {
    let itemid = e.currentTarget.dataset.itemid || 0;
    wx.navigateTo({
      url: '../refund_detail/index?itemid=' + itemid
    })
  },

  //取消订单询问
  closeOrder: function(e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定取消订单么？',
      cancelText: '不取消',
      success: function(res) {
        if (res.confirm) {
          that.closeOrderSubmit(e);
        } else if (res.cancel) {
          //console.log('用户点击取消')
        }
      }
    })
  },
  //取消订单
  closeOrderSubmit: function(e) {
    var that = this;
    let oid = e.currentTarget.dataset.oid || 0;
    let userId = that.data.userInfo.Uid || 0;
    wx.request({
      url: config.host + '/User/CloseOrder.htm',
      data: {
        oid: oid,
        userId: userId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
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
  //确认收货
  gotoConfimOrder: function(e) {
    var that = this;
    let oid = e.currentTarget.dataset.oid || 0;
    let userId = that.data.userInfo.Uid || 0;
    wx.request({
      url: config.host + '/User/ConfimOrder.htm',
      data: {
        oid: oid,
        userId: userId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
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
            title: '订单已确认收货',
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
  gotoPayment: function() {
    var that = this;
    let oid = that.data.oid || 0;
    let userId = that.data.userInfo.Uid;
    let openid = that.data.userInfo.Openid;
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
      },
    })

  },
  //调用支付API
  setPayment: function(result) {
    var par = result.Parameters;
    //console.log("支付返回参数", par);
    wx.requestPayment({
      timeStamp: par.timeStamp,
      nonceStr: par.nonceStr,
      package: par.package,
      signType: par.signType,
      paySign: par.paySign,
      success: function(res) {
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
      fail: function(res) {
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
  copyLogisticsNO: function(e) {
    var that = this;
    wx.setClipboardData({
      data: that.data.orderInfo.LogisticsNO,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            wx.showToast({
              title: '复制运货单号成功'
            })
          }
        })
      }
    })
  },
  copyTradeNo: function (e) {
    var that = this;
    wx.setClipboardData({
      data: that.data.orderInfo.TradeNo,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制订单号成功'
            })
          }
        })
      }
    })
  },
  //删除订单
  orderDelete: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          let oid = e.currentTarget.dataset.oid || 0;
          let userId = that.data.userInfo.Uid || 0;
          console.log(oid)
          wx.request({
            url: config.host + '/User/upShow.htm',
            data: {
              oid: oid,
              userId: userId
            },
            header: {
              'content-type': 'application/json'
            },
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
                  title: '已删除该订单',
                  icon: 'sucess',
                  duration: 1000
                });
                t = Math.random();
                that.onReload(that);
                loadMore(that);
              } else {
                wx.showToast({
                  title: '操作失败',
                  icon: 'loading',
                  duration: 1000
                });
              }
            }
          })
        }
      }
    })
  }

})