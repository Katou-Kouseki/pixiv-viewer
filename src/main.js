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
    Dialog.alert({
      message: '请使用 Chrome/Edge 浏览器访问本站',
      theme: 'round-button',
    })
    throw new Error('BLOCKED.')
  }
  return true
}

async function checkBrowser() {
  if (/Quark|QQBrowser|baidu|NewsArticle|UCBrowser|Huawei|HeyTap|Miui|Vivo|Oppo|360se|Sogou/i.test(navigator.userAgent)) {
    Notify({
      message: '请尽量使用最新的 Chrome/Edge 浏览器访问本站',
      color: '#fff',
      background: '#f1c25f',
      duration: 2500,
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
  // const chromeVer = parseInt(navigator.userAgent.match(/Chrome\/([\d.]+)/)?.[1])
  // if (chromeVer && chromeVer > 111) return true
  let flag = false
  const setting = LocalStorage.get('PXV_CNT_SHOW', {})
  const isOn = () => LocalStorage.get('PXV_NSFW_ON', null)
  if (isOn() == null && (setting.r18 || setting.r18g)) {
    LocalStorage.set('PXV_NSFW_ON', 1)
  }
  try {
    const resp = await fetch('/vi_test')
    if (resp.url.includes('ac3aa3b9.html')) {
      document.documentElement.innerHTML = ''
      location.replace('/ac3aa3b9.html')
    }
    if (!isOn()) return true
    document.documentElement.innerHTML = ''
    location.replace('/block.html')
    flag = true
  } catch (error) {
    return true
  }
  if (flag) throw new Error('BLOCKED.')
}
