// pages/product/group_prolist/group_prolist.js
//获取应用实例
var app = getApp()
var config = require('../../../config');
var cache = require('../../../utils/wcache.js');

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
    data: { Team_IsLottery: that.data.lottery, cid: that.data.cid, keyWord: that.data.keyWord, pageSize: pageSize, pageIndex: ++pageIndex },
    header: { 'content-type': 'application/json' },
    success: function (res) {
      if (res.statusCode != 200) {
        //console.log("服务器请求异常", res);
        return;
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
    lottery: -1,
    cid: 0,
    keyWord: '',
    pageTeamProList: [],
    // 搜索类型选择
    array: ['商城', '拼团'],
    searchTypeIndex: 1,
    classify: [],
  },
  // 搜索类型选择
  pickChange: function (e) {
    this.setData({
      searchTypeIndex: e.detail.value
    });
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      lottery: options.lottery || -1,
      cid: options.cid ? options.cid : 0,
      keyWord: options.keyWord ? options.keyWord : ''
    });
    that.getTeamProductCategoryData();
    that.onReload(that);
    loadMore(that);
  },
  onReload: function (that) {
    pageIndex = 0;
    stopLoad = false;
    that.setData({
      onInitLoading: false,
      hiddenbuttomMsg: true,
      pageTeamProList: [],
    });
  },
  //团产品分类
  getTeamProductCategoryData: function () {
    var that = this;
    var teamProductCategory = cache.get('TeamProductCategory');
    if (teamProductCategory) {
      that.setData({
        classify: teamProductCategory,
      })
      return;
    }
    wx.request({
      url: config.host + '/Team/getTeamProductCategoryData.htm',
      header: { 'content-type': 'application/json' },
      success: function (res) {
        if (res.statusCode != 200) {
          //console.log("服务器请求异常", res);
          return;
        }
        that.setData({
          classify: res.data.RootCate,
        })
        cache.put('TeamProductCategory', res.data.RootCate, 3600 * 24 * 2);
      },
      fail: function () {
        //console.log("获得产品失败");
      },
    })

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
  bindKeyInput: function (e) {
    this.setData({
      keyWord: e.detail.value
    })
  },

  //搜索
  wxSearchFn: function (e) {
    var that = this;
    if (that.data.searchTypeIndex == 0) {
      var keyWord = that.data.keyWord ? that.data.keyWord : '';
      var urlStr = '../list/index?keyWord=' + keyWord;
      wx.navigateTo({
        url: urlStr
      })
    } else {
      that.onReload(that);
      loadMore(that);
    }
  },

  // 跳转至详情页
  navigateDetail: function (e) {
    let tpid = e.currentTarget.dataset.tpid || 0;
    wx.navigateTo({
      url: '../group_proitem/group_proitem?tpid=' + tpid
    })
  },
  
  //团分类点击事件
  bindCategoryTeamPro: function (e) {
    var that = this;
    let cid = e.currentTarget.dataset.cid || 0;
    that.setData({
      cid: cid,
    });
    that.onReload(that);
    loadMore(that);
  },

  //分享
  onShareAppMessage: function (res) {
    var that = this;
    if (res && res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '团产品列表',
      path: 'pages/product/group_proitem/group_proitem?cid=' + that.data.cid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
