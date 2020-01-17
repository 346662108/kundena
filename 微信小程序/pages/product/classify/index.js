// pages/product/classify/index.js
var app = getApp()
var config = require('../../../config');
var cache = require('../../../utils/wcache.js');
Page({
  data: {
    hiddenLoading: false,
    selCid: 0,
    thisindex: 0,
    //1级分类
    rootCate: [],
    dataChildCate: [],
    bCate: [],
    // 搜索类型选择
    array: ['类型', '商城', '拼团', '抽奖'],
    index: 0
  },
  // 搜索类型选择
  pickChange: function(e) {
    this.setData({
      index: e.detail.value
    });
  },
  //获取屏幕高度
  onLoad: function(options) {
    this.getSystemInfo();
    this.getProductCategoryData();
    //app.showShare();
  },
  getSystemInfo: function() {
    try {
      var res = wx.getSystemInfoSync()
      this.setData({
        screenHeight: res.screenHeight - 153
      })
    } catch (e) {}
  },
  getProductCategoryData: function() {
    var that = this;
    var productCategory = cache.get('ProductCategory');
    if (productCategory) {
      that.getProductCategoryDefData(productCategory);
      return;
    }
    wx.request({
      url: config.host + '/getProductCategoryData.htm',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res.data)
        if (res.statusCode != 200) {
          console.log("服务器请求异常", res);
          return;
        }
        that.getProductCategoryDefData(res.data);
        cache.put('ProductCategory', res.data, 3600 * 24)
      },
      fail: function() {
        console.log("获得失败");
      },
      complete: function() {
        //console.log("获得结束");
        that.setData({
          hiddenLoading: true
        })
      }
    })
  },
  getProductCategoryDefData: function(res) {
    var that = this;

    var rootcate = res.RootCate;
    var childcate = res.Child;
    console.log(res);
    var firstCid = 0;
    if (rootcate.length > 0) {
      firstCid = rootcate[0].cid;
    }
    var firstCate = [];
    for (var i = 0; i < childcate.length; i++) {
      var cate = childcate[i];
      if (cate.pCid == firstCid) {
        firstCate.push(cate);
      }
    }
    that.setData({
      rootCate: rootcate,
      dataChildCate: childcate,
      selCid: firstCid,
      bCate: firstCate,
      hiddenLoading: true,
      text: rootcate[0].cname
    })
  },
  //搜索
  bindKeyInput: function(e) {
    this.setData({
      keyWord: e.detail.value
    })
  },
  wxSearchFn: function(e) {
    var that = this;
    var keyWord = that.data.keyWord ? that.data.keyWord : '';
    wx.navigateTo({
      url: '../list/index?keyWord=' + keyWord
    })
  },

  // 跳转至列表页
  navigateList: function(e) {
    wx.navigateTo({
      url: '../list/index?cid=' + e.currentTarget.dataset.cid
    })
  },
  //事件处理函数
  switchRightTab: function(e) {
    let cid = e.currentTarget.dataset.cid;
    let index = e.currentTarget.dataset.index;
    var text = e.currentTarget.dataset.cname;
    var selcatelist = [];
    for (var i = 0; i < this.data.dataChildCate.length; i++) {
      var cate = this.data.dataChildCate[i];
      if (cate.pCid == cid) {
        selcatelist.push(cate);
      }
    }
    this.setData({
      selCid: cid,
      thisindex: index,
      bCate: selcatelist,
      text: text
    })
  },
  onShareAppMessage: function(res) {
    var that = this;
    if (res && res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '产品分类',
      path: 'pages/product/classify/index',
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  }

})