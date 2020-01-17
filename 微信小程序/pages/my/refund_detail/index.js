// pages/my/refund_detail/index.js
var app = getApp()
var config = require('../../../config');

var timer = null;
Page({
  data: {
    itemId: 0,
    userInfo: {},
    proInfo: {},
    refundInfo: {},
    loadTips: '',
    slideshow: false,
    selectedId: 0,
    pictures: []
  },
  // 页面加载执行
  onLoad: function(options) {
    var that = this;
    let isIphoneX = app.globalData.isIphoneX;
    that.setData({
      itemId: options.itemid,
      isIphoneX: isIphoneX
    });
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
  loginSuccess: function() {
    var that = this;
    var that = this;
    var userId = that.data.userInfo.Uid || 0;
    if (userId <= 0) {
      wx.switchTab({
        url: '../../index/index'
      })
      return;
    }
    that.onReload(that);
    that.getReturnInfo();
  },
  
  onReload: function (that) {
    that.setData({
      proInfo:[],
      refundInfo: [],
    });
  },
  getReturnInfo: function() {
    var that = this;
    wx.request({
      url: config.host + '/User/getReturnInfo.htm',
      data: {
        // itemId: 573564,
        itemId: that.data.itemId,
        userId: that.data.userInfo.Uid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res.data)
        if (res.statusCode != 200) {
          wx.showToast({
            title: '服务器请求异常',
            icon: 'loading',
            duration: 2000
          });
          wx.navigateBack({
            delta: 1
          })
          return;
        }
        if (!res.data.success) {
          wx.showToast({
            title: res.data.Msg ? res.data.Msg : "数据获取异常",
            icon: 'loading',
            duration: 2000
          });
          wx.navigateBack({
            delta: 1
          })
          return;
        }
        var images = [];
        for (var i = 0; i < res.data.refundInfo.images.length; i++) {
          var pic = res.data.refundInfo.images[i].bigSrc;
          images.push(pic);
        }
        that.setData({
          proInfo: res.data.proInfo,
          refundInfo: res.data.refundInfo,
          hiddenLoading: true,
          pictures: images,
        });
      }
    })
  },
  // 商品图片放大js
  previewImage: function(e) {
    var that = this
    //获取当前图片的下表
    var index = e.currentTarget.dataset.index
    //数据源
    var pictures = this.data.pictures;
    //console.log("图片放大", index, pictures);
    wx.previewImage({
      //当前显示下表
      current: pictures[0],
      //数据源
      urls: pictures
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
  // 买家退货快递单提交
  refundProPost: function(e) {
    var that = this;
    var refundPost = e.detail.value;
    if (!refundPost.LogisticsCompany) {
      wx.showToast({
        title: '请填写物流公司',
        icon: 'loading',
        duration: 2000
      })
      return;
    }
    if (!refundPost.LogisticsNO) {
      wx.showToast({
        title: '请填写退货单号',
        icon: 'loading',
        duration: 2000
      })
      return;
    }
    refundPost.UserId = that.data.userInfo.Uid;
    refundPost.OrderRefundId = that.data.refundInfo.refundid;
    wx.request({
      url: config.host + '/User/RefundGoodsSave.htm',
      data: refundPost,
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
        if (!res.data.success) {
          wx.showToast({
            title: res.data.Msg ? res.data.Msg : "数据获取异常",
            icon: 'loading',
            duration: 2000
          });
          return;
        }
        wx.showToast({
          title: '物流单保存成功',
          icon: 'success',
          duration: 2000
        });
        //登录成功
        that.loginSuccess();
      }
    })
  },
  //取消退款询问
  closeRefund: function(e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定取消退款么？',
      cancelText: '不取消',
      success: function(res) {
        if (res.confirm) {
          that.closeRefundSubmit(e);
        } else if (res.cancel) {
          //console.log('用户点击取消')
        }
      }
    })
  },
  // 取消退款
  closeRefundSubmit: function(e) {
    let refundid = e.currentTarget.dataset.refundid || 0;
    var that = this;
    wx.request({
      url: config.host + '/User/CloseRefund.htm',
      data: {
        refundid: refundid,
        userId: that.data.userInfo.Uid
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
        if (!res.data.success) {
          wx.showToast({
            title: res.data.Msg ? res.data.Msg : "数据获取异常",
            icon: 'loading',
            duration: 2000
          });
          return;
        }
        wx.showToast({
          title: '退款申请已取消',
          icon: 'success',
          duration: 2000
        });
        //登录成功
        that.loginSuccess();
      }
    })
  },
  copyRefundTradeNo: function(e) {
    var that = this;
    wx.setClipboardData({
      data: that.data.refundInfo.RefundTradeNo,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            wx.showToast({
              icon:'none',
              title: '复制服务单号成功'
            })
          }
        })
      }
    })
  },
  // 拨打电话
  mobile: function () {
    wx.makePhoneCall({
      phoneNumber: '18065521958',
    })
  }
})