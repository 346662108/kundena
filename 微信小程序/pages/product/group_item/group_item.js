// pages/product/group_item/group_item.js
var app = getApp()
var config = require('../../../config');
var command = require('../../../utils/command');
var timer = require('../../../utils/wxTimer');
var wxTimer;

Page({
  data: {
    toid: 0,
    userInfo: {},
    // 拼团--售后服务数据
    service: command.getserviceData(),
    teamFirstObj: {},
    teamUserFirst: {},
    teamUserList: [],
    // 拼团--为你推荐数据
    teamProYouLike: [],

    addtype: 2,
    loadAttr: false,
    commodityAttr: [],
    attrValueList: [],
    // 商品选择数量
    num: 1,
    minusStatus: 'disabled',
    maxusStatus: 'normal',
    wxTimerList: {}
  },
  //页面加载
  onLoad: function (options) {
    var that = this;
    var toid = options.toid || 0;
    that.setData({
      toid: toid
    });
  },
  onShow: function () {
    var that = this;
    var toid = that.data.toid;
    if (wxTimer) {
      wxTimer.stop();
    }
    that.getUserInfo(toid);
  },
  onUnload: function () {
    if (wxTimer) {
      wxTimer.stop();
    }
  },
  //检查登录
  getUserInfo: function (toid) {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //console.log(userInfo)
      that.setData({
        userInfo: userInfo
      });
      //登录成功
      that.loginSuccess(toid);
    })
  },
  //登录成功
  loginSuccess: function (toid) {
    var that = this;
    var userId = that.data.userInfo.Uid || 0;
    if (userId <= 0) {
      wx.switchTab({
        url: '../../index/index'
      })
      return;
    }
    this.getTeamDetailInfoData(toid, userId);
  },

  // 获取团详情数据
  getTeamDetailInfoData: function (toid, buyerUserID) {
    var that = this;
    wx.request({
      url: config.host + '/Team/getTeamitemData.htm',
      data: { toid: toid, buyerUserID: buyerUserID },
      header: { 'content-type': 'application/json' },
      success: function (res) {
        if (res.statusCode != 200) {
          //console.log("服务器请求异常", res);
          wx.navigateBack({
            delta: 1
          })
          return;
        }
        if (!res.data.success) {
          wx.navigateBack({
            delta: 1
          })
          return;
        }

        //全程包邮  7天退换  假一赔十
        var teamIsLottery = res.data.teamFirstObj.Team_IsLottery || 0;
        var serviceNew = command.getserviceFilterData(teamIsLottery);

        //加入团的会员
        var teamUserList = [];
        var teamUserFirst = {};
        for (var i = 0; i < res.data.teamImgList.length; i++) {
          var userJoin = res.data.teamImgList[i];
          if (userJoin.Team_First == 1) {
            teamUserFirst = userJoin;
          } else if (userJoin.Team_First == 2) {
            teamUserList.push(userJoin);
          }
        }
        if (res.data.teamFirstObj.Team_Status == 1) {
          //倒计时
          wxTimer = new timer({
            beginTime: res.data.teamFirstObj.Team_Over_TimeSpan,
            complete: function () {
              wx.redirectTo({
                url: 'group_item?toid=' + that.data.toid,
              })
            }
          });
          wxTimer.start(that);
        }

        that.setData({
          teamFirstObj: res.data.teamFirstObj,
          teamUserObj: res.data.teamUserObj,
          teamImgList: res.data.teamImgList,
          teamProYouLike: res.data.teamProYouLike,
          recordNum: res.data.recordNum,
          service: serviceNew,
          teamUserFirst: teamUserFirst,
          teamUserList: teamUserList,
          hiddenLoading: true
        });

      },
      fail: function () {
        //console.log("获得失败");
      },
    })
  },

  // 跳转至首页
  gotoIndex: function () {
    wx.switchTab({
      url: '../../index/index'
    })
  },

  // 为你推荐--跳转至拼团商品详情页
  urlGroupproitem: function (e) {
    var tpid = e.currentTarget.dataset.tpid || 0;
    wx.redirectTo({
      url: '../../product/group_proitem/group_proitem?tpid=' + tpid
    })
  },

  //**************************************************************************************** 

  // 获取商品Sku数据
  getProductInfoArrData: function (pid) {
    var that = this;
    if (that.data.loadAttr) return;
    wx.request({
      url: config.host + '/Team/getTeamProductInfoAttrData.htm',
      data: { pid: pid },
      header: { 'content-type': 'application/json' },
      success: function (res) {
        //console.log(res.data);
        if (!res.data.Success) {
          wx.showModal({
            title: '提示',
            content: '获取商品详情失败',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                that.onhome();
              }
            }
          })
          return;
        }
        that.setData({
          commodityAttr: res.data.commodityAttr,
          proArrInfo: res.data.proArrInfo,
          loadAttr: true
        })
        that.onShowAttr();
      },
      fail: function () {

        wx.showModal({
          title: '提示',
          content: '获取商品属性失败',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
              that.onhome();
            }
          }
        })

      },
    })
  },

  // 一键开团弹出层
  setModalStatus: function (e) {
    //获取产品属性
    this.getProductInfoArrData(this.data.teamFirstObj.Pid);

    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(420).step()
    this.setData({
      animationData: animation.export()
    })
    if (e.currentTarget.dataset.status == 1) {
      this.setData(
        { showModalStatus: true }
      );
    }

    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData(
          { showModalStatus: false }
        );
      }
    }.bind(this), 300);

  },

  //下一步
  submitNext: function () {
    //var value = [];
    for (var i = 0; i < this.data.attrValueList.length; i++) {
      if (!this.data.attrValueList[i].selectedValue) {
        break;
      }
      //value.push(this.data.attrValueList[i].selectedValue);
    }
    if (this.data.attrValueList.length == 0) {
      wx.showToast({
        title: '暂不支持购买',
        icon: 'loading',
        duration: 1000
      })
      return;
    }
    if (i < this.data.attrValueList.length) {
      wx.showToast({
        title: '请选择 ' + this.data.proArrInfo.saleStr,
        icon: 'loading',
        duration: 1000
      })
      return;
    }

    if (!this.data.includeGroup || this.data.includeGroup.length != 1) {
      wx.showToast({
        title: '加入异常',
        icon: 'loading',
        duration: 1000
      });
      return;
    }

    if (this.data.num <= 0) {
      wx.showToast({
        title: '购买数量必须大于等于1',
        icon: 'loading',
        duration: 1000
      });
      return;
    }

    if (this.data.teamFirstObj.Limit_Buy_One > 0 && this.data.teamFirstObj.Limit_Buy_One <= this.data.teamFirstObj.user_Buy_Count) {
      wx.showToast({
        title: '当前产品每人限购' + this.data.teamFirstObj.Limit_Buy_One + '次',
        icon: 'loading',
        duration: 1000
      });
      return;
    }

    this.AddToCart(this);
    wx.redirectTo({
      url: '../../cart/group_order/group_order'
    })
  },
  //加入购物车
  AddToCart: function (that) {
    var includeGroup = that.data.includeGroup[0];
    //console.log("当前加入购物车产品", that.data.attrValueList, includeGroup)
    var cartsValue = [];
    var cart = {
      toid: that.data.teamFirstObj.Toid,
      tpid: that.data.teamFirstObj.Tpid,
      pid: includeGroup.proId,
      Team_IsLottery: that.data.teamFirstObj.Team_IsLottery,
      Team_Num: that.data.teamFirstObj.Team_Num,
      skuid: includeGroup.skuId,
      Barcode: includeGroup.Barcode,
      img: that.data.attrPic ? that.data.attrPic : that.data.teamFirstObj.PicPath,
      h1: that.data.teamFirstObj.ProductTitle,
      h2: includeGroup.skuPropName,
      price: includeGroup.price,
      Postage_Id: includeGroup.Postage_Id,
      Item_Weight: includeGroup.Item_Weight,
      Item_Size: includeGroup.Item_Size,
      num: that.data.num,
      maxnum: includeGroup.stock,
      limit_Buy_Number: that.data.teamFirstObj.Limit_Buy_Number,
      limit_Buy_One: that.data.teamFirstObj.Limit_Buy_One,
      user_Buy_Count: that.data.teamFirstObj.user_Buy_Count,
      minbtn: that.data.num >= 1 ? 'normal' : 'disabled',
      maxbtn: that.data.num >= includeGroup.stock ? 'disabled' : 'normal',
      selected: true
    };
    cartsValue.push(cart);
    //console.log("加入购物车产品信息", cartsValue)
    wx.setStorageSync('myGroupPro', cartsValue);
  },

  // 选择颜色
  onShowAttr: function () {
    this.setData({
      includeGroup: this.data.commodityAttr
    });
    this.distachAttrValue(this.data.commodityAttr);
    // 只有一个属性组合的时候默认选中
    // console.log("默认选中的属性值",this.data.attrValueList);
    if (this.data.commodityAttr.length == 1) {
      for (var i = 0; i < this.data.commodityAttr[0].attrValueList.length; i++) {
        this.data.attrValueList[i].selectedValue = this.data.commodityAttr[0].attrValueList[i].attrValue;
        this.data.attrPic = this.data.commodityAttr[0].attrValueList[i].attrPic;
      }
      //console.log("commodityAttr", this.data.commodityAttr);
      this.setData({
        attrValueList: this.data.attrValueList,
        attrPic: this.data.attrPic
      });
    }
  },
  distachAttrValue: function (commodityAttr) {
    // 将后台返回的数据组合成类似
    var attrValueList = this.data.attrValueList;
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        var attrIndex = this.getAttrIndex(commodityAttr[i].attrValueList[j].attrKey, attrValueList);
        // console.log('属性索引', attrIndex); // 如果还没有属性索引为-1，此时新增属性并设置属性值数组的第一个值；索引大于等于0，表示已存在的属性名的位置
        if (attrIndex >= 0) {
          // 如果属性值数组中没有该值，push新值；否则不处理
          if (!this.isValueExist(commodityAttr[i].attrValueList[j].attrValue, attrValueList[attrIndex].attrValues)) {
            attrValueList[attrIndex].attrValues.push(commodityAttr[i].attrValueList[j].attrValue);
            attrValueList[attrIndex].attrPVPics.push(commodityAttr[i].attrValueList[j].attrPic);
          }
        } else {
          attrValueList.push({
            attrKey: commodityAttr[i].attrValueList[j].attrKey,
            attrValues: [commodityAttr[i].attrValueList[j].attrValue],
            attrPVPics: [commodityAttr[i].attrValueList[j].attrPic]
          });
        }
      }
    }
    //console.log('result', attrValueList)
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].attrValueStatus) {
          attrValueList[i].attrValueStatus[j] = true;
        } else {
          attrValueList[i].attrValueStatus = [];
          attrValueList[i].attrValueStatus[j] = true;
        }
      }
    }
    this.setData({
      attrValueList: attrValueList
    });
  },
  getAttrIndex: function (attrName, attrValueList) {
    // 判断数组中的的attrKey是否有该属性值
    for (var i = 0; i < attrValueList.length; i++) {
      if (attrName == attrValueList[i].attrKey) {
        break;
      }
    }
    return i < attrValueList.length ? i : -1;
  },
  isValueExist: function (value, valueArr) {
    // 判断是否已有属性值
    for (var i = 0; i < valueArr.length; i++) {
      if (valueArr[i] == value) {
        break;
      }
    }
    return i < valueArr.length;
  },
  selectAttrValue: function (e) {
    // 点选属性值，联动判断其他属性值是否可选
    var attrValueList = this.data.attrValueList;
    var index = e.currentTarget.dataset.index;//属性索引
    var key = e.currentTarget.dataset.key;
    var value = e.currentTarget.dataset.value;
    var attrPic = e.currentTarget.dataset.attrpic;
    // console.log('属性图片', attrPic);
    if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
      if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
        // 取消选中
        this.disSelectValue(attrValueList, index, key, value, attrPic);
      } else {
        // 选中
        this.selectValue(attrValueList, index, key, value, attrPic);
      }
    }
  },
  selectValue: function (attrValueList, index, key, value, attrPic, unselectStatus) {
    // console.log('firstIndex', this.data.firstIndex, index);
    // 选中
    var includeGroup = [];
    if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选
      var commodityAttr = this.data.commodityAttr;
      // 其他选中的属性值全都置空
      // console.log('其他选中的属性值全都置空', index, this.data.firstIndex, !unselectStatus);
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].selectedValue = '';
        }
      }
    } else {
      var commodityAttr = this.data.includeGroup;
    }
    // console.log('选中', commodityAttr, index, key, value);
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        if (commodityAttr[i].attrValueList[j].attrKey == key && commodityAttr[i].attrValueList[j].attrValue == value) {
          includeGroup.push(commodityAttr[i]);
        }
      }
    }
    attrValueList[index].selectedValue = value;
    // 判断属性是否可选
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = false;
      }
    }
    for (var k = 0; k < attrValueList.length; k++) {
      for (var i = 0; i < includeGroup.length; i++) {
        for (var j = 0; j < includeGroup[i].attrValueList.length; j++) {
          if (attrValueList[k].attrKey == includeGroup[i].attrValueList[j].attrKey) {
            for (var m = 0; m < attrValueList[k].attrValues.length; m++) {
              if (attrValueList[k].attrValues[m] == includeGroup[i].attrValueList[j].attrValue) {
                attrValueList[k].attrValueStatus[m] = true;
              }
            }
          }
        }
      }
    }
    //console.log('结果', attrValueList);
    //console.log('选择结果', includeGroup);
    this.setData({
      attrValueList: attrValueList,
      includeGroup: includeGroup,
      attrPic: attrPic ? attrPic : this.data.attrPic,
      num: 1
    });
    var count = 0;
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].selectedValue) {
          count++;
          break;
        }
      }
    }
    if (count < 2) {// 第一次选中，同属性的值都可选
      this.setData({
        firstIndex: index
      });
    } else {
      this.setData({
        firstIndex: -1
      });
    }
  },
  disSelectValue: function (attrValueList, index, key, value, attrPic) {
    // 取消选中
    var commodityAttr = this.data.commodityAttr;
    attrValueList[index].selectedValue = '';
    // 判断属性是否可选
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = true;
      }
    }
    this.setData({
      includeGroup: commodityAttr,
      attrValueList: attrValueList,
      attrPic: attrPic ? attrPic : this.data.attrPic
    });

    for (var i = 0; i < attrValueList.length; i++) {
      if (attrValueList[i].selectedValue) {
        this.selectValue(attrValueList, i, attrValueList[i].attrKey, attrValueList[i].selectedValue, attrPic, true);
      }
    }
  },

  // 选择商品数量减
  bindMinus: function () {
    var num = this.data.num;
    if (num > 1) {
      num--;
    }
    var minusStatus = num <= 1 ? 'disabled' : 'normal';

    this.setData({
      num: num,
      minusStatus: minusStatus,
      maxusStatus: 'normal'
    });
  },
  // 选择商品数量加
  bindPlus: function () {
    var num = this.data.num;
    num++;

    var stock = this.data.includeGroup.length == 1 ? this.data.includeGroup[0].stock : this.data.proArrInfo.surplus;
    var maxusStatus = num >= stock ? 'disabled' : 'normal';
    num = num >= stock ? stock : num;

    var limit_Buy_Number = this.data.teamFirstObj.Limit_Buy_Number;
    if (limit_Buy_Number > 0) {
      if (num >= limit_Buy_Number) {
        num = limit_Buy_Number;
        maxusStatus = 'disabled';
      }
    }

    this.setData({
      num: num,
      minusStatus: 'normal',
      maxusStatus: maxusStatus
    });
  },
  bindManual: function (e) {
    var num = e.detail.value;
    num = num.replace(/\D/g, '');
    if (num < 1) {
      num = 1
    };

    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    //库存检查
    var stock = this.data.includeGroup.length == 1 ? this.data.includeGroup[0].stock : this.data.proArrInfo.surplus;
    var maxusStatus = num >= stock ? 'disabled' : 'normal';
    num = num >= stock ? stock : num;

    //单次限量
    var limit_Buy_Number = this.data.teamFirstObj.Limit_Buy_Number;
    if (limit_Buy_Number > 0) {
      if (num >= limit_Buy_Number) {
        num = limit_Buy_Number;
        maxusStatus = 'disabled';
      }
    }

    this.setData({
      num: num,
      minusStatus: minusStatus,
      maxusStatus: maxusStatus
    });
  },

  //支付请求
  gotoPayment: function (e) {
    var that = this;
    let fromid = e.detail.formId;
    let oid = e.currentTarget.dataset.toid || 0;
    let userId = that.data.userInfo.Uid;
    let openid = that.data.userInfo.Openid;
    wx.request({
      url: config.host + '/UserTeam/PayMoneyRequest.htm',
      method: 'POST',
      data: { oid: oid, userId: userId, openid: openid, Form_Id: fromid },
      header: { 'content-type': 'application/json' },
      success: function (res) {
        if (res.statusCode != 200) {
          wx.showToast({
            title: '服务器请求异常',
            icon: 'loading',
            duration: 2000
          });
          return;
        }
        if (res.data.success) {
          that.setPayment(res.data);
        } else {
          wx.showToast({
            title: '支付请求失败，请重试',
            icon: 'loading',
            duration: 2000
          });
        }
      },
      fail: function () {
        wx.showToast({
          title: '支付请求异常，请重试',
          icon: 'loading',
          duration: 2000
        });
      }
    })

  },
  //调用支付API
  setPayment: function (result) {
    var par = result.Parameters;
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
          url: 'group_item'
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
      }
    })

  },

  //***************************************************************************************



  // 拼团--售后服务弹出层
  urlService: function (e) {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(420).step()
    this.setData({
      animationData: animation.export()
    })
    if (e.currentTarget.dataset.status == 1) {
      this.setData(
        { showurlService: true }
      );
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData(
          { showurlService: false }
        );
      }
    }.bind(this), 300)
  },

  // 拼团--拼团须知弹出层
  urlNotice: function (e) {
    var animation = wx.createAnimation({
      duration: 0,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.opacity(0).step()
    this.setData({
      animationData: animation.export()
    })
    if (e.currentTarget.dataset.status == 1) {
      this.setData(
        { showurlNotice: true }
      );
    }
    setTimeout(function () {
      animation.opacity(1).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData(
          { showurlNotice: false }
        );
      }
    }.bind(this), 0)
  },

  // 拼团--开团人数弹出层
  urlGroupnum: function (e) {
    var animation = wx.createAnimation({
      duration: 0,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.opacity(0).step()
    this.setData({
      animationData: animation.export()
    })
    if (e.currentTarget.dataset.status == 1) {
      this.setData(
        { showurlGroupnum: true }
      );
    }
    setTimeout(function () {
      animation.opacity(1).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData(
          { showurlGroupnum: false }
        );
      }
    }.bind(this), 0)
  },

  onShareAppMessage: function (res) {
    var that = this;
    if (res && res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: that.data.teamFirstObj.ProductTitle,
      path: 'pages/product/group_item/group_item?toid=' + that.data.teamFirstObj.Toid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }

})