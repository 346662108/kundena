// pages/product/spike/spike.js
//获取应用实例
var app = getApp()
var config = require('../../../config');
//var cache = require('../../../utils/wcache.js');

var timeAtt=[];
var pageSize = 6;
var pageIndex = 0;
var isRun = false;
var stopLoad = false;

var loadMore = function (that) {
  if (stopLoad) return;

  if (isRun) return;
  isRun = true;

  that.setData({
    hiddenLoading: false
  });
  wx.request({
    url: config.host + '/Team/getTeamProductListData.htm',
    data: { Team_IsLottery: 3, pageSize: pageSize, pageIndex: ++pageIndex },
    header: { 'content-type': 'application/json' },
    success: function (res) {
      if (res.statusCode != 200) {
        //console.log("服务器请求异常", res);
        return;
      }
      for (var i = 0; i < res.data.pageTeamProList.length; i++) {
        var time = res.data.pageTeamProList[i];
        if (timeAtt.indexOf(time.team_Kill_Start) == -1) {
          timeAtt.push(time.team_Kill_Start);
        } else {
          time.team_Kill_Start = "";
        }
      }
      var list = that.data.pageTeamProList.concat(res.data.pageTeamProList);
      if (pageSize * pageIndex >= res.data.totalCount) {
        stopLoad = true;
        that.data.hiddenbuttomMsg = false;
      }
      that.setData({
        pageTeamProList: list,
        hiddenbuttomMsg: that.data.hiddenbuttomMsg
      })
    },
    fail: function () {
      //console.log("获得产品失败");
    },
    complete: function () {
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
    onInitLoading: false,
    hiddenLoading: true,
    hiddenbuttomMsg: true,
    pageTeamProList: [],
  },
  onLoad: function (options) {
    var that = this;
    // that.setData({
    //   keyWord: options.keyWord ? options.keyWord : ''
    // });
    that.onReload(that);
    loadMore(that);
    app.showShare();
  },
  onReload: function (that) {
    pageIndex = 0;
    timeAtt = [];
    stopLoad = false;
    that.setData({
      onInitLoading: false,
      hiddenbuttomMsg: true,
      pageTeamProList: [],
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

  // 跳转至详情页
  navigateDetail: function (e) {
    let tpid = e.currentTarget.dataset.tpid || 0;
    wx.navigateTo({
      url: '../group_proitem/group_proitem?tpid=' + tpid
    })
  }

})