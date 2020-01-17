// pages/product/detail/index.js
var app = getApp()
var config = require('../../../config');
Page({
  data: {

  },
  /* 调用后台数据 */
  onLoad: function (options) {
    var that=this;
    var qid = options.qid || 0;
    that.setData({
      qid: qid
    });
    that.getUserInfo();
  },
  getUserInfo: function () {
    var that = this;
    var userInfo = wx.getStorageSync('UserInfo');
    if (userInfo) {
      that.setData({
        userInfo: userInfo
      })
    }
  },
  onShow:function(){
    var that=this;
    that.getquestlistData(that.data.qid);
  },
  // 获取数据
  getquestlistData: function (e) {
    var that = this;
    wx.request({
      url: config.host + '/questList.htm?qid='+e,
      header: { 'content-type': 'application/json' },
      success: function (res) {
        if (res.statusCode != 200) {
          return;
        }
        that.setData({
          replylist: res.data.replylist,
          queslist: res.data.queslist
        })
      },
      complete: function () {
        that.setData({
          hiddenLoading: true
        })
      }
    })
  },
  //提交回复
  bindFormSubmit: function (e) {
    var that = this;
    var newAddr = [];

    if (!that.data.userInfo) {
      wx.showToast({
        title: '请登录后再回答！',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if (!e.detail.value.textarea) {
      wx.showToast({
        title: '请填写回答内容',
        icon: 'loading',
        duration: 1000
      })
      return;
    }
    var qid = that.data.qid;
    newAddr.UserName = that.data.userInfo.UserNick;
    newAddr.UserId = that.data.userInfo.Uid;
    newAddr.ParentId = qid
    newAddr.Content = e.detail.value.textarea;

    wx.request({
      url: config.host + '/EditQuest.htm',
      data: newAddr,
      header: { 'content-type': 'application/json' },
      success: function (res) {
        console.log(res)
        if (res.statusCode != 200) {
          return;
        }
        if (res.data.success) {
          wx.showModal({
            title: '提示',
            content: '回复问题成功！',
            showCancel: true,
            success: function (res) {
              that.setData({
                showReply: false
              });
              that.onShow();
            }
          })

        } else {
          wx.showModal({
            title: '提示',
            content: '回复问题失败！',
            showCancel: true,
            success: function (res) {
              that.setData({
                showReply: false
              });
            }
          })
        }
      },
      complete: function () {
        //isSubmit = false;
      }
    })

  },
  // 回复问题弹窗
  btnsReply: function(e) {
    var that=this;
    var qid = e.currentTarget.dataset.qid;
    var data = that.data.queslist;
    console.log(data)
    data.forEach(function (item, index) {
      if (item.qid == qid) {
        that.setData({
          text: item.content
        })
        return;
      }
    })

    var animation = wx.createAnimation({
      duration: 0,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    this.setData({
      animationData: animation.export()
    })
    if (e.currentTarget.dataset.reply == 1) {
      this.setData({
        showReply: true
      });
    }
    setTimeout(function() {
      // animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.reply == 0) {
        this.setData({
          showReply: false
        });
      }
    }.bind(this), 0)
  }
})