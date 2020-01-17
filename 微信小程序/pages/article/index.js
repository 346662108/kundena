// pages/article/index.js
var app = getApp()
var config = require('../../config');
var cache = require('../../utils/wcache.js');
Page({
  data: {
    nav: [],
    PageCur: 'home',
    hiddenLoading: false,
    scrollLeft: 0,
  },
  NavChange(e) {
    var mark = e.currentTarget.dataset.mark;
    if (mark) {
      this.setData({
        mark: mark
      })
    }
    this.setData({
      PageCur: e.currentTarget.dataset.cur,
      scrollLeft: (e.currentTarget.dataset.index - 1) * 60
    })
  },
  onMyEvent: function(e) {
    e.detail // 自定义组件触发事件时提供的detail对象
    console.log(e)
  },
  onLoad: function(e) {
    var that = this;
    let isIphoneX = app.globalData.isIphoneX;
    console.log(e)
    if (e.page) {
      this.setData({
        PageCur: e.page
      })
    }
    if (e.keyWord) {
      this.setData({
        keyWord: e.keyWord
      })
    }
    if (e.tid) {
      this.setData({
        tid: e.tid
      })
    }
    that.getArticleData();
    that.setData({
      isIphoneX: isIphoneX,
    })
  },
  //资讯表头
  getArticleData: function() {
    var that = this;
    var ArticleList = cache.get('IndexArticleList');
    if (ArticleList) {
      that.setData({
        nav: ArticleList.HeaderList,
        hiddenLoading: true
      });
      return;
    }
    wx.request({
      url: config.host + '/Article/Header.htm',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode != 200) {
          return;
        }
        that.setData({
          nav: res.data.HeaderList
        });

        cache.put('IndexArticleList', res.data, 600);
      },
      fail: function() {
        //console.log("获得产品失败");
      },
      complete: function() {
        //console.log("获得产品结束");
        that.setData({
          hiddenLoading: true
        })
      }
    })
  },

  // 链接到资讯搜索
  searchLink: function() {
    wx.navigateTo({
      url: '../article/search/search'
    })
  },
  // 链接到商城首页
  mallLink: function() {
    wx.switchTab({
      url: '../index/index'
    })
  },
  // 获取滚动条当前位置
  onPageScroll: function(e) {
    if (e.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },
  //回到顶部
  goTop: function(e) { // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  }
})