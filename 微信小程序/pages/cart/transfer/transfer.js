// pages/cart/transfer/transfer.js
var app = getApp()
var config = require('../../../config.js');
var t = Math.random();
Page({

  data: {
    payee: '家世比科技有公司',
    bankNum: '6617357999848484728',
    subbranch: '福建泉州银行股份有限公司',
    num: '323331000001',
    userInfo: {},
    orderInfo: {},
    oid: 0,
    imgs: [],
    text: '上传汇款单据',
    hiddenLoading:false
  },

  /* 调用数据 */
  onLoad: function(e) {
    var that = this;
    let oid = e.oid || 0;
    let isIphoneX = app.globalData.isIphoneX;
    that.setData({
      isIphoneX: isIphoneX,
      oid: oid
    })
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
          orderInfo: res.data.OrderItem,
          hiddenLoading:true
        })
        if (res.data.OrderItem.VouchersImg) {
          var imgs = [];
          imgs.push(res.data.OrderItem.VouchersImg);
          that.setData({
            imgs: imgs,
            text: "重新上传汇款单据"
          })
        }
      },
      complete: function() {}
    })
  },

  uploadReceipt: function() {
    var that = this;
    wx.chooseImage({ //从本地相册选择图片或使用相机拍照
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        that.setData({
          imgs: res.tempFilePaths
        })
        var data = [];
        data.userId = that.data.userInfo.Uid;
        data.oid = that.data.oid;
        wx.uploadFile({
          url: config.host + '/User/BindVouchersImg.htm',
          filePath: res.tempFilePaths[0],
          formData: data,
          name: 'image',
          success: function(result) {
            var json = JSON.parse(result.data)
            if (json.Success) {
              that.setData({
                text:'重新上传汇款单据'
              })
              wx.showToast({
                title: '操作成功',
                icon: 'success',
                duration: 1000
              })
            } else {
              wx.showToast({
                title: json.Msg,
                icon: 'loading',
                duration: 1000
              });
            }
          }
        })
      }
    })
  },
  receiptLink: function(e) {
    var current = e.target.dataset.src
    if (!current)
    {
        wx.showModal({
          title: '提示',
          content: '暂无单据，请上传',
          showCancel: false,
          confirmText: '确定',
        })
    }else{
      wx.previewImage({
        current: current,
        urls: this.data.imgs,
      })
    }
  },
  copyPayee: function(e) {
    var that = this;
    wx.setClipboardData({
      data: that.data.payee,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            wx.showToast({
              title: '复制收款人成功'
            })
          }
        })
      }
    })
  },

  copyBankNum: function(e) {
    var that = this;
    wx.setClipboardData({
      data: that.data.bankNum,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            wx.showToast({
              title: '复制账号成功'
            })
          }
        })
      }
    })
  },
  copySubbranch: function(e) {
    var that = this;
    wx.setClipboardData({
      data: that.data.subbranch,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            wx.showToast({
              title: '复制支行成功'
            })
          }
        })
      }
    })
  },
  copyNum: function(e) {
    var that = this;
    wx.setClipboardData({
      data: that.data.num,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            wx.showToast({
              title: '复制联行号成功'
            })
          }
        })
      }
    })
  },
  /* 查看订单状态 */
  orderLink: function() {
    var oid = this.data.oid;
    wx.navigateTo({
      url: '../../my/order_detail/index?oid=' + oid
    })
  },
  /* 查看转账流程 */
  processLink: function() {
    wx.navigateTo({
      url: '../../cart/transfer/process/process',
    })
  }
})