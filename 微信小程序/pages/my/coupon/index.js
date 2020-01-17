// pages/my/coupon/index.js
//获取应用实例
var app = getApp()
var config = require('../../../config');

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
    url: config.host + '/User/GetMyCoupon.htm',
    method: 'POST',
    data: { UserId: that.data.userInfo.Uid, tid: that.data.tid, pageSize: pageSize, pageIndex: ++pageIndex },
    header: { 'content-type': 'application/json' },
    success: function (res) {
      //console.log("获得产品成功", res);
      if (res.statusCode != 200) {
        console.log("服务器请求异常", res);
        return;
      }

      var list = that.data.pageCouponList
      if (res.data.pageCouponList) {
        list = list.concat(res.data.pageCouponList);
      }
      if (pageSize * pageIndex >= res.data.totalCount) {
        stopLoad = true;
        that.data.hiddenbuttomMsg = false;
      }
      that.setData({
        pageCouponList: list,
        hiddenbuttomMsg: that.data.hiddenbuttomMsg
      })

    },
    fail: function () {
      console.log("获得产品失败");
    },
    complete: function () {
      //console.log("获得产品结束");
      that.setData({
        hiddenLoading: true
      })
      isRun = false;
    }
  })
}


Page({
  data: {
    showModalStatus: false,
    userInfo: {},

    hiddenLoading: true,
    hiddenbuttomMsg: true,
    tid: 0,
    pageCouponList: [],
    excludeAreaNameStr: '',
  },
  /* 调用数据 */
  onLoad: function (options) {
    var that = this;
    that.setData({
      tid: options.tid || 0,
      keyWord: options.keyWord ? options.keyWord : ''
    });
    that.getUserInfo();
  },
  //检查登录
  getUserInfo: function () {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //console.log(userInfo)
      that.setData({
        userInfo: userInfo
      });
      //登录成功
      that.loginSuccess();
    })
  },
  //登录成功
  loginSuccess: function () {
    var that = this;
    var userId = that.data.userInfo.Uid || 0;
    if (userId <= 0) {
      wx.switchTab({
        url: '../../index/index'
      })
      return;
    }
    that.onReload(that);
    loadMore(that);
  },
  onReload: function (that) {
    pageIndex = 0;
    stopLoad = false;
    that.setData({
      hiddenbuttomMsg: true,
      pageCouponList: [],
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
  //标签切换
  switchTab: function (e) {
    let tid = e.currentTarget.dataset.tid || 0;
    var that = this;
    that.onReload(that);
    that.setData({
      tid: tid
    });
    loadMore(that);
  },

  powerDrawer: function (e) {
    var exclude = e.currentTarget.dataset.exclude;
    this.setData({
      excludeAreaNameStr: exclude
    })
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200, //动画时长 
      timingFunction: "ease", //线性 
      delay: 0 //0则不延迟 
    });

    // 第2步：这个动画实例赋给当前的动画实例 
    this.animation = animation;

    // 第3步：执行第一组动画 
    animation.opacity(0).step();

    // 第4步：导出动画对象赋给数据对象储存 
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      })

      //关闭 
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)

    // 显示 
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
  }

})