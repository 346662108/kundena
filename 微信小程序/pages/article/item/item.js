// pages/article/item/item.js
var app = getApp()
var config = require('../../../config');
Page({
  data: {
    articleList: [],
    hiddenLoading: true
  },
  onLoad: function(e) {
    var that = this;
    let isIphoneX = app.globalData.isIphoneX;
    that.setData({
      isIphoneX: isIphoneX,
    })
    var id = e.id || 0;
    that.getArticleData(id);
  },

  getArticleData: function(id) {
    var that = this;
    wx.request({
      url: config.host + '/Article/Item.htm',
      data: {
        id: id
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.statusCode != 200) {
          return;
        }
        if (res.data.Success) {
          // if (res.data.article.IsVideo)
          // {
          //   var content = res.data.article.content;
          //   var eeee = content.match('style=(.*)\1');
          // }
          // var content = res.data.article.content;
          // var eeee = content.match('style="(.*)">')[1];
          // console.log(eeee)
          var art = res.data.article;
          if (art.IsVideo) {
            if(art.content)
            {
              that.getVideoInfo(art.content);
            }
          } else {
            art.content = art.content.replace(/\<img/gi, '<img  style="max-width:100%;height:auto; " ');
            art.content = art.content.replace(/text-indent/g, ' ')
          }
          console.log(that.data)
          that.setData({
            article: res.data.article, //详情
            articleList: res.data.isHotList, //推荐
            advertList: res.data.advertList, //广告
            categoryList: res.data.categoryList, //分类
            tagList: res.data.tagList, //标签
            hiddenLoading: true,
            CommentGoods: res.data.article.CommentGoods
          });
          console.log(res.data.article)

          var mode = "CommentGoods_" + res.data.article.iid;
          var CommentGoods_ = wx.getStorageSync(mode);
          if (CommentGoods_) {
            that.setData({
              is_like: true
            });
          }
          wx.setNavigationBarTitle({
            title: that.data.article.title
          })
        } else {
          wx.showToast({
            title: "参数错误",
            icon: 'loading',
            duration: 1000
          })
          wx.reLaunch({
            url: '../index'
          })
        }
      }
    })
  },

  getVideoInfo(vedio) {
    if (!vedio) return
    var that = this;
    var urlString = 'https://vv.video.qq.com/getinfo?otype=json&appver=3.2.19.333&platform=11&defnpayver=1&vid=' + vedio;
    wx.request({
      url: urlString,
      success: function(res) {
        var dataJson = res.data.replace(/QZOutputJson=/, '');
        dataJson= dataJson.replace(/;/g,' ');
        var data = JSON.parse(dataJson);
        var fileName = data['vl']['vi'][0]['fn'];
        var fvkey = data['vl']['vi'][0]['fvkey'];
        var host = data['vl']['vi'][0]['ul']['ui'][2]['url']
        that.setData({
          videoUrl: host + fileName + '?vkey=' + fvkey
        });
      }
    })

  },



  // 链接到文章列表
  NavChange(e) {
    var tid = e.currentTarget.dataset.tid ? e.currentTarget.dataset.tid : 0;
    wx.reLaunch({
      url: '../../article/index?page=list&tid=' + tid,
    })
  },
  // 链接到首页
  homeLink: function() {
    wx.navigateTo({
      url: '../../article/index'
    })
  },
  // 链接到文章详情
  articleLink: function(e) {
    var tid = e.currentTarget.dataset.tid || 0;
    wx.navigateTo({
      url: 'item?id=' + tid
    })
  },
  // 分享
  onShareAppMessage: function(res) {
    var that = this;
    return {
      title: that.data.article.title,
      desc: that.data.article.description,
      path: 'pages/article/item/item?id=' + that.data.article.iid,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
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
  },

  // 链接主页
  homeChange: function(e) {
    wx.navigateTo({
      url: '../index'
    })
  },

  // 点赞
  favorclick: function(e) {
    var likeFlag = false; //标志，避免多次发请求
    //避免多次点击
    if (likeFlag === true) {
      return false;
    }
    var that = this;
    var id = e.currentTarget.dataset.id;
    var mode = "CommentGoods_" + id;
    var CommentGoods_ = wx.getStorageSync(mode);
    if (CommentGoods_) {
      wx.showToast({
        title: '您已经点过赞',
        icon: 'none',
      })
      return;
    }
    wx.request({
      url: config.host + '/Article/CommentGoods.htm', //点赞接口
      data: {
        id: id
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.data.Success) {
          wx.setStorageSync(mode, true);
          that.setData({
            CommentGoods: res.data.CommentGoods,
            is_like: true
          })
        }
      },
      complete: function(res) {
        likeFlag = false;
      }
    })
  },
})