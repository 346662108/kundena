// pages/my/user/user.js
//index.js
var app = getApp()
var config = require('../../../config');
Page({
  data: {
    picker: ['保密', '男', '女'],
    imgList: [],
    userInfo: [],
    hiddenLoading: true
  },
  onLoad: function() {
  },
  onShow:function(){
    this.getUserInfo();
  },
  getUserInfo: function() {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo) {
      that.setData({
        userInfo: userInfo,
        imgList: that.data.imgList.concat(userInfo.UserHead),
        index: userInfo.Sex,
        IsAuth: userInfo.IsAuth
      });
    })
  },

  //设置头像
  ChooseImage() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        this.setData({
          imgList: res.tempFilePaths,
          hiddenLoading: false
        })
        var that = this;
        var data = [];
        data.Uid = that.data.userInfo.Uid;
        wx.uploadFile({
          url: config.ucHost + '/login/upMemberHeadImg.htm',
          header: {
            'content-type': 'multipart/form-data'
          },
          filePath: res.tempFilePaths[0],
          name: 'image',
          success: function(result) {
            var json = JSON.parse(result.data)
            that.setData({
              hiddenLoading: true
            })
            if (result.statusCode != 200) {
              console.log("服务器请求异常", result);
              return;
            }
            if (json.success) {
              data.Headimgurl = json.Headimgurl;
              that.submitFormPost(data);
            } else {
              wx.showToast({
                title: "上传失败",
                icon: 'loading',
                duration: 2000
              });
            }
          }
        })

      }
    });
  },

  submitFormPost: function(data) {
    var that=this;
    wx.request({
      url: config.ucHost + '/login/BindUserInfo.htm',
      data: data,
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode != 200) {
          wx.showToast({
            title: '服务器请求异常',
            icon: 'loading',
            duration: 2000
          });
          return;
        }
        that.setData({
          hiddenLoading: true
        })
        if (res.data.Success) {
          var userInfo = res.data;
          wx.setStorageSync('UserInfo', userInfo);
          wx.showToast({
            title: '操作成功',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: res.data.Msg,
            icon: 'loading',
            duration: 2000
          });
        }
      }
    })
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  // 设置性别
  GenderChange(e) {
    var that = this;
    that.setData({
      index: e.detail.value
    })

    var uId = that.data.userInfo.Uid;
    var openId = that.data.userInfo.Openid;
    var sex = that.data.index
    wx.request({
      url: config.ucHost + '/login/BindUserInfo.htm',
      data: {
        Uid: uId,
        OpenId: openId,
        Sex: sex
      },
      success: function(result) {
        if (result.data.Success) {
          var userInfo = result.data;
          wx.setStorageSync('UserInfo', userInfo);
          that.setData({
            password: '',
            IsBind: true,
          });

          wx.showToast({
            title: '操作成功',
            icon: 'success',
            duration: 1000
          })
        } else {
          wx.showToast({
            title: result.data.Msg,
            icon: 'loading',
            duration: 1000
          });
        }
      }
    })

  },
  //设置昵称等
  editLink: function(e) {
    var type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '../user/edit/edit?type=' + type
    })
  },
  //实名认证
  gotoattest: function() {
    wx.navigateTo({
      url: '../attest/index'
    })
  },
  //收货地址
  gotoaddresslist: function() {
    wx.navigateTo({
      url: '../../cart/address_list/index?pageIndex=1&my=true'
    })
  }
})