// pages/cart/group_order/group_order.js
var app = getApp()
var config = require('../../../config');

Page({
  data: {
    hiddenLoading: false,
    hiddenSaveLoading: true,
    userInfo: {},
    carts: [],
    totalpro: 0,
    postfee: 0,
    totalall: 0,
    canCoupon: false,
    canMjs: false,
    tid: 0,
    selActivity: false,
    selCoupon: {},
    selMjs: {},
  },
  /* 调用数据 */
  onLoad: function () {
    this.getcartsData();
  },
  onShow: function () {
    var that = this;
    //console.log("进入onShow");
    if (this.data.selActivity) {
      that.setData({
        selActivity: false
      });
      that.sum();
      return;
    }
    //console.log("运行onShow");
    that.setData({
      hiddenLoading: false
    });
    that.getUserInfo();
  },
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
    });
  },
  //登录成功
  loginSuccess: function () {
    var that = this;
    var userId = that.data.userInfo.Uid || 0;
    if (userId <= 0) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '会员登录异常,返回首页',
        success: function (res) {
          if (res.confirm) {
            //console.log('用户点击确定')
            wx.switchTab({
              url: '../cart_list/index'
            })
          }
        }
      })
      return;
    }
    this.getUserAddr();
  },
  //获取收货地址
  getUserAddr: function () {
    var that = this;
    var addr = wx.getStorageSync('myAddress');
    if (addr) {
      //console.log("缓存收货地址", addr);
      that.setData({
        address: addr
      });
      //计算运费
      that.getFreightFee();
    } else {
      //console.log("重新获取收货地址", addr);
      //获取默认收货地址
      that.getAddressData();
    }
  },
  // 获取地址列表数据
  getAddressData: function () {
    var that = this;
    wx.request({
      url: config.ucHost + '/Address/getDefaultAddressData.htm',
      data: { UserId: that.data.userInfo.Uid },
      header: { 'content-type': 'application/json' },
      success: function (res) {
        //console.log(res.data);
        if (res.statusCode != 200) {
          //console.log("服务器请求异常", res);
          that.setData({
            hiddenLoading: true,
          });
          return;
        }
        if (res.data.success) {
          var address = res.data.data;
          that.setData({
            address: address
          });
          wx.setStorageSync('myAddress', address);
          //计算运费
          that.getFreightFee();
          return;
        } else {
          that.setData({
            address: null
          });
        }
        that.setData({
          hiddenLoading: true,
        });
      },
      fail: function () {
        //console.log("获得失败");
        that.setData({
          hiddenLoading: true,
        });
      },
      complete: function () {
        //console.log("获得地址列表结束", Date.now());
      }
    })
  },
  //获取运费
  getFreightFee: function () {
    var that = this;
    var mycarts = that.data.carts;
    //console.log("开始计算运费咯", mycarts);
    var postData = {};
    postData.UserId = that.data.userInfo.Uid;
    postData.RegionId = that.data.address.CityId;

    var mycartsPost = [];
    for (var i = 0; i < mycarts.length; i++) {
      var item = mycarts[i];
      var itemPost = { tpid: item.tpid, pid: item.pid, price: item.price, num: item.num, Postage_Id: item.Postage_Id, Item_Weight: item.Item_Weight, Item_Size: item.Item_Size };
      mycartsPost.push(itemPost);
    }
    postData.MyCarts = mycartsPost;

    //console.log("请求数据", postData);
    wx.request({
      url: config.host + '/Team/getFreightFee.htm',
      method: 'POST',
      data: postData,
      header: { 'content-type': 'application/json' },
      success: function (res) {
        //console.log(res.data);
        if (res.statusCode != 200) {
          //console.log("服务器请求异常", res);
          return;
        }
        var result = res.data;
        if (result.success) {
          wx.setStorageSync('myActivity', result.activity);
          that.setData({
            postfee: result.postfee.toFixed(2),
            canCoupon: result.activity.Coupons,
            //canMjs: result.activity.ActivityMjss,
            tid: 0,
            selCoupon: {},
            selMjs: {}
          });
          that.sum();
          //console.log("获得运费成功", Date.now());
        } else {
          wx.removeStorageSync('myActivity');
        }
      },
      fail: function () {
        //console.log("获得失败");
      },
      complete: function () {
        //console.log("获得运费结束", Date.now());
        that.setData({
          hiddenLoading: true,
        });
      }
    })
  },
  // 获取购物袋列表数据
  getcartsData: function () {
    var that = this;
    try {
      var selcarts = wx.getStorageSync('myGroupPro');
      if (selcarts && selcarts.length > 0) {
        that.setData({
          carts: selcarts
        })
        that.sum();
      } else {
        wx.switchTab({
          url: '../../index/index'
        })
      }
    } catch (e) {
      wx.removeStorageSync('myGroupPro');
      wx.showModal({
        title: '提示',
        content: '数据读取异常，请返回重试！',
        confirmText: '返回重试',
        cancelText: '返回首页',
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../cart_list/index'
            })
          } else if (res.cancel) {
            //console.log('用户点击取消');
            wx.switchTab({
              url: '../../index/index'
            })
          }
        }
      })

    }
  },
  /* 计算总金额 */
  sum: function () {
    var carts = this.data.carts;
    var total = 0;
    var proNum = 0;
    for (var i = 0; i < carts.length; i++) {
      if (carts[i].selected) {
        total += carts[i].num * carts[i].price;
      }
    }
    var postfee = 1.00 * this.data.postfee;
    var tid = this.data.tid;
    var couponPrice = 0;
    if (tid == 1) {
      var selCoupon = this.data.selCoupon;
      couponPrice = selCoupon.CouponPrice;
      if (selCoupon.IsFreePost) {
        postfee = 0;
      } else {
        postfee = selCoupon.PostFee;
      }
    } else if (tid == 2) {
      var selMjs = this.data.selMjs;
      couponPrice = selMjs.MjsPrice;
      if (selMjs.IsFreePost) {
        postfee = 0;
      } else {
        postfee = selMjs.PostFee;
      }
    }
    //console.log("运费", postfee)
    this.setData({
      carts: carts,
      totalpro: total.toFixed(2),
      postfee: postfee.toFixed(2),
      couponPrice: couponPrice.toFixed(2),
      totalall: (total + postfee - couponPrice).toFixed(2),
    });
  },

  /* 跳转页地址列表 */
  onaddresslist: function () {
    wx.navigateTo({
      url: '../address_list/index'
    })
  },
  /* 跳转页新增地址 */
  onaddressadd: function () {
    wx.navigateTo({
      url: '../address_edit/index?pageIndex=1',
    })
  },

  // 跳转至详情页
  navigateDetail: function (e) {
    let pid = e.currentTarget.dataset.pid || 0;
    wx.navigateTo({
      url: '../../product/group_proitem/group_proitem?pid=' + pid
    })
  },

  //跳转到优惠券选择
  navigateCoupon: function (e) {
    var that = this;
    let tid = e.currentTarget.dataset.tid || 0;
    // if (tid == 0) return;
    // that.setData({
    //   tid: tid
    // });
    var href = '../../cart/coupon/index?tid=' + tid;
    if (tid == 1) {
      var couponId = that.data.selCoupon.CouponId || 0;
      if (couponId > 0) {
        href += '&couponid=' + couponId;
      }
    } else if (tid == 2) {
      var mjsId = that.data.selCoupon.MjsId || 0;
      if (mjsId > 0) {
        href += '&mjsId=' + mjsId;
      }
    }
    wx.navigateTo({
      url: href
    })
  },

  /* 选择数量减号 */
  bindMinus: function (e) {
    var index = parseInt(e.currentTarget.dataset.index);
    var num = this.data.carts[index].num;
    // 如果只有1件了，就不允许再减了
    if (num > 1) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    // 购物车数据
    var carts = this.data.carts;
    carts[index].num = num;
    // 按钮可用状态
    carts[index].minbtn = minusStatus;
    carts[index].maxbtn = 'normal';

    // 将数值与状态写回
    this.setData({
      carts: carts
    });
    this.sum();
    this.saveChangeCart();
  },

  /* 选择数量加号 */
  bindPlus: function (e) {
    var index = parseInt(e.currentTarget.dataset.index);
    var num = this.data.carts[index].num;
    // 自增
    num++;

    var carts = this.data.carts;

    //最大值
    var maxnum = this.data.carts[index].maxnum;
    if (num >= maxnum) {
      num = maxnum;
      carts[index].maxbtn = 'disabled';
    }

    var limit_Buy_Number = this.data.carts[index].limit_Buy_Number;
    if (limit_Buy_Number > 0) {
      if (num >= limit_Buy_Number) {
        num = limit_Buy_Number;
        carts[index].maxbtn = 'disabled';
      }
    }

    // 按钮可用状态
    carts[index].minbtn = 'normal';
    // 购物车数据
    carts[index].num = num;

    // 将数值与状态写回
    this.setData({
      carts: carts
    });
    this.sum();
    this.saveChangeCart();
  },

  /* 选择数量直接输入 */
  bindManual: function (e) {
    var index = parseInt(e.currentTarget.dataset.index);
    var num = parseInt(e.detail.value);
    var carts = this.data.carts;

    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    // 按钮可用状态
    carts[index].minbtn = minusStatus;


    //最大值
    var maxnum = this.data.carts[index].maxnum;
    if (num >= maxnum) {
      num = maxnum;
    }
    carts[index].maxbtn = num >= maxnum ? 'disabled' : 'normal';

    var limit_Buy_Number = this.data.carts[index].limit_Buy_Number;
    if (limit_Buy_Number > 0) {
      if (num >= limit_Buy_Number) {
        num = limit_Buy_Number;
        carts[index].maxbtn = 'disabled';
      }
    }

    // 购物车数据
    carts[index].num = num;

    // 将数值与状态写回
    this.setData({
      carts: carts
    });
    this.sum();
    this.saveChangeCart();
  },

  //修改购物车信息保存至缓存
  saveChangeCart: function () {
    wx.setStorageSync('myGroupPro', this.data.carts);
  },

  //保存购物车
  saveMyCarts: function (e) {
    var that = this;
    if (!that.data.address) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'loading',
        duration: 2000
      })
      return;
    }
    if (!that.data.carts) {
      wx.showToast({
        title: '购物车内容已为空',
        icon: 'loading',
        duration: 2000
      });
      wx.switchTab({
        url: '../cart_list/index'
      })
      return;
    }

    that.setData({
      hiddenSaveLoading: false,
    });
    let fromid = e.detail.formId;
    var postData = {};
    postData.Openid = that.data.userInfo.Openid;
    postData.UserId = that.data.userInfo.Uid;
    postData.UserNick = that.data.userInfo.UserNick;
    postData.BuyerUserHeadImg = that.data.userInfo.UserHead;
    postData.Form_Id = fromid;

    postData.UseCoupon = (that.data.selCoupon && that.data.selCoupon.CouponId > 0) ? true : false;
    postData.UserCouponId = 0;
    if (postData.UseCoupon) {
      postData.UserCouponId = that.data.selCoupon.CouponId;
    }
    // postData.UseMjs = (that.data.selMjs && that.data.selMjs.MjsId > 0) ? true : false;
    // postData.MjsId = 0;
    // if (postData.UseMjs) {
    //   postData.MjsId = that.data.selMjs.MjsId;
    // }
    postData.RegionId = that.data.address.CityId;
    postData.RegionPath = that.data.address.RegionPath;
    postData.ReceiverAddress = that.data.address.Address;
    postData.ReceiverMobile = that.data.address.Tel;
    postData.ReceiverZip = that.data.address.Zipcode;
    postData.ReceiverName = that.data.address.Receiver;

    postData.BuyerMemo = that.data.buyerMsg;
    postData.ProPriceTotal = that.data.totalpro;
    postData.PaymentPriceTotal = that.data.totalall;
    postData.HasPostFee = false;
    postData.FreightFee = that.data.postfee;
    postData.TotalQuantity = 0;

    var mycarts = that.data.carts;
    //console.log("开始保存咯", mycarts);
    var mycartsPost = [];
    for (var i = 0; i < mycarts.length; i++) {
      var item = mycarts[i];
      var proimg = item.img.replace(config.pics, '')
      var itemPost = {
        pid: item.pid,
        skuid: item.skuid,
        Barcode: item.Barcode,
        Postage_Id: item.Postage_Id,
        img: proimg,
        h1: item.h1,
        h2: item.h2,
        price: item.price,
        num: item.num,
        SubTotal: item.price * item.num
      };
      mycartsPost.push(itemPost);
      postData.TotalQuantity = postData.TotalQuantity + item.num

      postData.Team_Order_Id = item.toid;
      postData.Team_Product_Id = item.tpid;
      postData.Team_IsLottery = item.Team_IsLottery;
      postData.limit_Buy_One = item.limit_Buy_One;
      postData.Team_Num = item.Team_Num;
    }
    postData.MyCarts = mycartsPost;

    //console.log("请求数据", postData);
    wx.request({
      url: config.host + '/Team/SaveMyTeamCarts.htm',
      method: 'POST',
      data: postData,
      header: { 'content-type': 'application/json' },
      success: function (res) {
        //console.log(res.data);
        if (res.statusCode != 200) {
          //console.log("服务器请求异常", res);
          return;
        }
        var result = res.data;
        if (result.success) {
          that.clearCarts();
          that.setData({
            toid: result.toid
          });
          if (result.needPay){
            //需要付款的
            that.setPayment(result);
          }else{
            wx.redirectTo({
              url: '../../product/group_item/group_item?toid=' + result.toid
            })
          }
        } else {
          //异常提醒
          wx.showModal({
            title: '提示',
            content: '购物车保存异常:' + result.msg,
            confirmText: '返回重试',
            cancelText: '返回首页',
            success: function (res) {
              if (res.confirm) {
                //console.log('用户点击确定')
                wx.navigateBack({
                  delta: 1
                })
              } else if (res.cancel) {
                //console.log('用户点击取消')
                wx.switchTab({
                  url: '../../index/index'
                })
              }
            }
          })
        }
      },
      fail: function () {
        //console.log("获得失败");
      },
      complete: function () {
        //console.log("购物车保存结束", Date.now());
        that.setData({
          hiddenSaveLoading: true,
        });
      }
    })
  },
  //清除保存了的产品
  clearCarts: function () {
    var cartsValue = wx.getStorageSync('myGroupPro');
    var selcarts = [];
    for (var i = 0; i < cartsValue.length; i++) {
      if (!cartsValue[i].selected) {
        selcarts.push(cartsValue[i])
      }
    }
    wx.setStorageSync('myGroupPro', selcarts);
  },
  //保存成功调用支付
  setPayment: function (result) {
    var par = result.Parameters;
    var toid=this.data.toid;
    //console.log("支付返回参数", par);
    wx.requestPayment({
      timeStamp: par.timeStamp,
      nonceStr: par.nonceStr,
      package: par.package,
      signType: par.signType,
      paySign: par.paySign,
      success: function (res) {
        var msg = '支付失败';
        if (res.errMsg == 'requestPayment:ok') {
          msg = '支付成功';
        }
        wx.showToast({
          title: msg,
          icon: 'success',
          duration: 2000
        });
        wx.redirectTo({
          url: '../../product/group_item/group_item?toid=' + toid
          //url: '../group_paytips/group_paytips?toid=' + toid
        })
      },
      fail: function (res) {
        var msg = '';
        if (res.errMsg == 'requestPayment:fail cancel') {
          msg = '您取消支付了！';
        } else {
          msg = '支付失败！';
        }
        wx.showToast({
          title: msg,
          icon: 'loading',
          duration: 2000
        });
        wx.redirectTo({
          url: '../../product/group_item/group_item?toid=' + toid
          //url: '../group_paytips/group_paytips?toid=' + toid
        })
      }
    })

  },

})