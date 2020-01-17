var app = getApp()
var config = require('../../../config');
var cache = require('../../../utils/wcache.js');
var uid = '';
var openId = '';
Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: true,
  },

  onLoad: function(options) {
    var that = this;
    uid = options.uid;
    openId = options.openId

  },

  //跳转到我的
  navigatemy: function() {
    wx.switchTab({
      url: '../../my/index'
    })
  },

  //跳转到商城首页
  navigateIndex: function() {
    wx.switchTab({
      url: '../../index/index'
    })
  },

  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      //第一登录的补充基础信息
      var nickName = e.detail.userInfo.nickName;
      var nvatarUrl = e.detail.userInfo.avatarUrl;
      var gender = e.detail.userInfo.gender;
      var OpenId = e.detail.userInfo.OpenId;
      var gender = e.detail.userInfo.gender;
      wx.request({
        url: config.ucHost + '/ModifyUserInfo.htm',
        method: 'POST',
        data: {
          Uid: uid,
          OpenId: openId,
          NickName: nickName,
          NvatarUrl: nvatarUrl,
          Gender: gender
        },
        success: function(result) {
          console.log(result.data)
          if (result.statusCode != 200) {
            //console.log("服务器请求异常", res);
            return;
          }
          var userInfo = result.data;
          if (userInfo.Success) {
            //console.log("基础信息修改成功");
            wx.setStorageSync('UserInfo', userInfo);
            wx.switchTab({
              url: '../../my/index'
            })
            //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
            that.setData({
              isHide: false
            });
          }
        }
      })

    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  }
})