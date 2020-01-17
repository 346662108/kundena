// pages/product/detail/index.js
var app = getApp()
var config = require('../../../config');
var R_htmlToWxml = require('../../../utils/htmlToWxml');

Page({
  data: {
    hiddenLoading: false,
    indicatorDots: false,
    autoplay: false,
    interval: false,
    duration: 500,
    proInfo: {},
    current: 0,
    actTitle: {},
    addtype: 1,
    loadAttr: false,
    firstIndex: -1,
    commodityAttr: [],
    attrValueList: [],
    // 商品选择数量
    num: 1,
    minusStatus: 'disabled',
    maxusStatus: 'normal',
    hasCarts: false,
    btuBottom: '',
    currentTab: 0,
    topScrollTop: 0,
    topFixed: false
  },
  /* 调用后台数据 */
  onLoad: function(options) {
    var pid = options.pid || 0;
    this.getProductInfoData(pid);
    this.getHasCarts();
    let isIphoneX = app.globalData.isIphoneX;
    this.setData({
      isIphoneX: isIphoneX
    })
    //app.showShare();
    this.getUserInfo();
  },

  getUserInfo: function() {
    var that = this;
    var userInfo = wx.getStorageSync('UserInfo');
    if (userInfo) {
      that.setData({
        userInfo: userInfo
      })
    }
  },
  getHasCarts: function() {
    var that = this;
    var cartsValue = wx.getStorageSync('mycartlist');
    if (cartsValue && cartsValue.length > 0) {
      that.setData({
        hasCarts: true
      })
    }
  },
  // 获取商品banner数据
  getProductInfoData: function(pid) {
    var that = this;
    wx.request({
      url: config.host + '/getProductInfoData.htm',
      data: {
        pid: pid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res.data);
        if (!res.data.Success) {
          wx.showModal({
            title: '提示',
            content: '很抱歉，您查看的商品不存在，可能已下架或者被转移。',
            showCancel: false,
            success: function(res) {
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
        var pics = [];
        for (var i = 0; i < res.data.proInfo.pics.length; i++) {
          var pic = res.data.proInfo.pics[i].picUrl;
          pics.push(pic);
        }
        //console.log("产品值", res.data.proInfo);
        that.setData({
          hiddenLoading: true,
          proInfo: res.data.proInfo,
          pictures: pics,
          commodityAttr: res.data.commodityAttr,
          actTitle: res.data.actTitle,
          PropsValue: res.data.PropsValue,
          queslist: res.data.queslist
        })
        wx.setNavigationBarTitle({
          title: that.data.proInfo.title
        })
      },
      fail: function() {
        //console.log("获得失败");
      },
      complete: function() {
        //console.log("获得结束");
      }
    })
  },

  //跳转回复列表
  btnsAllReply: function(e) {
    var qid = e.currentTarget.dataset.qid || 0;
    wx.navigateTo({
      url: '../../product/reply/index?qid=' + qid
    })
  },

  //跳转页
  onhome: function() {
    wx.switchTab({
      url: '../../index/index'
    })
  },

  //实名认证
  gotoattest: function() {
    wx.navigateTo({
      url: '../../my/attest/index'
    })
  },

  //跳转到领取优惠券
  navigateCoupon: function(e) {
    var pid = e.currentTarget.dataset.pid || 0;
    wx.navigateTo({
      url: '../../product/coupon/index?pid=' + pid
    })
  },
  //返回购物车第一步
  ongotocart: function() {
    wx.switchTab({
      url: '../../cart/cart_list/index'
    })
  },
  // 加入购物车弹出层
  setModalStatus: function(e) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(560).step()
    this.setData({
      animationData: animation.export()
    })
    if (e.currentTarget.dataset.status == 1) {
      this.setData({
        showModalStatus: true
      });
    }
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200)

    var tid = e.currentTarget.dataset.addtype || 0;
    this.setData({
      addtype: tid
    });
    if (!this.data.loadAttr) {
      this.onShowAttr();
      this.setData({
        loadAttr: true
      });
    }
  },
  // 确认
  submit: function() {
    //var value = [];
    for (var i = 0; i < this.data.attrValueList.length; i++) {
      if (!this.data.attrValueList[i].selectedValue) {
        break;
      }
      //value.push(this.data.attrValueList[i].selectedValue);
    }
    if (this.data.attrValueList.length == 0) {
      wx.showToast({
        title: '商品出错,暂不支持购买,请联系客服',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (i < this.data.attrValueList.length) {
      wx.showToast({
        title: '请选择' + this.data.proInfo.saleStr,
        icon: 'none',
        duration: 2000
      })
    } else {
      var animation = wx.createAnimation({
        duration: 300,
        timingFunction: "linear",
        delay: 0
      })
      this.animation = animation
      animation.translateY(400).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      });
      this.AddToCart(2);
      wx.showToast({
        title: '加入购物袋成功',
        icon: 'sucess',
        duration: 2000
      });
    }
  },
  //下一步
  submitNext: function() {
    //var value = [];
    for (var i = 0; i < this.data.attrValueList.length; i++) {
      if (!this.data.attrValueList[i].selectedValue) {
        break;
      }
      //value.push(this.data.attrValueList[i].selectedValue);
    }
    if (this.data.attrValueList.length == 0) {
      wx.showToast({
        title: '商品出错,暂不支持购买,请联系客服',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (i < this.data.attrValueList.length) {
      wx.showToast({
        title: '请选择' + this.data.proInfo.saleStr,
        icon: 'none',
        duration: 2000
      })
    } else {
      var minQuantity = this.data.proInfo.minQuantity;
      var num = this.data.num
      if (minQuantity > num) {
        wx.showToast({
          title: '直接购买数量不能低于起批量',
          icon: 'none',
          duration: 2000
        })
        return
      } else {
        this.AddToCart(1);
        wx.redirectTo({
          url: '../../cart/confirm_order/index'
        })
      }
    }
  },
  //加入购物车
  AddToCart: function(type) { //type=1立即购买，2加入购物车
    var that = this;
    if (that.data.includeGroup.length != 1) {
      wx.showToast({
        title: '加入异常',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    var isAdd = true;
    var includeGroup = that.data.includeGroup[0];
    //console.log("当前加入购物车产品", that.data.attrValueList, includeGroup)
    var cartsValue = wx.getStorageSync('mycartlist') || [];
    for (var i = 0; i < cartsValue.length; i++) {
      var cart = cartsValue[i];
      if (cart.skuid == includeGroup.skuId) {
        isAdd = false;
        // if ((cart.num + 1) > includeGroup.stock) break;
        // cart.num = cart.num + 1;
        if (type == 1) {
          if (that.data.num > includeGroup.stock) break;
          cart.num = that.data.num;
        } else {
          if (that.data.num + cart.num > includeGroup.stock) break;
          cart.num = that.data.num + cart.num;
        }
        cart.maxnum = includeGroup.stock;
        cart.minbtn = 'normal';
        cart.maxbtn = that.data.num >= includeGroup.stock ? 'disabled' : 'normal';
        break;
      }
    }
    if (isAdd) {
      var cart = {
        pid: includeGroup.proId,
        skuid: includeGroup.skuId,
        Barcode: includeGroup.Barcode,
        img: that.data.attrPic ? that.data.attrPic : this.data.proInfo.pic,
        h1: that.data.proInfo.title,
        h2: includeGroup.skuPropName,
        price: includeGroup.price,
        Postage_Id: includeGroup.Postage_Id,
        Item_Weight: includeGroup.Item_Weight,
        Item_Size: includeGroup.Item_Size,
        num: that.data.num,
        maxnum: includeGroup.stock,
        minbtn: 'disabled',
        maxbtn: that.data.num >= includeGroup.stock ? 'disabled' : 'normal',
        selected: true,
        minQuantity: that.data.proInfo.minQuantity //最低购买数量
      };
      cartsValue.push(cart);
    }
    if (that.data.addtype == 2) {
      for (var i = 0; i < cartsValue.length; i++) {
        var cart = cartsValue[i];
        if (cart.skuid == includeGroup.skuId) {
          cart.selected = true;
        } else {
          cart.selected = false;
        }
      }
    }
    //商品同个sku分组
    var arr = cartsValue
    var map = {},
      dest = [];
    for (var i = 0; i < arr.length; i++) {
      var ai = arr[i];
      var select = true;
      if (!map[ai.pid]) {
        dest.push({
          pid: ai.pid,
          minQuantity: ai.minQuantity || 0,
          selected: select,
          data: [ai]
        });
        map[ai.pid] = ai;
      } else {
        for (var j = 0; j < dest.length; j++) {
          var dj = dest[j];
          if (dj.pid == ai.pid) {
            if (ai.selected == false) {
              dj.selected = false;
            }
            dj.data.push(ai);
            break;
          }
        }
      }
    }
    that.setData({
      dest: dest
    })
    wx.setStorageSync('newmycartlist', dest);
    //console.log("加入购物车产品信息", cartsValue)
    wx.setStorageSync('mycartlist', cartsValue);
    that.setData({
      hasCarts: true
    })
  },

  // 选择颜色
  onShowAttr: function() {
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
  distachAttrValue: function(commodityAttr) {
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
  getAttrIndex: function(attrName, attrValueList) {
    // 判断数组中的的attrKey是否有该属性值
    for (var i = 0; i < attrValueList.length; i++) {
      if (attrName == attrValueList[i].attrKey) {
        break;
      }
    }
    return i < attrValueList.length ? i : -1;
  },
  isValueExist: function(value, valueArr) {
    // 判断是否已有属性值
    for (var i = 0; i < valueArr.length; i++) {
      if (valueArr[i] == value) {
        break;
      }
    }
    return i < valueArr.length;
  },
  selectAttrValue: function(e) {
    // 点选属性值，联动判断其他属性值是否可选
    var attrValueList = this.data.attrValueList;
    var index = e.currentTarget.dataset.index; //属性索引
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
  selectValue: function(attrValueList, index, key, value, attrPic, unselectStatus) {
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
     //console.log('选中', commodityAttr, index, key, value);
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
      attrPic: attrPic ? attrPic : this.data.proInfo.pic,
      num: 1,
      protext:value
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
    if (count < 2) { // 第一次选中，同属性的值都可选
      this.setData({
        firstIndex: index
      });
    } else {
      this.setData({
        firstIndex: -1
      });
    }
  },
  disSelectValue: function(attrValueList, index, key, value, attrPic) {
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
      attrPic: attrPic ? attrPic : this.data.proInfo.pic,
    });

    for (var i = 0; i < attrValueList.length; i++) {
      if (attrValueList[i].selectedValue) {
        this.selectValue(attrValueList, i, attrValueList[i].attrKey, attrValueList[i].selectedValue, attrPic, true);
      }
    }
  },

  // 选择商品数量
  bindMinus: function() {
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
  bindPlus: function() {
    var num = this.data.num;
    num++;

    var stock = this.data.includeGroup.length == 1 ? this.data.includeGroup[0].stock : this.data.proInfo.surplus;
    var maxusStatus = num >= stock ? 'disabled' : 'normal';
    num = num >= stock ? stock : num;

    this.setData({
      num: num,
      minusStatus: 'normal',
      maxusStatus: maxusStatus
    });
  },
  bindManual: function(e) {
    var num = e.detail.value;
    num = num.replace(/\D/g, '');
    if (num < 1) {
      num = 1
    };

    var minusStatus = num <= 1 ? 'disabled' : 'normal';

    var stock = this.data.includeGroup.length == 1 ? this.data.includeGroup[0].stock : this.data.proInfo.surplus;
    var maxusStatus = num >= stock ? 'disabled' : 'normal';
    num = num >= stock ? stock : num;

    this.setData({
      num: num,
      minusStatus: minusStatus,
      maxusStatus: maxusStatus
    });
  },

  // 商品图片放大js
  previewImage: function(e) {
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

  onShareAppMessage: function(res) {
    var that = this;
    if (res && res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: that.data.proInfo.title,
      path: 'pages/product/detail/index?pid=' + that.data.proInfo.pid,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  swiperChange: function(e) {
    var that = this;
    if (e.detail.source == 'touch') {
      that.setData({
        current: e.detail.current
      })
    }
  },
  //点击切换
  clickTab: function(e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current,
      })
    }
  },
  // 固定顶部
  onReady: function() {
    var that = this;
    var query = wx.createSelectorQuery()
    query.select('.sp_map_tab').boundingClientRect(function(res) {
      that.setData({
        topScrollTop: res.top
      })
    }).exec()
  },
  onPageScroll: function(e) { // 获取滚动条当前位置
    if (e.scrollTop > this.data.topScrollTop) {
      this.setData({
        topFixed: true
      })
    } else {
      this.setData({
        topFixed: false
      })
    }
  },


  //提交回复
  bindFormSubmit: function(e) {
    var that = this;
    var newAddr = [];

    if (!e.detail.value.textarea) {
      wx.showToast({
        title: '请填写回答内容',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if (!that.data.userInfo) {
      wx.showToast({
        title: '请登录后再回答！',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    newAddr.ProductId = that.data.proInfo.pid;
    newAddr.UserId = that.data.userInfo.Uid;
    newAddr.ParentId = e.detail.value.qid
    newAddr.Content = e.detail.value.textarea;
    newAddr.UserName = that.data.userInfo.UserNick;
    wx.request({
      url: config.host + '/EditQuest.htm',
      data: newAddr,
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode != 200) {
          return;
        }
        if (res.data.success) {
          var ques = that.data.queslist;
          for (var i = 0; i < ques.length; i++) {
            if (ques[i].qid == newAddr.ParentId) {
              ques[i].problem = newAddr.Content
            }
          }
          that.setData({
            queslist: ques
          })
          wx.showModal({
            title: '提示',
            content: '回复问题成功！',
            showCancel: true,
            success: function(res) {
              that.setData({
                showReply: false
              });
            }
          })

        } else {
          wx.showModal({
            title: '提示',
            content: '回复问题失败！',
            showCancel: true,
            success: function(res) {
              that.setData({
                showReply: false
              });
            }
          })
        }
      },
      complete: function() {
        //isSubmit = false;
      }
    })

  },
  // 回复问题弹窗
  btnsReply: function(e) {
    var name = e.currentTarget.dataset.name || '';
    var qid = e.currentTarget.dataset.qid || 0;
    var animation = wx.createAnimation({
      duration: 0,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    this.setData({
      animationData: animation.export(),
      qtext: name,
      qid: qid
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