// pages/cart/invoice/invoice.js
var app = getApp()
var config = require('../../../config');
Page({

  data: {
    objectArray: [{
        id: 0,
        name: '不开发票'
      },
      {
        id: 1,
        name: '纸质普通发票'
      },
      // {
      //   id: 3,
      //   name: '增值税专用发票'
      // }
    ],
    id: 0,
    index: 0,
    InvoiceName: '个人',
    msgInvoiceName: '可填写姓名'
  },
  /* 调用数据 */
  onLoad: function(e) {
    var that = this;
    let isIphoneX = app.globalData.isIphoneX;
    that.setData({
      isIphoneX: isIphoneX,
    })
    that.getInvoiceData();
  },
  getInvoiceData: function() {
    var InvoiceData = wx.getStorageSync('InvoiceData');
    if (InvoiceData) {
      console.log(InvoiceData);
      var that = this;
      var Invoice = InvoiceData;
      let id = InvoiceData.InvoiceType
      console.log(id)
      if (id > 0 && id < 3) {
        id = 1
      }
      that.setData({
        index: InvoiceData.InvoiceType,
        Invoice: InvoiceData,
        id: id
      })
    }
  },
  bindMobile: function(e) {
    var mobile = e.detail.value;
    if (!mobile) return;
    //var myreg = /^1\d{10}$/;
    var myreg = /^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/;
    if (!myreg.test(mobile)) {
      wx.showToast({
        title: '固定电话格式有误',
        icon: 'none',
        duration: 1500
      })
      return;
    }
  },
  //发票类型
  invoiceLink: function(e) {
    var that = this;
    var index = e.target.dataset.index;
    var ind = e.target.dataset.ind;
    console.log(ind)
    console.log(index)
    if (index == 1 ) {
      that.setData({
        InvoiceName: "个人",
        msgInvoiceName: "可填写姓名"
      })
    }else {
      that.setData({
        InvoiceName: "公司",
        msgInvoiceName: "请填写公司名称"
      })
    }
    that.setData({
      index: index,
      id: ind
    })
  },
  /* 返回确认订单 */
  confirmLink: function() {
    wx.navigateTo({
      url: '../confirm_order/index',
    })
  },
  submitForm: function(e) {
    var that = this;
    var newAddr = e.detail.value;
    var id = that.data.id
    if (!id || id == 0) {
      newAddr.InvoiceType = 0
    }
    if (newAddr.InvoiceType == 1) {
      if (!newAddr.InvoiceName) {
        wx.showToast({
          title: '请填写发票抬头',
          icon: 'loading',
          duration: 2000
        })
        return;
      }
    } else if (newAddr.InvoiceType == 2) {
      if (!newAddr.InvoiceName) {
        wx.showToast({
          title: '请填写发票抬头',
          icon: 'loading',
          duration: 2000
        })
        return;
      }
      if (!newAddr.InvoiceIdentifier) {
        wx.showToast({
          title: '请填写纳税人识别码',
          icon: 'loading',
          duration: 2000
        })
        return;
      }
    } else if (newAddr.InvoiceType == 3) {
      if (!newAddr.InvoiceName) {
        wx.showToast({
          title: '请填写公司名称',
          icon: 'loading',
          duration: 2000
        })
        return;
      }
      if (!newAddr.InvoiceIdentifier) {
        wx.showToast({
          title: '请填写纳税人识别码',
          icon: 'loading',
          duration: 2000
        })
        return;
      }
      if (!newAddr.invoiceAddress) {
        wx.showToast({
          title: '请填写注册地址',
          icon: 'loading',
          duration: 2000
        })
        return;
      }
      if (!newAddr.invoicePhone) {
        wx.showToast({
          title: '请填写注册电话',
          icon: 'loading',
          duration: 2000
        })
        return;
      } else {
        // var myreg = /^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/;
        var myreg = /^[0-9]*$/;
        if (!myreg.test(newAddr.invoicePhone)) {
          wx.showToast({
            title: '注册电话格式有误',
            icon: 'none',
            duration: 1500
          })
          return;
        }
      }
      if (!newAddr.invoiceBank) {
        wx.showToast({
          title: '请填写开户银行',
          icon: 'loading',
          duration: 2000
        })
        return;
      }
      if (!newAddr.invoiceAccount) {
        wx.showToast({
          title: '请填写银行账户',
          icon: 'loading',
          duration: 2000
        })
        return;
      }
    }
    wx.setStorageSync('InvoiceData', newAddr);
    wx.navigateTo({
      url: '../confirm_order/index',
    })
  }

})