//index.js
//获取应用实例
var app = getApp()
var config = require('../../config');
var cache = require('../../utils/wcache.js');

Page({
  data: {
    //banner 初始化
    indexBanner: [],
    swiperIndex: 0,
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 6000,
    duration: 1000,
    hiddenLoading: true,
    //首页新品首发数据
    indexNewPro: [],
    //首页商品列表数据
    indexProList: [],
    //userInfo: {},
    // 搜索类型选择
    array: ['商城', '拼团'],
    searchTypeIndex: 0,
    swiperNav: {
      　　i: 0,
      　　arr: [
          //{ v: 0, txt: "推荐", cid:0 },
        //   { v: 1, txt: "茶盘" },
        //   { v: 2, txt: "茶具" },
        //   { v: 3, txt: "电陶炉" },
        //   { v: 4, txt: "花器" },
        //   { v: 5, txt: "摆件" }
      　　]
    　}
  },
  //头部菜单
  // swiperNav: function (e) {
  //   　console.log(e);
  //   　this.setData({
  //     　　'swiperNav.i': e.target.dataset.i
  //   　})
  // },
  swiperNav: function (e) {
    　console.log(e);
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
  onLoad: function() {
    app.showShare();
  },
  onShow: function() {
    this.getUserInfo();
  },
  getUserInfo: function() {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo) {
      if (userInfo) {
        that.setData({
          userInfo: userInfo
        });
      }
      that.getProductData();
      that.getBannerData();
    })
  },
  //获取用户信息
  GetUserData: function(userId) {
    var that = this;
    if (userId <= 0)
      return;
    wx.request({
      url: config.ucHost + '/GetUserInfo.htm',
      method: 'POST',
      data: {
        MemberId: userId
      },
      success: function(result) {
        if (result.statusCode != 200) {
          return;
        }
        if (result.data.Success) {
          var userInfo = result.data;
          wx.setStorageSync('UserInfo', userInfo);
          that.setData({
            userInfo: userInfo
          });
        }
      },
      complete: function() {}
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onPullDownRefresh: function() {
    var that = this;
    wx.stopPullDownRefresh();
    cache.remove('IndexBannerAll');
    cache.remove('IndexProList');
    that.getUserInfo();
  },
  //顶部banner
  getBannerData: function() {
    var that = this;
    var indexBannerAll = cache.get('IndexBannerAll');
    if (indexBannerAll) {
      that.setData({
        indexBanner: indexBannerAll.indexBanner,
        centerBanner: indexBannerAll.centerBanner,
      })
      return;
    }
    wx.request({
      url: config.host + '/getBannersData.htm',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode != 200) {
          //console.log("服务器请求异常", res);
          return;
        }
        if (res.data.Success) {
          that.setData({
            indexBanner: res.data.indexBanner,
            centerBanner: res.data.centerBanner,
          });
          cache.put('IndexBannerAll', res.data, 3600 * 24 * 2);
        }
      }
    })
  },
  //产品列表
  getProductData: function() {
    var that = this;
    that.setData({
      hiddenLoading: false
    })
    var indexProList = cache.get('IndexProList');
    console.log(indexProList)
    var arr = [];
    // // var obj ={v:0,txt:"推荐",cid:0}
    // arr.push(obj)
    if (indexProList) {
      that.setData({
        indexNewPro: indexProList.indexNewPro,
        //indexProCats: indexProList.indexProCats,
        // indexProList: indexProList.indexProList,
        //indexTeamProlist: indexProList.indexTeamProlist,
        ProList: indexProList.ProList,
        hiddenLoading: true
      });
      var RootCate=indexProList.RootCate;
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
      return;
    }
    wx.request({
      url: config.host + '/getIndexProductData.htm',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.statusCode != 200) {
          //console.log("服务器请求异常", res);
          return;
        }
        that.setData({
          indexNewPro: res.data.indexNewPro,
          //indexProCats: res.data.indexProCats,//分类
          // indexProList: res.data.indexProList,//推荐产品
          // indexTeamProlist: res.data.indexTeamProlist,//拼团
          ProList: res.data.ProList, //产品
          // Artlist: res.data.Artlist //资讯
        });
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
        cache.put('IndexProList', res.data, 600);
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
  //搜索
  bindKeyInput: function(e) {
    this.setData({
      keyWord: e.detail.value
    })
  },
  wxSearchFn: function(e) {
    var that = this;
    var keyWord = that.data.keyWord ? that.data.keyWord : '';
    var urlStr = '../product/list/index?keyWord=' + keyWord;
    if (that.data.searchTypeIndex == 1) {
      urlStr = '../product/group_prolist/group_prolist?keyWord=' + keyWord;
    }
    wx.navigateTo({
      url: urlStr
    })
  },
  // logo链接
  linklogo: function () {
    wx.switchTab({
      url: '../index/index'
    })
  },
  // banner跳转页
  bannerurl: function(e) {
    let href = e.currentTarget.dataset.href;
    if (href) {
      wx.navigateTo({
        url: href
      })
    }
  },
  // 跳转至详情页
  navigateDetail: function(e) {
    let pid = e.currentTarget.dataset.proid || 0;
    wx.navigateTo({
      url: '../product/detail/index?pid=' + pid
    })
  },
  // 跳转至跨境资讯
  linkNews: function() {
    wx.navigateTo({
      url: '../article/index'
    })
  },
  // 跳转至全部分类
  linkClassify: function() {
    wx.switchTab({
      url: '../product/classify/index'
    })
  },
  // 跳转至代理加盟
  linkJoin: function() {
    wx.navigateTo({
      url: '../about/join'
    })
  },
  // 跳转至关于我们
  linkAbout: function() {
    wx.navigateTo({
      url: '../about/about'
    })
  },
  // 跳转至拼团热购
  linkGroup: function(e) {
    let lottery = e.currentTarget.dataset.lottery || 0;
    wx.navigateTo({
      url: '../product/group_prolist/group_prolist?lottery=' + lottery
    })
  },
  // 跳转至拼团详情页
  urlGroupitem: function(e) {
    let tpid = e.currentTarget.dataset.tpid || 0;
    wx.navigateTo({
      url: '../product/group_proitem/group_proitem?tpid=' + tpid
    })
  },

  // 跳转至对应分类的商品列表
  urlProlist: function(e) {
    let cid = e.currentTarget.dataset.cid || 0;
    var url = "../product/list/index";
    if (cid > 0) {
      url += '?cid=' + cid;
      wx.navigateTo({
        url: url
      })
    }
  },

  // 跳转至商品分类
  urlCatelist: function() {
    wx.switchTab({
      url: '../product/classify/index'
    })
  },
  //广告图1跳转链接
  linkAdver1: function() {
    wx.navigateTo({
      url: '../product/classify/index'
    })
  },
  //广告图2跳转链接
  linkAdver2: function() {
    wx.navigateTo({
      url: '../product/classify/index'
    })
  },
  //广告图3跳转链接
  linkAdver3: function() {
    wx.navigateTo({
      url: '../product/classify/index'
    })
  },
  //广告图4跳转链接
  linkAdver4: function() {
    wx.navigateTo({
      url: '../product/classify/index'
    })
  },
  //banner当前选中
  swiperChange(e) {
    this.setData({
      swiperIndex: e.detail.current
    })
  },

  // 链接到资讯列表
  linkArticle: function(e) {
    wx.navigateTo({
      url: '../article/index'
    })
  },
  // 链接到资讯详情
  linkArticleItems: function(e) {
    var pid = e.currentTarget.dataset.pid || 0;
    wx.navigateTo({
      url: '../article/item/item?id=' + pid
    })
  },
  // 链接到首页
  linkIndex: function() {
    wx.switchTab({
      url: '../index/index'
    })
  }
})