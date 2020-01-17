// pages/my/attest/index.js
var app = getApp()
var config = require('../../../config');
var form_data;
Page({
  data: {
    // 认证状态
    attestStatus: [{
        id: 0,
        icons: "cuIcon-infofill",
        bgcolor: "bg-orange",
        status: "该账号未认证，请进行认证！"
      },
      {
        id: 1,
        icons: "cuIcon-timefill",
        bgcolor: "bg-blue",
        status: "认证资料审核中，请耐心等候!（下拉刷新查看审核状态）"
      },
      {
        id: 2,
        icons: "cuIcon-roundcheckfill",
        bgcolor: "bg-green",
        status: "认证资料审核通过，可以去购物啦!"
      },
      {
        id: 3,
        icons: "cuIcon-roundclosefill",
        bgcolor: "bg-pink",
        status: "资料审核失败，请重新上传！"
      }
    ],
    hiddenLoading: false,
    id: 0,
    // 认证类型
    array: ['请选择认证类型', '个人认证', '企业认证'],
    objectArray: [{
        id: 0,
        name: '请选择认证类型'
      },
      {
        id: 1,
        name: '个人认证'
      },
      {
        id: 2,
        name: '企业认证'
      },
    ],
    index: 0,
    personalmsg: false,
    companymsg: true,
    imgList: [],
    count: 2,
    context: "上传身份证正反面",
    hiddenuploading: true
  },
  onLoad: function(options) {
    var that = this
    that.getUserInfo();
  },
  //检查登录
  getUserInfo: function() {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo) {
      that.setData({
        userInfo: userInfo,
        IsAuth: userInfo.IsAuth
      });
      //登录成功
      that.getIsAuthData();
    })
  },
  getIsAuthData: function() {
    var that = this;
    wx.request({
      url: config.ucHost + '/Default/GetIsAuth.htm',
      data: {
        memberId: that.data.userInfo.Uid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.data.Success) {
          that.setData({
            hiddenLoading: true
          });
          if (res.data.data != null) {
            var data = res.data.data;
            that.setData({
              auth: data,
              id: res.data.IsAuth,
              index: data.InvoiceType
            });
            if (data.InvoiceType == 1) {
              that.setData({
                imgList: that.data.imgList.concat(data.CardFront)
              })
              that.setData({
                imgList: that.data.imgList.concat(data.SideCard),
                count: 2,
                personalmsg: false,
                companymsg: true,
                context: "上传身份证正反面"
              })

            } else if (data.InvoiceType == 2) {
              that.setData({
                personalmsg: true,
                companymsg: false,
                imgList: that.data.imgList.concat(data.BusinessCard),
                count: 1,
                context: "上传营业执照"
              })
            }
          }
        }
      }
    })
  },
  bindCard: function(e) {
    if (!(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(e.detail.value))) {
      wx.showToast({
        title: '身份证号码有误',
        duration: 2000,
        icon: 'none'
      });
      return false;
    }
  },
  //  选择认证类型
  bindPickerChange: function(e) {
    var that = this;
    this.setData({
      index: e.detail.value
    })
    if (e.detail.value == 1) {
      that.setData({
        personalmsg: false,
        companymsg: true,
        count: 2,
        imgList: [],
        context: "上传身份证正反面"
      })
    } else if (e.detail.value == 2) {
      that.setData({
        personalmsg: true,
        companymsg: false,
        count: 1,
        imgList: [],
        context: "上传营业执照"
      })
    }
  },
  //POST
  formSubmit: function(e) {
    var that = this;
    if (that.data.userInfo.IsAuth == 2) {
      wx.showModal({
        title: '提示',
        content: '当前已通过实名认证，再次提交审核需要1~3日。',
        icon: 'success',
        confirmText: "再次提交",
        success: function(res) {
          if (res.confirm) {
            that.updataload(e);
          }
        }
      })
    } else {
      that.updataload(e)
    }
  },
  updataload: function(e) {
    var that = this;
    form_data = e.detail.value;
    form_data.memberID = that.data.userInfo.Uid;
    var data = that.data;
    if (form_data.InvoiceType == 0) {
      wx.showToast({
        title: '请选择认证类型！',
        icon: 'none',
      })
    } else if (form_data.InvoiceType == 1) {
      if (form_data.RealName == "") {
        wx.showToast({
          title: '请填写个人姓名',
          icon: 'none',
        })
        return;
      }
      if (form_data.CardId == "") {
        wx.showToast({
          title: '请填写个人身份证号码',
          icon: 'none',
        })
        return;
      }
      if (!(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test((form_data.CardId)))) {
        wx.showToast({
          title: '身份证号码有误',
          duration: 2000,
          icon: 'none'
        });
        return;
      }
      if (data.imgList == [] || data.imgList.length != 2) {
        wx.showToast({
          title: '上传身份证正反面',
          icon: 'none',
        })
        return;
      }
      that.setData({
        hiddenuploading: false
      })
      that.btn_up(0);
    } else if (form_data.InvoiceType == 2) {
      if (form_data.CompanyName == "") {
        wx.showToast({
          title: '请输入公司名称',
          icon: 'none',
        })
        return;
      }
      if (form_data.InvoiceIdentifier == "") {
        wx.showToast({
          title: '请输入纳税人识别码',
          icon: 'none',
        })
        return;
      }
      if (form_data.invoiceAddress == "") {
        wx.showToast({
          title: '请输入注册地址',
          icon: 'none',
        })
        return;
      }
      if (form_data.invoicePhone == "") {
        wx.showToast({
          title: '请输入注册电话',
          icon: 'none',
        })
        return;
      }
      if (form_data.invoiceBank == "") {
        wx.showToast({
          title: '请输入开户银行',
          icon: 'none',
        })
        return;
      }
      if (form_data.invoiceAccount == "") {
        wx.showToast({
          title: '请输入银行账户',
          icon: 'none',
        })
        return;
      }
      if (data.imgList == [] || data.imgList.length != 1) {
        wx.showToast({
          title: '请上传营业执照',
          icon: 'none',
        })
        return;
      }
      that.setData({
        hiddenuploading: false
      })
      that.btn_up(2);
    }
  },
  //判断上传图片
  btn_up: function(e) {
    var that = this;
    var data = form_data;
    var image_belong;
    switch (e) {
      case 0: //身份证正面
        image_belong = that.data.imgList[e];
        //data.index = e;
        break;
      case 1: //身份证反面
        image_belong = that.data.imgList[e];
        //data.index = e;
        break;
      case 2: //营业执照
        image_belong = that.data.imgList[0];
        // data.index = e;
        break;
    }
    if (image_belong) {
      if (image_belong.indexOf("pics") >= 0) { //已提交审核再次提交又没提交图片的
        if (e > 0) {
          that.uploadData()
        } else {
          that.btn_up(1);
        }
      } else {
        wx.uploadFile({
          url: config.ucHost + '/Default/uploadFileImg.htm',
          header: {
            'content-type': 'multipart/form-data'
          },
          filePath: image_belong,
          name: 'image',
          success: function(res) {
            var json = JSON.parse(res.data)
            if (json.statusCode != 200) {}
            if (json.success) {
              if (e == 0) {
                form_data.CardFront = json.IsAuthImg;;
              } else if (e == 1) {
                form_data.SideCard = json.IsAuthImg;;
              }
              if (e == 2) {
                form_data.BusinessCard = json.IsAuthImg;;
              }
              if (e > 0) {
                that.uploadData()
              } else {
                that.btn_up(1);
              }
            } else {
              wx.showToast({
                title:'上传失败！',
                icon: 'none',
                duration: 2000
              });
              return;
            }
          }
        })
      }
    } else {
      that.uploadData()
    }
  },
  //上传资料
  uploadData: function() {
    var that = this;
    wx.request({
      url: config.ucHost + '/Default/IsAuth.htm',
      header: {
        'content-type': 'application/json'
      },
      data: form_data,
      success: function(res) {
        if (res.statusCode != 200) {}
        if (res.data.Success) {
          var userInfo = res.data;
          wx.setStorageSync('UserInfo', userInfo);
          that.setData({
            hiddenuploading: true,
            id: 1,
            IsAuth: 1
          })
          wx.showToast({
            title: '操作成功',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          });
        }
      }
    })
  },

  // 上传图片
  chooseImage(e) {
    var count = e.currentTarget.dataset.count ? e.currentTarget.dataset.count : 2;
    if (this.data.imgList.length > 0) {
      count = 1;
    }
    wx.chooseImage({
      count: count, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  onPullDownRefresh: function() {
    var that = this;
    wx.stopPullDownRefresh()
    wx.removeStorageSync('UserInfo');
    var userId = that.data.userInfo.Uid || 0;
    if (userId > 0) {
      that.GetUserData(userId);
    }
  },
  //获取用户信息
  GetUserData: function(userId) {
    var that = this;
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
          that.setData({
            imgList: []
          })
          var userInfo = result.data;
          wx.setStorageSync('UserInfo', userInfo);
        }
      },
      complete: function() {
        that.onLoad();
      }
    })
  },
  DelImg(e) {
    wx.showModal({
      content: '确定要删除这张图片吗？',
      cancelText: '取消',
      confirmText: '删除',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList,
          })
          console.log(this.data.imgList)
        }
      }
    })
  }

})