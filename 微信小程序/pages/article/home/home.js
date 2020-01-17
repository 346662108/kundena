// pages/article/index.js
var app = getApp()
var config = require('../../../config');
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    banner: [],
    current: 0,
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    articleList: [],
    hiddenLoading: false
  },
  attached() {
    var that = this;
    let isIphoneX = app.globalData.isIphoneX;
    that.setData({
      isIphoneX: isIphoneX,
    })
    wx.request({
      url: config.host + '/Article/index.htm',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode != 200) {
          return;
        }
        if (res.data.Success) {
          that.setData({
            banner: res.data.indexAdvList,
            articleList: res.data.indexArtList,
            hiddenLoading: true
          });
        }
      }
    })
  },

  methods: {
    //轮播图
    swiperChange: function(e) {
      console.log(e)
      this.setData({
        current: e.detail.current
      })
    },
    // 链接到文章详情
    articleLink: function(e) {
     var tid= e.currentTarget.dataset.tid||0;
      wx.navigateTo({
        url: '../article/item/item?id='+tid
      })
    }
  }
})