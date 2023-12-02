//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    imageUrl:"",
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,
    currentIndex: 0,
    swiper_images: [],
    allCategoryMessage: [],
    weatherData: null,
    floorstatus: "none",
    category_first: [],
    category_second: [],
    notice: [],
    lost_new: {},
    takeout: [],
    indicatorDots: true, // 是否显示指示点
    autoplay: true, // 是否自动切换
    interval: 3000, // 自动切换时间间隔，单位：ms
    duration: 500, // 滑动动画时长，单位：ms
    imageUrls: [
      '/images/other/1.png', // 替换为你的图片链接
      '/images/other/2.png',
      '/images/other/3.png',
    ],
    user_message: [],
    activeIndex: 1,
    isLastPage: false, //是否最后一页
    isUpdate: -1,
    isLoading: false //页面是否渲染完毕
  },
  onReady() {
    let that = this
    setTimeout(function() {
      that.setData({
        isLoading: true
      })
    }, 1000)

  },
  //查看最新的失物招领
  new_lost_look(e) {
    wx.navigateTo({
      url: "/pages/message_detail/message_detail?messageId=" + e.currentTarget.id
    })
  },
  //点击查看图片
  look_image(e) {
    wx.previewImage({
      urls: [e.target.id],
    });
  },
  goTop: function(e) { // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  //跳转到搜索页
  search: function() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  //跳转到详情页
  to_message_detail: function(e) {
    wx.navigateTo({
      url: '/pages/message_detail/message_detail?messageId=' + e.currentTarget.id,
    })
  },
  onLoad: function(options) {

    let that = this
    /**
     * 分类信息
     */
    this.setData({
      allCategoryMessage: getApp().globalData.categoryMessage
    })
    var get_first = getApp().globalData.categoryMessage.slice(0, 10);
    var tem = [{}, {}, {}, {}, {}]
    var get_second = getApp().globalData.categoryMessage.slice(10, 13).concat(tem)
    this.setData({
      category_first: get_first,
      category_second: get_second,
      category_second: get_second
    })
    /**
     * 公告信息
     */
    this.setData({
      notice: getApp().globalData.noticeMessage
    })
    /**
     *第一页最新信息
     */
    this.setData({
      user_message: getApp().globalData.messageDetail
    })
    /**
     * 获取最新失物招领
     */
    this.setData({
      lost_new: getApp().globalData.lost_new
    })

  },
  handleImgChange: function(e) {
    this.setData({
      currentIndex: e.detail.current
    })
  },


  /**
   * 下拉
   */
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    // 最后一页了，取消下拉功能
    if (this.data.isLastPage) {
      return
    }
    this.loadMessage(++this.data.activeIndex)
  },

  loadMessage(index) {
    wx.showLoading({
      title: '加载中~',
    })
    var that = this;
    var app = getApp()
    wx.request({
      url: getApp().globalData.url + '/getMessage/getAllMessageDetail/' + index,
      method: "POST",
      success: (res) => {
        if (res.data == 200) {
          that.setData({
            isLastPage: true
          })
          return;
        }
        that.setData({
          user_message: that.data.user_message.concat(res.data)
        })


      },
      complete: function(res) {
        wx.hideLoading();
      },
    })

  },
  onShow() {
    let that = this
    wx.request({
      url: getApp().globalData.url + '/getMessage/getLastNewMessage/' + getApp().globalData.userId,
      method: 'post',
      complete: function(e) {

        if (e.statusCode != 200) {
          return
        }

        wx.getStorage({
          key: 'lastNewMessage',
          success: function(res) {
            if (res.data != e.data.newMessageId) {
              wx.showModal({
                title: '新消息',
                content: '内容：' + e.data.newMessageDetail,
                confirmText: "去查看",
                cancelText: "稍后去看",
                success: function(e) {
                  if (e.confirm) {
                    wx.navigateTo({
                      url: '/pages/me_xiaoxi/me_xiaoxi',
                    })
                  }
                }
              })
            }
          },
        })

        wx.setStorage({
          key: 'lastNewMessage',
          data: e.data.newMessageId,
        })
      }

    })
    /**
     * 判断是否更新
     */
    if (getApp().globalData.isUpdate == 1) {
      this.onLoad(),
        this.setData({
          activeIndex: 1,
          isLastPage: false, //是否最后一页
        })
      getApp().globalData.isUpdate = -1
    }

  }

})