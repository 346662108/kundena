// pages/product/group_proitem/group_proitem.js
var app = getApp()
var config = require('../../../config');
var command = require('../../../utils/command');
var R_htmlToWxml = require('../../../utils/htmlToWxml');
var timer = require('../../../utils/wxTimer');
var timer1, timer2, timer3, timer4, timer5

Page({
  data: {
    hiddenLoading: false,
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,

    tpid: 0,
    proInfo: {},
    actTitle: {},
    addtype: 2,
    loadAttr: false,
    firstIndex: -1,
    commodityAttr: [],
    attrValueList: [],
    // 商品选择数量
    num: 1,
    minusStatus: 'disabled',
    maxusStatus: 'normal',

    // 拼团--售后服务数据
    service: command.getserviceData(),
    userInfo: {},
    wxTimerList: {}
  },
  /* 调用后台数据 */
  onLoad: function (options) {
    var that = this;
    var tpid = options.tpid || 0;
    that.getUserInfo(tpid);
    that.setData({
      tpid: tpid
    });
  },
  onShow: function () {
    var that = this;
    if (that.data.proInfo && that.data.proInfo.teamIsLottery == 0) {
      var tpid = that.data.tpid;
      that.getTeamOrderFistCountdownData(tpid);
    }
  },
  onUnload: function () {
    var that = this;
    that.CountdownStop();
  },
  CountdownStop: function () {
    if (timer1) {
      timer1.stop();
    }
    if (timer2) {
      timer2.stop();
    }
    if (timer3) {
      timer3.stop();
    }
    if (timer4) {
      timer4.stop();
    }
    if (timer5) {
      timer5.stop();
    }
  },
  //检查登录
  getUserInfo: function (tpid) {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //console.log(userInfo)
      that.setData({
        userInfo: userInfo
      });
      //登录成功
      that.loginSuccess(tpid);
    })
  },
  //登录成功
  loginSuccess: function (tpid) {
    var that = this;
    var userId = that.data.userInfo.Uid || 0;
    if (userId <= 0) {
      wx.switchTab({
        url: '../../index/index'
      })
      return;
    }
    that.getProductInfoData(tpid, userId);
  },
  // 获取商品详情数据
  getProductInfoData: function (tpid, userId) {
    var that = this;
    wx.request({
      url: config.host + '/Team/getTeamProductInfoData.htm',
      data: { tpid: tpid, userid: userId },
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
        var desc = res.data.proInfo.desc ? res.data.proInfo.desc : '';
        res.data.proInfo.content = R_htmlToWxml.html2json(desc);
        //console.log("产品值", res.data.proInfo);
        var pics = [];
        for (var i = 0; i < res.data.proInfo.pics.length; i++) {
          var pic = res.data.proInfo.pics[i].picUrl;
          pics.push(pic);
        }
        //拼团中取前面俩个
        var teamOrderFirstTwo = [];
        if (res.data.teamOrderFirst.length > 2) {
          for (var i = 0; i < 2; i++) {
            var teamOrder = res.data.teamOrderFirst[i];
            teamOrderFirstTwo.push(teamOrder);
          }
        } else {
          teamOrderFirstTwo = res.data.teamOrderFirst;
        }

        //全程包邮  7天退换  假一赔十
        var teamIsLottery = res.data.proInfo.teamIsLottery || 0;
        var serviceNew = command.getserviceFilterData(teamIsLottery);

        that.setData({
          hiddenLoading: true,
          proInfo: res.data.proInfo,
          pictures: pics,
          //commodityAttr: res.data.commodityAttr,
          actTitle: res.data.actTitle,
          teamOrderFirst: res.data.teamOrderFirst,
          teamOrderFirstTwo: teamOrderFirstTwo,
          teamProYouLike: res.data.teamProYouLike,
          service: serviceNew,
        });
        if (that.data.proInfo.teamIsLottery == 0) {
          //倒计时
          that.Countdown();
        }
      },
      fail: function () {
        //console.log("获得失败");
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
  //从新获取倒计时时间值
  getTeamOrderFistCountdownData: function (tpid) {
    var that = this;
    wx.request({
      url: config.host + '/Team/getTeamOrderFistCountdownData.htm',
      data: { tpid: tpid },
      header: { 'content-type': 'application/json' },
      success: function (res) {
        if (!res.data.Success) {
          return;
        }
        //拼团中取前面俩个
        var teamOrderFirstTwo = [];
        if (res.data.teamOrderFirst.length > 2) {
          for (var i = 0; i < 2; i++) {
            var teamOrder = res.data.teamOrderFirst[i];
            teamOrderFirstTwo.push(teamOrder);
          }
        } else {
          teamOrderFirstTwo = res.data.teamOrderFirst;
        }
        that.setData({
          teamOrderFirstTwo: teamOrderFirstTwo,
          teamOrderFirst: res.data.teamOrderFirst,
        });
        //倒计时
        that.CountdownStop();
        that.Countdown();
      }
    })
  },
  //倒计时
  Countdown: function () {
    var that = this;
    var teamOrderFirst = that.data.teamOrderFirst;
    if (teamOrderFirst.length > 0) {
      for (var i = 0; i < teamOrderFirst.length; i++) {
        var teamOrder = teamOrderFirst[i];
        var timerObj = {
          beginTime: teamOrder.team_Over_TimeSpan,
          name: 'wxTimer' + i,
          complete: function () {
            wx.redirectTo({
              url: 'group_proitem?tpid=' + that.data.tpid,
            })
          }
        }
        //倒计时
        if (i == 0) {
          timer1 = new timer(timerObj);
          timer1.start(that);
        } else if (i == 1) {
          timer2 = new timer(timerObj);
          timer2.start(that);
        } else if (i == 2) {
          timer3 = new timer(timerObj);
          timer3.start(that);
        } else if (i == 3) {
          timer4 = new timer(timerObj);
          timer4.start(that);
        } else if (i == 4) {
          timer5 = new timer(timerObj);
          timer5.start(that);
        }

      }
    }

  },
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

  // 跳转页
  onhome: function () {
    wx.switchTab({
      url: '../../index/index'
    })
  },

  // 跳转到领取优惠券
  navigateCoupon: function () {
    var pid = this.data.proInfo.pid || 0;
    wx.navigateTo({
      url: '../../product/coupon/index?pid=' + pid
    })
  },

  // 为你推荐--跳转至拼团商品详情页
  urlGroupproitem: function (e) {
    var tpid = e.currentTarget.dataset.tpid || 0;
    wx.redirectTo({
      url: '../../product/group_proitem/group_proitem?tpid=' + tpid
    })
  },

  // 单独购买--跳转至商城详情页
  urlDetail: function () {
    var pid = this.data.proInfo.pid || 0;
    console.log(pid);
    wx.navigateTo({
      url: '../../product/detail/index?pid=' + pid
    })
  },

  // 去参团--跳转至参团详情
  urlGroupitem: function (e) {
    var toid = e.currentTarget.dataset.toid || 0;
    wx.navigateTo({
      url: '../../product/group_item/group_item?toid=' + toid
    })
  },


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
        {
          showurlService: true
        }
      );
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData(
          {
            showurlService: false
          }
        );
      }
    }.bind(this), 300)
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

  // 商品图片放大js
  previewImage: function (e) {
    var that = this,
      //获取当前图片的下表
      index = e.currentTarget.dataset.index,
      //数据源
      pictures = this.data.pictures;
    //console.log("图片放大", index, pictures);

    wx.previewImage({
      //当前显示下表
      current: pictures[index],
      //数据源
      urls: pictures
    })
  },

  // 一键开团弹出层
  setModalStatus: function (e) {
    //获取产品属性
    this.getProductInfoArrData(this.data.proInfo.pid);

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
    if (!this.data.attrValueList) return;

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

    if (this.data.proInfo.limit_Buy_One > 0 && this.data.proInfo.limit_Buy_One <= this.data.proInfo.user_Buy_Count) {
      wx.showToast({
        title: '当前产品每人限购' + this.data.proInfo.limit_Buy_One + '次',
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
      toid: 0,
      tpid: that.data.proInfo.tpid,
      pid: includeGroup.proId,
      Team_IsLottery: that.data.proInfo.teamIsLottery,
      Team_Num: that.data.proInfo.teamNum,
      skuid: includeGroup.skuId,
      Barcode: includeGroup.Barcode,
      img: that.data.attrPic ? that.data.attrPic : that.data.proInfo.pic,
      h1: that.data.proInfo.title,
      h2: includeGroup.skuPropName,
      price: includeGroup.price,
      Postage_Id: includeGroup.Postage_Id,
      Item_Weight: includeGroup.Item_Weight,
      Item_Size: includeGroup.Item_Size,
      num: that.data.num,
      maxnum: includeGroup.stock,
      limit_Buy_Number: that.data.proInfo.limit_Buy_Number,
      limit_Buy_One: that.data.proInfo.limit_Buy_One,
      user_Buy_Count: that.data.proInfo.user_Buy_Count,
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

    //单次限量
    var limit_Buy_Number = this.data.proInfo.limit_Buy_Number;
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
    var limit_Buy_Number = this.data.proInfo.limit_Buy_Number;
    if (limit_Buy_Number > 0) {
      if (num >= limit_Buy_Number) {
        num = limit_Buy_Number;
        maxusStatus = 'disabled';
      }
    }

    // //限购次数
    // var limit_Buy_One = this.data.proInfo.limit_Buy_One;
    // var user_Buy_Count = this.data.proInfo.user_Buy_Count;
    // if (limit_Buy_One > 0) {
    //   if (user_Buy_Count >= limit_Buy_One) {
    //     num = 0;
    //     maxusStatus = 'disabled';
    //   }
    // }

    this.setData({
      num: num,
      minusStatus: minusStatus,
      maxusStatus: maxusStatus
    });
  },
  onShareAppMessage: function (res) {
    var that = this;
    if (res && res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: that.data.proInfo.title,
      path: 'pages/product/group_proitem/group_proitem?tpid=' + that.data.proInfo.tpid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }

})