// pages/cart/coupon/index.js
Page({
  data: {
    showModalStatus: false,
    tid: 0,
    couponprice: 0,
    isfreepost: false,
    postFee: 0,
    excludeAreaNameStr: '',
    coupons: {},
    mjss: {},
  },
  /* 调用数据 */
  onLoad: function (options) {
    if (!(options.tid == 1 || options.tid == 2)) {
      wx.navigateBack({
        delta: 1
      })
    }
    var act = wx.getStorageSync('myActivity');
    if (!(act.Coupons || act.ActivityMjss)) {
      wx.navigateBack({
        delta: 1
      })
    }
    this.setData({
      tid: options.tid,
      coupons: act.Coupons,
      mjss: act.ActivityMjss
    });
    if (options.tid == 1 && options.couponid > 0) {
      this.getActivity(options.couponid);
    }
  },
  //优惠券
  selectCoupon: function (e) {
    var isCanUser = e.currentTarget.dataset.iscanuser;
    if (!isCanUser) return;

    var couponid = e.currentTarget.dataset.couponid || 0;
    if (couponid <= 0) return;

    this.getActivity(couponid);
  },
  //优惠券
  getActivity: function (couponid) {
    var selCoupon;
    var couponprice = 0;
    var isfreepost = false;
    var postFee = 0;
    var coupons = this.data.coupons;
    if (coupons) {
      for (var i = 0; i < coupons.length; i++) {
        var item = coupons[i];
        if (item.CouponId == couponid) {
          item.IsSelect = true;
          selCoupon = item;
          couponprice = item.CouponPrice;
          isfreepost = item.IsFreePost;
          postFee = item.PostFee;
          //console.log('选中的优惠券',item);
        } else {
          item.IsSelect = false;
        }
      }
    }
    //console.log(coupons);
    this.setData({
      couponprice: couponprice.toFixed(2),
      isfreepost: isfreepost,
      postFee: postFee,
      coupons: coupons,
      selCoupon: selCoupon
    });
  },
  //满减活动
  selectMjs:function(e){
    var isCanUser = e.currentTarget.dataset.iscanuser;
    if (!isCanUser) return;

    var mjsid = e.currentTarget.dataset.mjsid || 0;
    if (mjsid <= 0) return;

    this.getActivityMjs(mjsid);
  },
  //满减活动
  getActivityMjs: function (mjsid){
    var selMjs;
    var couponprice = 0;
    var isfreepost = false;
    var postFee = 0;
    var mjss = this.data.mjss;
    if (mjss) {
      for (var i = 0; i < mjss.length; i++) {
        var item = mjss[i];
        if (item.MjsId == mjsid) {
          item.IsSelect = true;
          selMjs = item;
          couponprice = item.MjsPrice;
          isfreepost = item.IsFreePost;
          postFee = item.PostFee;
          //console.log('选中的优惠券',item);
        } else {
          item.IsSelect = false;
        }
      }
    }
    //console.log(mjss);
    this.setData({
      couponprice: couponprice.toFixed(2),
      isfreepost: isfreepost,
      postFee: postFee,
      mjss: mjss,
      selMjs: selMjs
    });
  },
  confimSelect: function () {
    var tid = this.data.tid;
    if(tid==1){
      var selCoupon = this.data.selCoupon;
      if (!selCoupon){
        wx.showToast({
          title: '请选择使用的优惠券',
          icon: 'loading',
          duration: 1000
        })
        return;
      }
    }else if(tid==2){
      var selMjs = this.data.selMjs;
      if (!selMjs) {
        wx.showToast({
          title: '请选择使用的满减活动',
          icon: 'loading',
          duration: 1000
        })
        return;
      }
    }

    var pages = getCurrentPages();
    //var currPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2];
    if (tid == 1) {
      prevPage.setData({
        tid: tid,
        selActivity: true,
        selCoupon: this.data.selCoupon,
        selMjs: {}
      });
    } else if (tid == 2) {
      prevPage.setData({
        tid: tid,
        selActivity: true,
        selCoupon: {},
        selMjs: this.data.selMjs
      });
    }
    wx.navigateBack({
      delta: 1
    });
  },
  powerDrawer: function (e) {
    var exclude = e.currentTarget.dataset.exclude;
    this.setData({
      excludeAreaNameStr: exclude
    })
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200, //动画时长 
      timingFunction: "ease", //线性 
      delay: 0 //0则不延迟 
    });

    // 第2步：这个动画实例赋给当前的动画实例 
    this.animation = animation;

    // 第3步：执行第一组动画 
    animation.opacity(0).step();

    // 第4步：导出动画对象赋给数据对象储存 
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      })

      //关闭 
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)

    // 显示 
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
  }

})