var app = getApp()
var config = require('../../config');
var cache = require('../../utils/wcache.js');
Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: true,
  },

  onLoad: function(options) {
    var that = this;
    var userInfo = wx.getStorageSync('UserInfo');
    that.setData({
      userInfo: userInfo
    });
  },

  //跳转到我的
  navigateMy: function() {
    wx.switchTab({
      url: '../my/index'
    })
  },
  //跳转到商城首页
  navigateIndex: function() {
    wx.switchTab({
      url: '../index/index'
    })
  },
  getPhoneNumber: function(e) {
    // 参数e是绑定的授权方法自动传入过来的, 主要是为了拿到vi和encryptedData值从后台换取用户联系方式
    if ("getPhoneNumber:ok" != e.detail.errMsg) {
      wx.showModal({
        title: '提示',
        content: "取消账号绑定升级，将继续使用临时账号",
        confirmText: '继续绑定',
        cancelText: '确定取消',
        success: function(res) {
          console.log(res)
          if (!res.confirm) {
            wx.switchTab({
              url: '../my/index'
            })
          }
        }
      })
      return;
    }
    var iv = e.detail.iv;
    var encryptedData = e.detail.encryptedData;
    var _this = this;
    //调用后台接口获取用户手机号码
    wx.login({
      success: function(res) {
        if (res.code) {
          //console.log('获取用户登录态成功！' + res.code);
          //调用服务端登录
          wx.request({
            url: config.ucHost + '/LoginPhone.htm',
            method: 'POST',
            data: {
              encryptedData: encryptedData,
              code: res.code,
              IV: iv
            },
            success: function(data) {
              if (data.data.Success) {
                var userInfo = data.data;
                // if (userInfo.IsAdd) {
                //   wx.reLaunch({
                //     url: '../auth/userinfo/index?uid=' + userInfo.Uid + '&openId=' + userInfo.Openid
                //   })
                // } else {
                //   wx.setStorageSync('UserInfo', userInfo);
                //   wx.switchTab({
                //     url: '../my/index'
                //   })
                // }
                wx.setStorageSync('UserInfo', userInfo);
                wx.switchTab({
                  url: '../my/index'
                })
              }
            },
            fail: function(msg) {

            }
          })
          return res.code;
        } else {
          //console.log('获取用户登录态失败！' + res.errMsg);
        }
      }
    })
  },
  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      console.log(e);
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false
      });
      return;
      //第一登录的补充基础信息
      var nickName = e.detail.userInfo.nickName;
      var nvatarUrl = e.detail.userInfo.avatarUrl;
      var gender = e.detail.userInfo.gender;
      var OpenId = e.detail.userInfo.OpenId;
      var gender = e.detail.userInfo.gender;

      wx.request({
        url: config.ucHost + '/Login.htm',
        method: 'POST',
        data: {
          OpenId: openId,
          NickName: nickName,
          NvatarUrl: nvatarUrl,
          Gender: gender,
          avatarUrl
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