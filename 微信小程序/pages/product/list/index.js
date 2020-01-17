//pages/product/list/index.js
//获取应用实例
var app = getApp()
var config = require('../../../config');

var pageSize = 6;
var pageIndex = 0;
var isRun = false;
var stopLoad = false;

var loadMore = function(that) {
  if (stopLoad) return;

  if (isRun) return;
  isRun = true;

  that.setData({
    hiddenLoading: false
  });
  wx.request({
    url: config.host + '/getProductListData.htm',
    data: {
      filterId: that.data.filterId,
      pricefilterId: that.data.priceFilter,
      cid: that.data.cid,
      keyWord: that.data.keyWord,
      pageSize: pageSize,
      pageIndex: ++pageIndex
    },
    header: {
      'content-type': 'application/json'
    },
    success: function(res) {
      console.log(res)
      if (res.statusCode != 200) {
        //console.log("服务器请求异常", res);
        return;
      }
      var list = that.data.pageProList.concat(res.data.pageProList);
      if (pageSize * pageIndex >= res.data.totalCount) {
        stopLoad = true;
        that.data.hiddenbuttomMsg = false;
      }
      that.setData({
        pageProList: list,
        hiddenbuttomMsg: that.data.hiddenbuttomMsg
      })
      var arr = [];
      var RootCate=res.data.RootCate;
      if (RootCate)
      {
          for (var i = 0; i < RootCate.length; i++) {
           var  obj = {
              v: i + 1,
              txt: RootCate[i].cname,
              cid: RootCate[i].cid
            }
            arr.push(obj)
          }
          that.setData({
            'swiperNav.arr': arr
          })
      }
    },
    fail: function() {
      //console.log("获得产品失败");
    },
    complete: function() {
      that.setData({
        onInitLoading: true,
        hiddenLoading: true,
        keyWord:""
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
    filterId: 1,
    priceFilter: 0,
    cid: 0,
    keyWord: '',
    pageProList: [],
    // 搜索类型选择
    array: ['商城', '拼团'],
    searchTypeIndex: 0,
    topScrollTop: 0,
    topFixed: false,
    swiperNav: {
      i: 0,
      arr: [
        // { v: 0, txt: "推荐" },
        // { v: 1, txt: "茶盘" },
        // { v: 2, txt: "茶具" },
        // { v: 3, txt: "电陶炉" },
        // { v: 4, txt: "花器" },
        // { v: 5, txt: "摆件" }
      ]
    }
  },
  //头部菜单
  // swiperNav: function (e) {
  //   this.setData({
  //     'swiperNav.i': e.target.dataset.i
  //   })
  // },
  swiperNav: function (e) {
    /*获取可视窗口宽度*/
    var w = wx.getSystemInfoSync().windowWidth;
    var leng = this.data.swiperNav.arr.length;
    var i = e.target.dataset.i;
    var disX = (i - 2) * w / leng;
    if (i != this.data.swiperNav.i) {
      this.setData({
        'swiperNav.i': i
      })
    }
    this.setData({
      'swiperNav.x': disX
    })
  },
  // 搜索类型选择
  pickChange: function(e) {
    this.setData({
      searchTypeIndex: e.detail.value
    });
  },
  onLoad: function(options) {
    var that = this;
    that.setData({
      cid: options.cid ? options.cid : 0,
      keyWord: options.keyWord ? options.keyWord : ''
    });
    // that.onReload(that);
    // loadMore(that);
    //app.showShare();
    that.getUserInfo();
  },


  onShow:function(){
    var that = this;
    that.onReload(that);
    loadMore(that);
  },
  getUserInfo: function() {
    var that = this;

    var userInfo = wx.getStorageSync('UserInfo');
    if (userInfo) {
      that.setData({
        userInfo: userInfo
      })
    }
  },
  onReload: function(that) {
    pageIndex = 0;
    stopLoad = false;
    that.setData({
      onInitLoading: false,
      hiddenbuttomMsg: true,
      pageProList: [],
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
  tapFilter: function(e) {
    //综合 销量 新品
    var that = this;
    that.onReload(that);
    var orderTid = e.currentTarget.dataset.tid;
    console.log(orderTid);
    that.setData({
      filterId: orderTid,
      priceFilter: 0
    });
    loadMore(that);
  },
  tapPriceFilter: function(e) {
    //价格
    var that = this;
    this.onReload(that);
    var orderTid = e.currentTarget.dataset.tid || 0;
    if (orderTid == 0) {
      orderTid = 1;
    } else if (orderTid == 1) {
      orderTid = 2;
    } else if (orderTid == 2) {
      orderTid = 1
    }
    console.log(orderTid);
    that.setData({
      filterId: 0,
      priceFilter: orderTid
    });
    loadMore(that);
  },
  // 搜索
  bindKeyInput: function(e) {
    this.setData({
      keyWord: e.detail.value,
      cid:0
    })
  },
  //跳到知道分类页
  urlProlist: function(e) {
    let cid = e.currentTarget.dataset.cid || 0;
    this.setData({
      cid:cid
    })
    this.onShow();
  },
  wxSearchFn: function(e) {
    var that = this;
    var keyWord = that.data.keyWord ? that.data.keyWord : '';
    that.setData({
      keyWord: keyWord
    });
    that.onShow();
  },
  // 跳转至详情页
  navigateDetail: function(e) {
    let pid = e.currentTarget.dataset.pid || 0;
    wx.navigateTo({
      url: '../../product/detail/index?pid=' + pid
    })
  },
  // 返回跳转至分类页
  backclassify: function() {
    wx.switchTab({
      url: '../../product/classify/index'
    })
  },
    // 链接到首页
    linkIndex: function() {
      wx.switchTab({
        url: '../../index/index'
      })
    },
  //分享
  onShareAppMessage: function(res) {
    var that = this;
    if (res && res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '产品列表',
      path: 'pages/product/list/index?cid=' + that.data.cid,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  onReady: function() {
    var that = this;
    var query = wx.createSelectorQuery()
    query.select('.filters').boundingClientRect(function(res) {
      that.setData({
        topScrollTop:res?res.top: 0
      })
    }).exec()
  },
  onPageScroll: function(e) { // 获取滚动条当前位置
    if (e.scrollTop > this.data.topScrollTop) {
      this.setData({
        topFixed: true
      })
    } else {
      this.setData({
        topFixed: false
      })
    }
  }
})