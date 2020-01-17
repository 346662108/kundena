// pages/cart/address_edit/index.js
var app = getApp()
var config = require('../../../config.js');
var util = require('../../../utils/region.js');
var isSubmit = false;
var pageIndex = 2;

Page({
  //和页面进行数据绑定的变量
  data: {
    userInfo: {},
    provinceItemArray: [],
    cityItemArray: [],
    countyItemArray: [],

    provinceArray: [],
    cityArray: [],
    countyArray: [],

    provinceIndex: -1,
    cityIndex: -1,
    countyIndex: -1,

    provinceId: 0,
    cityId: 0,
    countyId: 0,
    RegionPath: '',
    hiddenLoading: true,
    saveToastHidden: true,
    IsDefault: false,
    // region: ['省份', '城市', '县区'],
  },
  onLoad: function(options) {
    var that = this;
    pageIndex = options.pageIndex || 2;
    let isIphoneX = app.globalData.isIphoneX;
    that.setData({
      isIphoneX: isIphoneX,
    })
    pageIndex = parseInt(pageIndex);
    this.getUserInfo();
    this.getAddrInfo(options.addrId);
    this.getProvinceData();
  },
  getUserInfo: function() {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo) {
      //console.log(userInfo)
      that.setData({
        userInfo: userInfo
      });
    })
  },
  getAddrInfo: function(addrId) {
    var addrList = wx.getStorageSync('myAddressList');
    if (addrId && addrList) {
      for (var i = 0; i < addrList.length; i++) {
        var item = addrList[i];
        if (item.Id == addrId) {
          this.setData({
            addr: item
          })
        }
      }
    }
  },
  //省份列表
  getProvinceData: function() {
    var that = this;
    var provinceArrayDemo = []
    var provinceIndex = -1;
    var provItems = util.GetChild(0);
    for (var i = 0; i < provItems.length; ++i) {
      var item = provItems[i];
      provinceArrayDemo.push(item.Name);
      if (that.data.addr && that.data.addr.ProvinceId == item.Id) {
        provinceIndex = i;
      }
    }
    this.setData({
      provinceItemArray: provItems,
      provinceArray: provinceArrayDemo,
    })
    if (provinceIndex > -1) {
      that.bindCityData(provinceIndex);

      that.setData({
        RegionPath: that.data.addr.RegionPath,
        provinceId: that.data.addr.ProvinceId,
        cityId: that.data.addr.CityId,
        countyId: that.data.addr.DistrictId,
        IsDefault: that.data.addr.IsDefault,
      })
    }
  },
  bindProvinceChange: function(e) {
    //选择省份，获取省份对应的城市列表
    this.bindCityData(e.detail.value);
  },
  bindCityData: function(provinceIndex) {
    var that = this;
    var itemParent = that.data.provinceItemArray[provinceIndex];
    //console.log("选择省份", itemParent);
    var cityArrayDemo = []
    var cityItems = util.GetChild(itemParent.Id);
    var cityIndex = -1;
    for (var i = 0; i < cityItems.length; ++i) {
      var item = cityItems[i];
      cityArrayDemo.push(item.Name);
      if (that.data.addr && that.data.addr.CityId == item.Id) {
        cityIndex = i;
      }
    }
    that.setData({
      cityItemArray: cityItems,
      cityArray: cityArrayDemo,

      RegionPath: itemParent.MergerName,
      provinceId: itemParent.Id,
      cityId: 0,
      countyId: 0,

      provinceIndex: provinceIndex,
      cityIndex: cityIndex,
      countyIndex: -1
    })
    if (cityIndex > -1) {
      that.bindCountyData(cityIndex);

      that.setData({
        RegionPath: that.data.addr.RegionPath,
        provinceId: that.data.addr.ProvinceId,
        cityId: that.data.addr.CityId,
        countyId: that.data.addr.DistrictId,
      })
    }
  },
  bindCityChange: function(e) {
    this.bindCountyData(e.detail.value);
  },
  bindCountyData: function(cityIndex) {
    var that = this;
    var itemParent = that.data.cityItemArray[cityIndex];
    //console.log("选择城市", itemParent);
    var countyArrayDemo = []
    var countItems = util.GetChild(itemParent.Id);
    var countyIndex = -1;
    for (var i = 0; i < countItems.length; ++i) {
      var item = countItems[i]
      countyArrayDemo.push(item.Name)
      if (that.data.addr && that.data.addr.DistrictId == item.Id) {
        countyIndex = i;
      }
    }
    that.setData({
      countyItemArray: countItems,
      countyArray: countyArrayDemo,

      RegionPath: itemParent.MergerName,
      cityId: itemParent.Id,
      countyId: 0,

      cityIndex: cityIndex,
      countyIndex: countyIndex
    })
  },
  bindMobile: function (e) {
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
  bindCountyChange: function(e) {
    var that = this;
    var itemParent = that.data.countyItemArray[e.detail.value];
    that.setData({
      RegionPath: itemParent.MergerName,
      countyId: itemParent.Id,
      countyIndex: e.detail.value
    })
  },
  submitForm: function(e) {
    var that = this;
    var newAddr = e.detail.value;
    if (!newAddr.Receiver) {
      wx.showToast({
        title: '请填写收货人',
        icon: 'loading',
        duration: 2000
      })
      return;
    }
    if (!newAddr.Tel) {
      wx.showToast({
        title: '请填写联系电话',
        icon: 'loading',
        duration: 2000
      })
      return;
    }
    if (newAddr.Tel)
    {
      var myreg = /^1\d{10}$/;
      if (!myreg.test(newAddr.Tel)) {
        wx.showToast({
          title: '手机号格式有误',
          icon: 'loading',
          duration: 1500
        })
        return;
      }
    }
    if (newAddr.ProvinceIndex < 0) {
      wx.showToast({
        title: '请选择省份',
        icon: 'loading',
        duration: 2000
      })
      return;
    }
    if (newAddr.CityIndex < 0) {
      wx.showToast({
        title: '请选择城市',
        icon: 'loading',
        duration: 2000
      })
      return;
    }
    if (!newAddr.Address) {
      wx.showToast({
        title: '请填写详细地址',
        icon: 'loading',
        duration: 2000
      })
      return;
    }

    if (isSubmit) return;
    isSubmit = true;

    that.setData({
      hiddenLoading: false
    });

    if (that.data.addr) {
      newAddr.Id = that.data.addr.Id;
    }
    newAddr.MemberID = that.data.userInfo.Uid;
    newAddr.ProvinceId = that.data.provinceId;
    newAddr.CityId = that.data.cityId;
    newAddr.DistrictId = that.data.countyId;
    newAddr.RegionPath = that.data.RegionPath
    newAddr.IsDefault = that.data.IsDefault
    //console.log("请求数据", newAddr);
    console.log(newAddr)
    wx.request({
      url: config.ucHost + '/Address/Edit.htm',
      data: newAddr,
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        that.setData({
          hiddenLoading: true
        });
        if (res.statusCode != 200) {
          //console.log("服务器请求异常", res);
          return;
        }
        if (res.data.success) {
          that.setData({
            saveToastHidden: false
          });
          wx.setStorageSync('myAddress', res.data.data);
          wx.removeStorageSync('myAddressList');

          console.log(typeof(pageIndex));
          wx.navigateBack({
            delta: pageIndex,
          });
        } else {
          wx.showModal({
            title: '提示',
            content: '地址保存失败，是否重新添加',
            showCancel: true,
            success: function(res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: 'index'
                })
              } else if (res.cancel) {
                that.onaddresslist();
              }
            }
          })
        }
      },
      complete: function() {
        isSubmit = false;
      }
    })
  },
  hideToast: function() {
    this.setData({
      saveToastHidden: true
    })
  },

  /* 取消 */
  onaddresslist: function() {
    wx.navigateBack({
      delta: 1
    })
  },
  //删除收货地址
  delAddrtap: function(e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function(sm) {
        if (sm.confirm) {
          that.setData({
            hiddenLoading: false
          });
          var addrid = e.currentTarget.dataset.addrid;
          wx.request({
            url: config.ucHost + '/Address/Del.htm',
            data: {
              userid: that.data.userInfo.Uid,
              addrid: addrid
            },
            header: {
              'content-type': 'application/json'
            },
            success: function(res) {
              if (res.statusCode != 200) {
                //console.log("服务器请求异常", res);
                return;
              }
              if (res.data.success) {
                wx.removeStorageSync('myAddressList');
                var addr = wx.getStorageSync('myAddress');
                if (addr) {
                  if (addr.Id == addrid) {
                    wx.removeStorageSync('myAddress');
                  }
                }
                that.onaddresslist();
              } else {
                wx.showToast({
                  title: '收货地址删除失败',
                  icon: 'loading',
                  duration: 2000
                })
              }
            },
            fail: function() {
              //console.log("获得失败");
            },
            complete: function() {
              //console.log("获得结束");
              that.setData({
                hiddenLoading: true
              });
            }
          })
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  // 所在地区
  // RegionChange: function(e) {
  //   this.setData({
  //     region: e.detail.value
  //   })
  // },
  // 设为默认
  SetShadow(e) {
    this.setData({
      IsDefault: e.detail.value
    })
  },
  textareaAInput(e) {
    this.setData({
      textareaAValue: e.detail.value
    })
  }
})