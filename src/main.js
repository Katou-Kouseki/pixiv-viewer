// import 'swiper/css/swiper.css'
import '@/assets/style/base.styl'

import '@vant/touch-emulator'
import './polyfill'
import './registerServiceWorker'

import Vue from 'vue'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import VueMasonry from 'vue-masonry-css'
import Vant, { Toast, Lazyload, ImagePreview, Dialog, Notify } from 'vant'
import { init } from 'console-ban'

import SvgIcon from '@/icons'
import ImageLayout from './components/ImageLayout.vue'
import TopBar from '@/components/TopBar'
import App from './App.vue'
import router from './router'
import store from './store'
import { i18n } from './i18n'
import { LocalStorage } from '@/utils/storage'

setupApp()

async function setupApp() {
  await checkWechat()
  await checkBrowser()
  await checkIncognito()
  await checkSetting()

  Vue.use(Toast)
  Vue.use(ImagePreview)
  Vue.use(Lazyload, {
    observer: true,
    lazyComponent: true,
    loading: require('@/icons/loading.svg'),
    adapter: {
      error(evt) {
        const src = evt.src
        if (!src?.includes('i-cf.pximg.net')) return
        if (!/\/artworks\/|\/spotlight\//i.test(location.href)) evt.el.src = ''
        evt.el.src = src.replace('i-cf.pximg.net', 'i.pixiv.re')
      },
    },
  })
  Vue.use(Vant)
  Vue.use(VueAwesomeSwiper)
  Vue.use(VueMasonry)
  Vue.use(SvgIcon)

  Vue.component('WfCont', ImageLayout)
  Vue.component('TopBar', TopBar)

  Vue.config.productionTip = false

  new Vue({
    router,
    store,
    i18n,
    render: h => h(App),
  }).$mount('#app')

  if (process.env.NODE_ENV === 'production') {
    init()
  }
}

async function checkWechat() {
  if (/MicroMessenger/i.test(navigator.userAgent)) {
    document.body.innerHTML = '<h1 style="margin:10px">FUCK WECHAT</h1>'
    throw new Error('BLOCKED.')
  }
  return true
}

async function checkBrowser() {
  Dialog.alert({
    width: '10rem',
    message: '<b style="font-size:.36rem">Pixiv 源站目前无法连接，请等待官方修复<b><br><img style="width:100%" src="https://upload-bbs.miyoushe.com/upload/2023/04/30/190122060/4b1f9f1ff58e76354f27b49f4864df93_7573079909252890752.png" alt>',
    confirmButtonText: '我知道了',
  })
  if (/UCBrowser|Huawei|HeyTap|Miui|Vivo|Oppo|360se|Sogou/i.test(navigator.userAgent)) {
    Notify({
      message: '请尽量使用最新的 Chrome/Edge 浏览器访问本站',
      color: '#fff',
      background: '#f1c25f',
      duration: 2500,
    })
  }
  if (/Quark|QQBrowser|baidu|NewsArticle/i.test(navigator.userAgent)) {
    Dialog.alert({
      message: '请<b>尽量</b>使用最新的 Chrome/Edge 浏览器访问本站',
      confirmButtonText: '我知道了',
    })
  }
  return true
}

async function checkIncognito() {
  let flag = false
  try {
    const { quota } = await navigator.storage.estimate()
    if (quota.toString().length > 10) return true
    document.body.innerHTML = ''
    Dialog.alert({
      message: 'Please use a normal tab to continue browsing.',
      confirmButtonText: 'OK',
    })
    flag = true
  } catch (error) {
    return true
  }
  if (flag) throw new Error('BLOCKED.')
}

async function checkSetting() {
  const chromeVer = parseInt(navigator.userAgent.match(/Chrome\/([\d.]+)/)?.[1])
  if (chromeVer && chromeVer > 111) return true
  let flag = false
  const setting = LocalStorage.get('PXV_CNT_SHOW', {})
  const isOn = () => LocalStorage.get('PXV_NSFW_ON', null)
  if (isOn() == null && (setting.r18 || setting.r18g)) {
    LocalStorage.set('PXV_NSFW_ON', 1)
  }
  try {
    if (!isOn()) return true
    // const resp = await fetch('/ip_test')
    // if (!resp.url.includes('/block.html')) return true
    document.documentElement.innerHTML = ''
    location.replace('/block.html')
    flag = true
  } catch (error) {
    return true
  }
  if (flag) throw new Error('BLOCKED.')
}
