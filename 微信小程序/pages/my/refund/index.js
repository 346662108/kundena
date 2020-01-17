// pages/my/refund/index.js
var app = getApp()
var config = require('../../../config');
var isSubmit = false;

Page({
  data: {
    itemId: 0,
    refundFee: 0,
    num: 0,
    //是否换货
    isChangePro: false,
    //是否退款
    isReturnMoney: false,
    userInfo: {},
    orderInfo: {},
    hiddenLoading: false,
    hiddenSaveLoading: true,
    serviceIndex: 0,
    service: ['请选服务类型', '我要退货', '我要退款','我要换货'],
    receiptIndex: 0,
    receipt: ['未收到货', '已收到货'],
    BackMoneyIndex: 0,
    BackMoney: ['请选择退款原因', '7天无理由退换货', '退运费', '商品信息描述不符', ' 少件/漏发', ' 包装/商品破损', '假冒品牌', '未按约定时间发货', '发票问题', '退运费'],
    BackGoodsIndex: 0,
    BackGoods: ['请选择退货原因', '7天无理由退换货', '退运费', '商品腐烂变质死亡', ' 大小/尺寸/重量与商品描述不符', ' 生产日期/保质期与商品描述不符', '品种/产地/规格/成分等描述不符', '少件/漏发', '卖家发错货', '包装/商品破损', '未按约定时间发货', '发票问题'],
    imgPath: []
  },
  onLoad: function(options) {
    var that = this;
    let isIphoneX = app.globalData.isIphoneX;
    that.setData({
      oid: options.oid,
      isIphoneX: isIphoneX,
    })
    that.setData({
      // itemId: 573564
      itemId: options.itemid
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
    that.getReturnProductInfo();
  },
  getReturnProductInfo: function() {
    var that = this;
    wx.request({
      url: config.host + '/User/getReturnProductInfo.htm',
      data: {
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
            title: res.data.Msg,
            icon: 'loading',
            duration: 2000
          });
          wx.navigateBack({
            delta: 1
          })
          return;
        }
        that.setData({
          orderInfo: res.data.orderInfo,
          refundFee: res.data.orderInfo.price,
          num: res.data.orderInfo.num,
          hiddenLoading: true
        });
        if (res.data.orderInfo.sendstatus == 0) {
          that.setData({
            isReturnMoney: true
          });
        }
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
  //退货数量
  ordernum: function(e) {
    var that = this
    var num = e.detail.value;
    if (!num) return;
    var orderInfo = that.data.orderInfo
    var oprice = orderInfo.oprice
    var refundFee = oprice * num;
    if (num > orderInfo.num) {
      wx.showToast({
        title: '退货数量不能大于购买数量：' + orderInfo.num,
        icon: 'none',
        duration: 1500
      })
      refundFee = oprice * orderInfo.num;
      num = orderInfo.num;
    }
    that.setData({
      num: num,
      refundFee: refundFee.toFixed(2)
    })
  },
  // 退款金额检查
  bindRefundFeeBlur: function(e) {
    var that = this;
    var returnPrice = e.detail.value;
    var orderInfo = that.data.orderInfo;
    var num = that.data.num
    let price = orderInfo.oprice * num
    if (returnPrice > price) {
      wx.showToast({
        title: '退款金额不能大于退货数量总金额：' + price.toFixed(2) + '元',
        icon: 'none',
        duration: 1500
      })
      returnPrice = price
      that.setData({
        refundFee: returnPrice.toFixed(2)
      });
    }
  },
  bindServiceChange: function(e) {
    console.log(e.detail)
    var that = this;
    var isChangePro = false;
    var isReturnMoney = false;
    if (e.detail.value == 3) {
      isChangePro = true;
    } else if (e.detail.value == 2) {
      isReturnMoney = true;
    }
    this.setData({
      serviceIndex: e.detail.value,
      isChangePro: isChangePro,
      isReturnMoney: isReturnMoney
    })
  },
  // 收货状态选择事件
  bindReceiptChange: function(e) {
    this.setData({
      receiptIndex: e.detail.value
    })
  },
  // 退款原因选择事件
  bindBackMoneyChange: function(e) {
    this.setData({
      BackMoneyIndex: e.detail.value,
    })
  },
  // 退货原因选择事件
  bindBackGoodsChange: function(e) {
    this.setData({
      BackGoodsIndex: e.detail.value,
    })
  },
  // 预览图片
  // uploadImg: function() {
  //   var that = this;
  //   wx.chooseImage({
  //     success: function(res) {
  //       var tempFilePaths = res.tempFilePaths;
  //       that.setData({
  //         imgPath: tempFilePaths[0]
  //       })
  //     }
  //   })
  // },
  // // 删除图片
  // deleteImg: function() {
  //   var that = this;
  //   wx.showModal({
  //     title: '提示',
  //     content: '确认是否删除凭证',
  //     success: function(res) {
  //       if (res.confirm) {
  //         that.setData({
  //           imgPath: ''
  //         })
  //       } else if (res.cancel) {
  //         //console.log('用户点击取消')
  //       }
  //     }
  //   })
  // },
  // 上传退款凭证
  ChooseImage(e) {
    console.log(this.data.imgPath)
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.imgPath.length != 0) {
          this.setData({
            imgPath: this.data.imgPath.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgPath: res.tempFilePaths
          })
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgPath,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      content: '确定要删除这张凭证吗？',
      cancelText: '取消',
      confirmText: '删除',
      success: res => {
        if (res.confirm) {
          this.data.imgPath.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgPath: this.data.imgPath
          })
        }
      }
    })
  },
  //提交申请退款
  submitForm: function(e) {
    var that = this;
    var submitPar = e.detail.value;
    if (submitPar.RefundType == 0) {
      wx.showToast({
        title: '请选择服务类型',
        icon: 'loading',
        duration: 2000
      });
      return;
    }
    if (submitPar.RefundType == 1) {
      if (submitPar.Reason_Product == 0) {
        wx.showToast({
          title: '请选择退货原因',
          icon: 'loading',
          duration: 2000
        });
        return;
      }
      submitPar.Reason = that.data.BackGoods[submitPar.Reason_Product];
      submitPar.GoodStatus = 1;
    }
    if (submitPar.RefundType == 2) {
      if (submitPar.Reason_Money == 0) {
        wx.showToast({
          title: '请选择退款原因',
          icon: 'loading',
          duration: 2000
        });
        return;
      }
      submitPar.Reason = that.data.BackMoney[submitPar.Reason_Money];
    }

    var price = submitPar.RefundFee;
    if (price > that.data.orderInfo.price) {
      submitPar.RefundFee = that.data.orderInfo.price;
    }
    submitPar.RefundType = submitPar.RefundType - 1;
    submitPar.itemId = that.data.itemId;
    submitPar.userId = that.data.userInfo.Uid;
    if (isSubmit) return;
    isSubmit = true;

    that.setData({
      hiddenSaveLoading: false,
    })
    that.uploadFileImg(submitPar);
  },
  //提交申请退款 先上传图片
  uploadFileImg: function(submitPar) {
    var that = this;
    if (that.data.imgPath != null && that.data.imgPath.length > 0) {
      wx.uploadFile({
        url: config.host + '/User/uploadFileImg.htm', //仅为示例，非真实的接口地址
        header: {
          'content-type': 'multipart/form-data'
        },
        filePath: that.data.imgPath[0],
        name: 'file',
        success: function(res) {
          console.log(res)
          if (res.statusCode != 200) {
            return;
          }
          var dataResult = JSON.parse(res.data);
          if (dataResult.success) {
            submitPar.RefundPhoto = dataResult.refundPhoto;;
          }
        },
        complete: function() {
          that.submitFormPost(submitPar);
        }
      })
    } else {
      that.submitFormPost(submitPar);
    }
  },
  submitFormPost: function(submitPar) {
    var that = this;
    wx.request({
      url: config.host + '/User/ReturnApplySave.htm',
      data: submitPar,
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
            title: res.data.Msg ? res.data.Msg : '数据获取异常',
            icon: 'loading',
            duration: 2000
          });
          return;
        }
        that.setData({
          hiddenSaveLoading: true,
        })
        var oid = res.data.oid;
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '退款申请成功',
          confirmText: '知道了',
          success: function(res) {
            if (res.confirm) {
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })
      },
      complete: function() {
        isSubmit = false;
        that.setData({
          hiddenSaveLoading: true,
        })
      }
    })
  },
  // 拨打400号码
  phone: function() {
    wx.makePhoneCall({
      phoneNumber: '4006960618',
    })
  },
  // 拨打移动号码
  mobile: function() {
    wx.makePhoneCall({
      phoneNumber: '18065521958',
    })
  }

})