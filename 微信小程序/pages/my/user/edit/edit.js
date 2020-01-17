// pages/my/user/edit/edit.js
var app = getApp()
var config = require('../../../../config');
Page({
  data: {
    userInfo: {},
    IsBind: false,
    Mobile: '',
    password: '',
    type: 0
  },
  onLoad: function(options) {
    var that = this;
    let isIphoneX = app.globalData.isIphoneX;
    that.setData({
      isIphoneX: isIphoneX,
    })
    let type = options.type;
    if (type) //2登录密码，1昵称
    {
      that.setData({
        type: type
      });
      if (type == 1) {
        wx.setNavigationBarTitle({
          title: '设置昵称'
        })
      } else if (type == 2) {
        wx.setNavigationBarTitle({
          title: '设置登录密码'
        })
      }
    }
  },
  onShow: function() {
    this.getUserInfo();
  },
  getUserInfo: function() {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo) {
      console.log(userInfo)
      that.setData({
        userInfo: userInfo,
        Mobile: userInfo.Mobile,
        IsBind: userInfo.Mobile ? true : false
      })
    })
  },
  bindMobile: function(e) {
    var mobile = e.detail.value;
    if (!mobile) return;
    var myreg = /^1\d{10}$/;
    if (!myreg.test(mobile)) {
      wx.showToast({
        title: '手机号格式有误',
        icon: 'loading',
        duration: 1500
      })
      return;
    }
  },
  bindPwd: function(e) {
    var pwd = e.detail.value;
    if (!pwd) return;
    if (pwd.length < 6) {
      wx.showToast({
        title: '密码长度必须大于6位',
        icon: 'loading',
        duration: 1500
      })
      return;
    }
  },
  //绑定手机号码
  submitForm: function(e) {
    var that = this;
    var inputSub = e.detail.value;
    var mobile = inputSub.mobile;
    var pwd = inputSub.pwd;
    var pwd1 = inputSub.pwd1;
    var oldpwd = inputSub.oldpwd;
    if (that.data.userInfo.IsPwd)
    {
      if (!oldpwd) {
        wx.showToast({
          title: '请输入旧密码！',
          icon: 'none',
          duration: 1500
        })
        return;
      }
    }
    if (!mobile) {
      wx.showToast({
        title: '请输入绑定的手机号！',
        icon: 'loading',
        duration: 1500
      })
      return;
    }
    var myreg = /^1\d{10}$/;
    if (!myreg.test(mobile)) {
      wx.showToast({
        title: '手机号格式有误！',
        icon: 'loading',
        duration: 1500
      })
      return;
    }
    if (!pwd) {
      wx.showToast({
        title: '请输入密码！',
        icon: 'none',
        duration: 1500
      })
      return;
    }
    if (pwd.length < 6) {
      wx.showToast({
        title: '密码长度必须大于6位',
        icon: 'none',
        duration: 1500
      })
      return;
    }
    if (pwd1 != pwd) {
      wx.showToast({
        title: '确定新密码与设置密码不一致',
        icon: 'none',
        duration: 1500
      })
      return;
    }
    var uId = that.data.userInfo.Uid;
    var openId = that.data.userInfo.Openid;
    wx.request({
      url: config.ucHost + '/BindUserPwd.htm',
      data: {
        Uid: uId,
        OpenId: openId,
        Password: pwd,
        OldPassword: oldpwd,
        Password1: pwd1
      },
      success: function(result) {
        if (result.data.Success) {
          var userInfo = result.data;
          wx.setStorageSync('UserInfo', userInfo);
          that.setData({
            password: '',
            IsBind: true,
          });
          wx.showModal({
            content:'操作成功',
            icon: 'success',
            confirmText: "确定",
            showCancel:false,
            success: function() {
              wx.navigateBack({
                changed: true
              })
            }
          })
        } else {
          wx.showToast({
            title: result.data.Msg,
            icon: 'none',
            duration: 2000
          });
        }
      },
      complete: function() {

      }
    })
  },
  //修改昵称
  submitNameForm: function(e) {
    var that = this;
    var inputSub = e.detail.value;
    var RealName = inputSub.RealName;
    console.log(RealName)
    if (!RealName) {
      wx.showToast({
        title: '请输入昵称！',
        icon: 'loading',
        duration: 1500
      })
      return;
    }
    var uId = that.data.userInfo.Uid;
    var openId = that.data.userInfo.Openid;
    wx.request({
      url: config.ucHost + '/login/BindUserInfo.htm',
      data: {
        Uid: uId,
        OpenId: openId,
        RealName: RealName
      },
      success: function(result) {
        if (result.data.Success) {
          that.setData({
            password: '',
            IsBind: true,
          });
          var userInfo = result.data;
          wx.setStorageSync('UserInfo', userInfo);
          wx.showModal({
            content: '操作成功',
            icon: 'success',
            confirmText: "确定",
            showCancel: false,
            success: function () {
              wx.navigateBack({
                changed: true
              })
            }
          })
        } else {
          wx.showToast({
            title: result.data.Msg,
            icon: 'loading',
            duration: 2000
          });
        }
      },
      complete: function() {

      }
    })
  }
})