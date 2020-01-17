// pages/my/lottery_list/lottery_list.js
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
    url: config.host + '/UserTeam/MyTeamLuckList.htm?t=' + t,
    method: 'POST',
    data: { UserId: that.data.userInfo.Uid, keyWord: that.data.keyWord, pageSize: pageSize, pageIndex: ++pageIndex },
    header: { 'content-type': 'application/json' },
    success: function (res) {
      //console.log("获得产品成功", res);
      if (res.statusCode != 200) {
        console.log("服务器请求异常", res);
        return;
      }

      var list = that.data.pageTeamLuckList;
      if (res.data.pageTeamLuckList) {
        list = list.concat(res.data.pageTeamLuckList);
      }
      if (pageSize * pageIndex >= res.data.totalCount) {
        stopLoad = true;
        that.data.hiddenbuttomMsg = false;
      }
      that.setData({
        pageTeamLuckList: list,
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
  data: {
    userInfo: {},
    onInitLoading: false,
    hiddenLoading: true,
    hiddenbuttomMsg: true,
    keyWord: '',
    pageTeamLuckList: []
  },
  /* 调用数据 */
  onLoad: function (options) {
    var that = this;
    that.setData({
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
      pageTeamLuckList: [],
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

  // 跳转至拼团订单详情
  urlOrderitem: function (e) {
    let toid = e.currentTarget.dataset.toid || 0;
    wx.navigateTo({
      url: '../group_orderitem/group_orderitem?toid=' + toid
    })
  },

  // 跳转至中奖详情
  urlWinitem: function (e) {
    let tpid = e.currentTarget.dataset.tpid || 0;
    wx.navigateTo({
      url: '../lottery_winitem/lottery_winitem?tpid=' + tpid
    })
  },

})