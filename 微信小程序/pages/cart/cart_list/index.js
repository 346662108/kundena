// pages/cart/cart_list/index.js
var app = getApp()
var config = require('../../../config');

Page({
  data: {
    hiddenLoading: false,
    hasList: false, // 列表是否有数据
    total: '￥0',
    carts: [],
    //向左滑动效果
    startX: 0, //开始坐标
    startY: 0,
    dest: [],
    selectedAllStatus: true,
    data: []
  },
  onLoad: function() {
    for (var i = 0; i < 10; i++) {
      this.data.carts.push({
        content: i + "向左滑删除",
        isTouchMove: false //默认全隐藏删除
      })
    }
    this.setData({
      carts: this.data.carts
    })
  },
  onShow: function() {
    this.getUserInfo();

  },
  //检查登录
  getUserInfo: function() {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo) {
      that.setData({
        userInfo: userInfo
      });
      that.getcartsData();
    })
  },
  // 获取购物袋列表数据
  getcartsData: function() {
    var that = this;
    try {
      var cartsValue = wx.getStorageSync('mycartlist');
      if (cartsValue && cartsValue.length > 0) {
        var selectedAllStatus = true;
        for (var i = 0; i < cartsValue.length; i++) {
          if (!cartsValue[i].selected) {
            selectedAllStatus = false;
            break;
          }
        }
        that.setData({
          hasList: true,
          carts: cartsValue,
          selectedAllStatus: selectedAllStatus,
          hiddenLoading: true
        })
        this.getData();
        this.sum();
      } else {
        that.setData({
          hasList: false,
          hiddenLoading: true
        })
      }
    } catch (e) {
      // Do something when catch error
      wx.removeStorageSync('mycartlist');
      wx.showModal({
        title: '提示',
        content: '数据读取异常，请返回重试！',
        success: function(res) {
          if (res.confirm) {
            wx.reLaunch({
              url: '../../index/index'
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  //商品同个sku分组
  getData: function() {
    var that = this;
    var arr = that.data.carts;
    var map = {},
      selectedAllStatus = true,
      dest = [];
    for (var i = 0; i < arr.length; i++) {
      var ai = arr[i];
      var select = true;
      if (!map[ai.pid]) {
        if (!ai.selected) {
          select = false;
        }
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
              selectedAllStatus = false;
            }
            dj.data.push(ai);
            break;
          }
        }
      }
    }
    that.setData({
      dest: dest,
      selectedAllStatus: selectedAllStatus
    })
  },

  //修改购物车信息保存至缓存
  saveChangeCart: function() {
    wx.setStorageSync('mycartlist', this.data.carts);
    wx.setStorageSync('newmycartlist', this.data.dest);
  },

  /* 选择数量减号 */
  bindMinus: function(e) {
    var pid = e.currentTarget.dataset.pid;
    var skuid = e.currentTarget.dataset.skuid;
    var dest = this.data.dest;
    for (var j = 0; j < dest.length; j++) {
      if (dest[j].pid == pid) {
        var data = dest[j].data;
        for (var i = 0; i < data.length; i++) {
          if (data[i].skuid == skuid) {
            var num1 = data[i].num;
            if (num1 > 1) {
              num1--;
            }

            var minusStatus = num1 <= 1 ? 'disabled' : 'normal';
            // 购物车数据

            data[i].num = num1;
            // 按钮可用状态
            data[i].minbtn = minusStatus;
            data[i].maxbtn = 'normal';
            break;
          }
        }
      }
    }
    var carts = this.data.carts;
    carts.forEach(function(v, i) {
      if (v.skuid == skuid) {
        var num1 = v.num;
        if (num1 > 1) {
          num1;
        }
        var minusStatus = num1 <= 1 ? 'disabled' : 'normal';
        // 购物车数据
        v.num = num1;
        // 按钮可用状态
        v.minbtn = minusStatus;
        v.maxbtn = 'normal';
      }
    })

    // 将数值与状态写回
    this.setData({
      carts: carts,
      dest: dest
    });
    this.sum();
    this.saveChangeCart();
  },

  /* 选择数量加号 */
  bindPlus: function(e) {
    var pid = e.currentTarget.dataset.pid;
    var skuid = e.currentTarget.dataset.skuid;
    var dest = this.data.dest;
    for (var j = 0; j < dest.length; j++) {
      if (dest[j].pid == pid) {
        var data = dest[j].data;
        for (var i = 0; i < data.length; i++) {
          if (data[i].skuid == skuid) {
            var num1 = data[i].num;
            // 自增
            num1++;
            //最大值
            var maxnum1 = data[i].maxnum;
            if (num1 >= maxnum1) {
              num1 = maxnum1;
              data[i].maxbtn = 'disabled';
            }
            // 按钮可用状态
            data[i].minbtn = 'normal';
            // 购物车数据
            data[i].num = num1;
            break;
          }
        }
      }
    }

    var carts = this.data.carts;
    carts.forEach(function(v, i) {
      if (v.skuid == skuid) {
        v.num
          var maxnum1 = v.maxnum;
        if (v.num >= maxnum1) {
          v.num = maxnum1;
          v.maxbtn = 'disabled';
        }
        v.minbtn = 'normal';
      }
    })

    // 将数值与状态写回
    this.setData({
      carts: carts,
      dest: dest
    });

    this.sum();
    this.saveChangeCart();
  },

  /* 选择数量直接输入 */
  bindManual: function(e) {

    //新方法
    var pid = e.currentTarget.dataset.pid;
    var skuid = e.currentTarget.dataset.skuid;
    var dest = this.data.dest;
    for (var j = 0; j < dest.length; j++) {
      if (dest[j].pid == pid) {
        var data = dest[j].data;
        for (var i = 0; i < data.length; i++) {
          if (data[i].skuid == skuid) {
            var num1 = parseInt(e.detail.value);

            //最大值
            var maxnum1 = data[i].maxnum;
            if (num1 >= maxnum1) {
              wx.showModal({
                title: '提示',
                content: '当前规格库存为:' + maxnum1 + '，购买数量不能大于库存',
              })
              num1 = maxnum1;
              data[i].maxbtn = 'disabled';
              // 按钮可用状态
              data[i].minbtn = 'normal';
            }
            if (num1 < 1) {
              wx.showModal({
                title: '提示',
                content: '最低购买数量不能小于1:'
              })
              num1 = 1;
              data[i].maxbtn = 'normal';
              // 按钮可用状态
              data[i].minbtn = 'disabled';
            }
            // 购物车数据
            data[i].num = num1;
            break;
          }
        }
      }
    }
    var carts = this.data.carts;
    carts.forEach(function(v, i) {
      if (v.skuid == skuid) {
        var num1 = parseInt(e.detail.value)
        //最大值
        var maxnum1 = v.maxnum;
        if (num1 >= maxnum1) {
          num1 = maxnum1;
          v.maxbtn = 'disabled';
          // 按钮可用状态
          v.minbtn = 'normal';
        }
        if (num1 < 1) {
          num1 = 1;
          v.maxbtn = 'normal';
          // 按钮可用状态
          v.minbtn = 'disabled';
        }
        // 购物车数据
        v.num = num1;
      }
    })
    // 将数值与状态写回
    this.setData({
      carts: carts,
      dest: dest
    });
    this.sum();
    this.saveChangeCart();
  },

  /* 复选框 */
  bindCheckbox: function(e) {
    //绑定点击事件，将checkbox样式改变为选中与非选中
    //拿到下标值，以在carts作遍历指示用
    var index = parseInt(e.currentTarget.dataset.index);
    //原始的icon状态
    var selected = this.data.carts[index].selected;
    var carts = this.data.carts;
    // 对勾选状态取反
    carts[index].selected = !selected;

    var selectedAllStatus = true;
    for (var i = 0; i < carts.length; i++) {
      if (!carts[i].selected) {
        selectedAllStatus = false;
        break;
      }
    }
    // 写回经点击修改后的数组
    this.setData({
      carts: carts,
      selectedAllStatus: selectedAllStatus
    });
    this.sum();
    this.saveChangeCart();
  },

  /* 全选 */
  bindSelectAll: function() {
    var selectedAllStatus = this.data.selectedAllStatus;
    selectedAllStatus = !selectedAllStatus;
    var carts = this.data.carts;
    for (var i = 0; i < carts.length; i++) {
      carts[i].selected = selectedAllStatus;
    }
    this.setData({
      selectedAllStatus: selectedAllStatus,
      carts: carts
    });
    this.sum();
    this.saveChangeCart();
  },
  //勾选sku
  checkproductsku: function(e) {
    var chek = e.detail.value;
    var skuid = e.currentTarget.dataset.skuid; //当前skuid
    var that = this;
    var dest = that.data.dest;
    var carts = that.data.carts;
    dest.forEach(function(v, i) {
      var select = true;
      v.data.forEach(function(value, item) {
        if (value.skuid == skuid) {
          if (chek.length == 0) {
            value.selected = false;
          } else {
            value.selected = true;
          }
        }
        if (!value.selected) {
          select = false;
        }
      });
      v.selected = select;
    })
    carts.forEach(function(v, i) {
      if (v.skuid == skuid) {
        if (chek.length == 0) {
          v.selected = false;
        } else {
          v.selected = true;
        }
      }
    })
    that.setData({
      carts: carts,
      dest: dest
    });
    that.sum();
    that.saveChangeCart();
  },
  //勾选商品
  checkproduct: function(e) {
    var chek = e.detail.value;
    var pid = e.currentTarget.dataset.pid; //当前pid
    var that = this;
    var dest = that.data.dest;
    var carts = that.data.carts;

    dest.forEach(function(v, i) {
      if (pid == v.pid) {
        if (chek.length == 0) {
          v.selected = false;
        } else {
          v.selected = true;
        }
        v.data.forEach(function(value, item) {
          value.selected = v.selected
        });
      }

    })
    carts.forEach(function(v, i) {
      if (v.pid == pid) {
        if (chek.length == 0) {
          v.selected = false;
        } else {
          v.selected = true;
        }
      }
    })
    that.setData({
      carts: carts,
      dest: dest
    });
    that.sum();
    that.saveChangeCart();
  },

  //全选
  checkproductall: function(e) {
    var chek = e.detail.value;
    var that = this;
    var dest = that.data.dest;
    var carts = that.data.carts;
    dest.forEach(function(v, i) {
      if (chek.length == 0) {
        v.selected = false;
      } else {
        v.selected = true;
      }
      v.data.forEach(function(value, item) {
        value.selected = v.selected
      });
    })
    carts.forEach(function(v, i) {
      if (chek.length == 0) {
        v.selected = false;
      } else {
        v.selected = true;
      }
    })
    that.setData({
      carts: carts,
      dest: dest
    });
    that.sum();
    that.saveChangeCart();
  },

  /* 计算总金额 */ //计算是否全选和结算数量
  sum: function() {
    var carts = this.data.carts;
    var total = 0;
    var sumcout = 0;
    var selectedAllStatus = true;
    for (var i = 0; i < carts.length; i++) {
      if (carts[i].selected) {
        total += carts[i].num * carts[i].price;
        if (!carts[i].num)
        {
          carts[i].num = 0;
        }
        sumcout = sumcout + parseInt(carts[i].num);
      } else {
        selectedAllStatus = false;
      }
    }
    // 写回经点击修改后的数组
    this.setData({
      carts: carts,
      total: total.toFixed(2),
      sumcout: sumcout,
      selectedAllStatus: selectedAllStatus
    });
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function(e) {
    //开始触摸时 重置所有删除
    this.data.carts.forEach(function(v, i) {
      if (v.isTouchMove) //只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      carts: this.data.carts
    })
  },
  //滑动事件处理
  touchmove: function(e) {
    var that = this,
      index = e.currentTarget.dataset.index, //当前索引
      skuid = e.currentTarget.dataset.skuid, //当前skuid
      startX = that.data.startX, //开始X坐标
      startY = that.data.startY, //开始Y坐标
      touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标
      //获取滑动角度
      angle = that.angle({
        X: startX,
        Y: startY
      }, {
        X: touchMoveX,
        Y: touchMoveY
      });
    var dest = that.data.dest;
    var carts = that.data.carts;
    dest.forEach(function(v, i) {
      v.data.forEach(function(value, item) {
        value.isTouchMove = false
        if (Math.abs(angle) > 30) return;
        if (value.skuid == skuid) {
          if (touchMoveX > startX) //右滑
            value.isTouchMove = false
          else //左滑
            value.isTouchMove = true
        }
      });
    })
    that.data.carts.forEach(function(v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (v.skuid == skuid) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })

    //更新数据
    that.setData({
      carts: that.data.carts,
      dest: dest
    })
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function(start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },

  //删除多个
  delsku: function(e) {
    var that = this;
    var carts = this.data.carts;
    var selLength = 0
    for (var i = 0; i < carts.length; i++) {
      if (carts[i].selected) {
        selLength = 1;
        break;
      }
    }
    if (selLength == 0) {
      wx.showModal({
        title: '提示',
        content: '请至少选择一款产品',
        showCancel: false
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '确定要删除吗？',
        success: function(sm) {
          if (sm.confirm) {
            var dest = that.data.dest;
            var carts = that.data.carts
            for (var i = 0; i < dest.length; i++) {
              for (var j = 0; j < dest[i].data.length; j++) {
                if (dest[i].data[j].selected) {
                  dest[i].data.splice(j, 1);
                  j--;
                }
              }
              if (dest[i].data.length == 0) {
                dest.splice(i, 1);
                i--
              }
            }
            for (var i = 0; i < carts.length; i++) {
              if (carts[i].selected) {
                that.data.carts.splice(i, 1);
                i--
              }
            }
            var hasList = false;
            if (that.data.carts.length > 0) {
              hasList = true;
            }
            that.setData({
              hasList: hasList,
              carts: carts,
              dest: dest
            });

            that.sum();
            that.saveChangeCart();
            wx.showToast({
              title: '成功删除',
              icon: 'success',
              duration: 1000
            });
          } else if (sm.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },

  //删除事件
  del: function(e) {
    var that = this;
    var dest = that.data.dest;
    var carts = that.data.carts;
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function(sm) {
        if (sm.confirm) {
          var skuid = parseInt(e.currentTarget.dataset.skuid); //当前skuid
          var index = e.currentTarget.dataset.index;
          for (var i = 0; i < dest.length; i++) {
            for (var j = 0; j < dest[i].data.length; j++) {
              if (skuid == parseInt(dest[i].data[j].skuid)) {
                dest[i].data.splice(j, 1);
                j--;
              }
            }
            if (dest[i].data.length == 0) {
              dest.splice(i, 1);
              i--
            }
          }
          for (var i = 0; i < carts.length; i++) {
            if (skuid == parseInt(carts[i].skuid)) {
              carts.splice(i, 1);
              i--
            }
          }
          var hasList = false;
          if (that.data.carts.length > 0) {
            hasList = true;
          }

          that.setData({
            hasList: hasList,
            carts: that.data.carts,
            dest: dest
          });

          that.sum();
          that.saveChangeCart();

          wx.showToast({
            title: '成功删除',
            icon: 'success',
            duration: 1000
          });
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  //提交订单
  gotoConfirm: function() {
    var that = this;
    var carts = this.data.carts;
    var selLength = 0
    for (var i = 0; i < carts.length; i++) {
      if (carts[i].selected) {
        selLength = 1;
        break;
      }
    }
    if (selLength == 0) {
      wx.showModal({
        title: '提示',
        content: '请至少选择一款产品',
        showCancel: false
      })
    } else {
      var dest = this.data.dest;
      var buymin = 0;
      //var data = {};
      dest.forEach(function(v, i) {
        var min = 0
        var select = false;
        v.data.forEach(function(dv, di) {
          if (dv.selected) {
            min = min + parseInt(dv.num)
            select = true;
          }
        })
        if (select) {
          if (min < v.minQuantity) {
            buymin = 1;
          }
        }
      })
      if (buymin == 1) {
        wx.showModal({
          title: '提示',
          content: '购买选中的商品数量不能低于对应的起批量',
          showCancel: false
        })
        // that.setData({
        //   data: []
        // })
      } else {
        wx.navigateTo({
          url: '../confirm_order/index'
        })
        // that.setData({
        //   data: []
        // })
      }



    }
  },

  // 跳转至首页
  gotoIndex: function() {
    wx.switchTab({
      url: '../../index/index'
    })
  },

  // 跳转至详情页
  navigateDetail: function(e) {
    wx.navigateTo({
      url: '../../product/detail/index?pid=' + e.currentTarget.dataset.pid
    })
  },
  onPullDownRefresh: function() {
    var that = this;
    wx.stopPullDownRefresh()
    var userId = that.data.userInfo.Uid || 0;
    if (userId > 0) {
      that.onShow();
    }
  }
})