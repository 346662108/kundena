// pages/my/group_orderlist/group_orderlist.js
//获取应用实例
var app = getApp()
var config = require('../../../config');

var pageSize = 5;
var pageIndex = 0;
var isRun = false;
var stopLoad = false;
var t = Math.random();

var loadMore = function (that) {
  if (stopLoad) return;

  if (isRun) return;
  isRun = true;

  that.setData({
    hiddenLoading: false
  });
  wx.request({
    url: config.host + '/UserTeam/MyTeamList.htm?t=' + t,
    method: 'POST',
    data: { UserId: that.data.userInfo.Uid, tid: that.data.tid, keyWord: that.data.keyWord, pageSize: pageSize, pageIndex: ++pageIndex },
    header: { 'content-type': 'application/json' },
    success: function (res) {
      //console.log("获得产品成功", res);
      if (res.statusCode != 200) {
        console.log("服务器请求异常", res);
        return;
      }

      var list = that.data.pageTeamOrderList;
      if (res.data.pageTeamOrderList) {
        list = list.concat(res.data.pageTeamOrderList);
      }
      if (pageSize * pageIndex >= res.data.totalCount) {
        stopLoad = true;
        that.data.hiddenbuttomMsg = false;
      }
      that.setData({
        pageTeamOrderList: list,
        hiddenbuttomMsg: that.data.hiddenbuttomMsg
      })

    },
    fail: function () {
      console.log("获得产品失败");
    },
    complete: function () {
      //console.log("获得产品结束");
      that.setData({
        onInitLoading: true,
        hiddenLoading: true
      })
      isRun = false;
    }
  })
}

Page({
  // 页面初始数据
  data: {
    // nav 初始化
    navTopItems: [
      { tid: -1, title: "全部" }, { tid: 0, title: "待支付" },
      { tid: 1, title: "待成团" }, { tid: 2, title: "已成团" },
      { tid: 3, title: "拼团失败" }
    ],
    userInfo: {},
    onInitLoading: false,
    hiddenLoading: true,
    hiddenbuttomMsg: true,
    tid: -1,
    keyWord: '',
    pageTeamOrderList: []
  },
  /* 调用数据 */
  onLoad: function (options) {
    var that = this;
    that.setData({
      tid: options.tid || -1,
      keyWord: options.keyWord ? options.keyWord : ''
    });
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
    that.onReload(that);
    loadMore(that);
  },
  onReload: function (that) {
    pageIndex = 0;
    stopLoad = false;
    that.setData({
      onInitLoading: false,
      hiddenbuttomMsg: true,
      pageTeamOrderList: [],
    });
  },
  /**
 * 页面相关事件处理函数--监听用户下拉动作
 */
  onPullDownRefresh: function () {
    var that = this;
    wx.stopPullDownRefresh()
    that.onReload(that);
    loadMore(that);
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    loadMore(that);
  },

  //标签切换
  switchTab: function (e) {
    let tid = e.currentTarget.dataset.tid || 0;
    var that = this;
    that.onReload(that);
    that.setData({
      tid: tid
    });
    loadMore(that);
  },
  // 我的订单详情
  gateOrderitem: function (e) {
    let toid = e.currentTarget.dataset.toid || 0;
    wx.navigateTo({
      url: '../group_orderitem/group_orderitem?toid=' + toid
    })
  },
  // 团详情
  gateGroupitem: function (e) {
    let toid = e.currentTarget.dataset.toid || 0;
    wx.navigateTo({
      url: '../../product/group_item/group_item?toid=' + toid
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
  //取消订单询问
  closeOrder: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定取消订单么？',
      cancelText: '不取消',
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
  },

  // //确认收货
  // gotoConfimOrder: function (e) {
  //   var that = this;
  //   let oid = e.currentTarget.dataset.oid || 0;
  //   let userId = that.data.userInfo.Uid || 0;
  //   wx.request({
  //     url: config.host + '/UserTeam/ConfimOrder.htm',
  //     data: { oid: oid, userId: userId },
  //     header: { 'content-type': 'application/json' },
  //     success: function (res) {
  //       if (res.statusCode != 200) {
  //         wx.showToast({
  //           title: '服务器请求异常',
  //           icon: 'loading',
  //           duration: 1000
  //         });
  //         return;
  //       }
  //       if (res.data.success) {
  //         wx.showToast({
  //           title: '订单已确认收货',
  //           icon: 'sucess',
  //           duration: 1000
  //         });
  //         t = Math.random();
  //         that.onReload(that);
  //         loadMore(that);
  //       } else {
  //         wx.showToast({
  //           title: '操作失败',
  //           icon: 'loading',
  //           duration: 1000
  //         });
  //       }
  //     }
  //   })
  // },

  // // 跳转至退款申请页
  // gotoReturn: function (e) {
  //   let itemid = e.currentTarget.dataset.itemid || 0;
  //   wx.navigateTo({
  //     url: '../refund/index?itemid=' + itemid
  //   })
  // },

  // // 跳转至退款查询页
  // gotoReturnDetail: function (e) {
  //   let itemid = e.currentTarget.dataset.itemid || 0;
  //   wx.navigateTo({
  //     url: '../refund_detail/index?itemid=' + itemid
  //   })
  // },

})
