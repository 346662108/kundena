// pages/article/list/list.js
var app = getApp()
var config = require('../../../config');

var pageSize = 6;
var pageIndex = 0;
var stopLoad = false;
var loadMore = function(that) {
  if (stopLoad) return;
  that.setData({
    hiddenLoading: false
  });
  wx.request({
    url: config.host + '/Article/List.htm',
    data: {
      PinYin: that.data.eventmark,
      keyWord: that.data.keyWord,
      TagId: that.data.eventtid,
      pageSize: pageSize,
      pageIndex: ++pageIndex
    },
    header: {
      'content-type': 'application/json'
    },
    success: function(res) {
      console.log(res.data)
      if (res.statusCode != 200) {
        return;
      }
      var list = that.data.articleList.concat(res.data.articleList);
      if (pageSize * pageIndex >= res.data.totalCount) {
        // that.data.hiddenbuttomMsg = false;
        stopLoad = true;
      }
      that.setData({
        articleList: list,
        // hiddenbuttomMsg: that.data.hiddenbuttomMsg
      })
    },
    fail: function() {},
    complete: function() {
      that.setData({
        onInitLoading: true,
        hiddenLoading: true
      })
    }
  })
}

var loadMoreData = function(that) {
  let isIphoneX = app.globalData.isIphoneX;
  that.setData({
    isIphoneX: isIphoneX,
    articleList: []
  });
  pageIndex=1;
  stopLoad=false;
  loadMore(that);
}
Component({
  options: {
    addGlobalClass: true,
    hiddenLoading: false,
  },
  data: {
    articleList: [],
  },
  properties: {
    eventmark: { // 属性名 //根据点击的分类
      type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer(newVal, oldVal) {
        if (newVal) {
          var that = this;
          //pageIndex = 0;
          if (newVal == 1) {
            that.setData({
              eventmark: ''
            });
          }
          that.setData({
            keyWord: '',
            eventtid: 0
          });
          loadMoreData(that);
        }
      }
    },
    keyWord: { //搜索的列表
      type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer(newVal, oldVal) {
        if (newVal) {
          var that = this;
          that.setData({
            eventmark: '',
            eventtid: 0
          });
          //pageIndex = 0;
          loadMoreData(that);
        }
      }
    },
    eventtid: { //标签查询的列表
      type: Number, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer(newVal, oldVal) {
        if (newVal) {
          var that = this;
          that.setData({
            eventmark: '',
            keyWord: '',
          });
          pageIndex = 0;
          loadMoreData(that);
        }
      }
    }
  },
  attached() {

  },

  methods: {
    // 链接到文章详情
    articleLink: function(e) {
      var tid = e.currentTarget.dataset.tid || 0;
      wx.navigateTo({
        url: '../article/item/item?id=' + tid
      })
    },
    loadMore: function () {
      // Do something when page reach bottom.
      console.log('circle 下一页');
      var that = this;
      loadMore(that);
    },

  }
})