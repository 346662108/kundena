// pages/cart/address_list/index.js
var app = getApp()
var config = require('../../../config');
var pageIndex = 2;

Page({
  data: {
    address: [],
    userInfo: {},
    hiddenLoading: false,
    istrue: true,
    aid:0
  },
  onLoad: function(options) {
    var that = this;
    if (options.my) {
      that.setData({
        istrue: false
      })
    }
    if (options.aid) {
      that.setData({
        aid: options.aid
      })
    }
    pageIndex = options.pageIndex || 2;
    let isIphoneX = app.globalData.isIphoneX;
    that.setData({
      isIphoneX: isIphoneX,
    })
  },
  onShow: function() {
    this.getUserInfo();
  },
  getUserInfo: function() {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo) {
      //console.log(userInfo)
      that.setData({
        userInfo: userInfo
      });
      that.getAddress();
    })
  },
  getAddress: function() {
    var that = this;
    var addrList = wx.getStorageSync('myAddressList');
    if (addrList) {
      //console.log("缓存获取收货地址列表", addrList)
      that.chackDefaultAddr(addrList);
      that.setData({
        address: addrList,
        hiddenLoading: true
      });
    } else {
      //console.log("重新获取收货地址列表")
      that.getAddressData();
    }
  },
  // 获取地址列表数据
  getAddressData: function() {
    var that = this;
    wx.request({
      url: config.ucHost + '/Address/getaddressData.htm',
      data: {
        UserId: that.data.userInfo.Uid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res.data);
        if (res.statusCode != 200) {
          //console.log("服务器请求异常", res);
          return;
        }
        var addrs = res.data.data;
        that.chackDefaultAddr(addrs);
        that.setData({
          address: addrs,
          hiddenLoading: true
        });
        wx.setStorageSync('myAddressList', addrs);
      },
      fail: function() {
        //console.log("获得失败");
      },
      complete: function() {
        //console.log("获得结束");
      }
    })
  },
  chackDefaultAddr: function(addrList) {
    var addr = wx.getStorageSync('myAddress');
    // if (addr) {
    //   for (var i = 0; i < addrList.length; i++) {
    //     if (addrList[i].Id == addr.Id) {
    //       addrList[i].IsDefault = true;
    //     } else {
    //       addrList[i].IsDefault = false;
    //     }
    //   }
    // }
  },
  /* 复选框 */
  bindCheckbox: function(e) {
    var that = this;
    var addrId = parseInt(e.currentTarget.dataset.addrid);
    console.log(addrId)
    var addrs = that.data.address;
    if (addrs && addrs.length > 0) {
      for (var i = 0; i < addrs.length; i++) {
        if (addrs[i].Id == addrId) {
          console.log( addrs[i])
          wx.setStorageSync('myAddress', addrs[i]);
          break;
        }
      }
    }
    if (pageIndex == 2) {
      wx.navigateBack({
        delta: 1
      })
    } else {
      that.getAddress();
    }
  },
  /* 编辑地址 */
  onedit: function(e) {
    var addrId = parseInt(e.currentTarget.dataset.addrid);
    wx.navigateTo({
      url: '../address_edit/index?addrId=' + addrId + '&pageIndex=' + pageIndex
    })
  },
  /* 新增地址 */
  onadded: function() {
    wx.navigateTo({
      url: '../address_edit/index?pageIndex=' + pageIndex
    })
  }
})