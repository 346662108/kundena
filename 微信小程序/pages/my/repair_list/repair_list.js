// pages/my/repair_list/repair_list.js
//获取应用实例
var app = getApp()
var config = require('../../../config');

var pageSize = 5;
var pageIndex = 0;
var isRun = false;
var stopLoad = false;
var t = Math.random();

var loadMore = function(that) {
  if (stopLoad) return;

  if (isRun) return;
  isRun = true;

  that.setData({
    hiddenLoading: false
  });
  wx.request({
    url: config.host + '/User/getReturnList.htm?t=' + t,
    method: 'POST',
    data: {
      UserId: that.data.userInfo.Uid,
      keyWord: that.data.keyWord,
      pageSize: pageSize,
      pageIndex: ++pageIndex
    },
    header: {
      'content-type': 'application/json'
    },
    success: function(res) {
      //console.log("获得产品成功", res);
      if (res.statusCode != 200) {
        console.log("服务器请求异常", res);
        return;
      }

      var list = that.data.pageRefundList
      if (res.data.pageRefundList) {
        list = list.concat(res.data.pageRefundList);
      }
      if (pageSize * pageIndex >= res.data.totalCount) {
        stopLoad = true;
        that.data.hiddenbuttomMsg = false;
      }
      that.setData({
        pageRefundList: list,
        hiddenbuttomMsg: that.data.hiddenbuttomMsg
      })

    },
    fail: function() {
      console.log("获得产品失败");
    },
    complete: function() {
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
    userInfo: {},
    onInitLoading: false,
    hiddenLoading: true,
    hiddenbuttomMsg: true,
    keyWord: '',
    pageRefundList: [],
    isGoNavigate: undefined
  },
  /* 调用数据 */
  onLoad: function(options) {
    var that = this;
    that.setData({
      keyWord: options.keyWord ? options.keyWord : ''
    });
    that.getUserInfo();
  },
  onShow: function() {
    this.setData({
      isGoNavigate: true
    })
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
    that.onReload(that);
    loadMore(that);
  },
  onReload: function(that) {
    pageIndex = 0;
    stopLoad = false;
    that.setData({
      onInitLoading: false,
      hiddenbuttomMsg: true,
      pageRefundList: [],
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var that = this;
    wx.stopPullDownRefresh()
    that.onReload(that);
    loadMore(that);
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    loadMore(that);
  },

  // 跳转至退款查询页
  gotoReturnDetail: function(e) {
    let itemid = e.currentTarget.dataset.itemid || 0;
    if (this.data.isGoNavigate) {
      wx.navigateTo({
        url: '../refund_detail/index?itemid=' + itemid
      })
      this.setData({
        isGoNavigate: false
      })
    }
  },

})