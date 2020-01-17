// pages/article/search/search.js
var app = getApp()
var config = require('../../../config');
Page({
  data: {
    searchTag: [],
  },
  onLoad: function(e) {
    var that = this;
    that.getTagData();
  },


  //资讯表头
  getTagData: function() {
    var that = this;

    wx.request({
      url: config.host + '/Article/GetTagList.htm',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode != 200) {
          return;
        }
        that.setData({
          searchTag: res.data.tagList
        });

      },
      fail: function() {

      },
      complete: function() {

      }
    })
  },
  // 搜索
  bindKeyInput: function (e) {
    this.setData({
      keyWord: e.detail.value
    })
  },
  NavChange: function(e) {
    var that = this;
    var keyWord = that.data.keyWord ? that.data.keyWord : '';
    var tid = e.currentTarget.dataset.tid ? e.currentTarget.dataset.tid : 0;
    wx.reLaunch({
      url: '../../article/index?keyWord=' + keyWord + '&page=list' + '&tid=' + tid
    })
  }
})