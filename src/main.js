// import 'swiper/css/swiper.css'
import '@/assets/css/base.styl'

import '@vant/touch-emulator'
import './polyfill'
import './registerServiceWorker'

import Vue from 'vue'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import VueMasonry from 'vue-masonry-css'
import Vant, { Toast, Lazyload, ImagePreview, Dialog } from 'vant'
import { inject } from '@vercel/analytics'
import { init } from 'console-ban'

import SvgIcon from '@/icons'
import Masonry from './components/Masonry.vue'
import TopBar from '@/components/TopBar'
import App from './App.vue'
import router from './router'
import store from './store'
import { i18n } from './i18n'
import { LocalStorage } from '@/utils/storage'

init()

setupApp()

async function setupApp() {
  await checkWechat()
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

  Vue.component('WfCont', Masonry)
  Vue.component('TopBar', TopBar)

  Vue.config.productionTip = false

  new Vue({
    router,
    store,
    i18n,
    render: h => h(App),
  }).$mount('#app')

  if (process.env.NODE_ENV === 'production') {
    inject()
  }
}

async function checkWechat() {
  if (/MicroMessenger/i.test(navigator.userAgent)) {
    document.body.innerHTML = '<h1 style="margin:10px">FUCK WECHAT</h1>'
    throw new Error('BLOCKED.')
  }
  return true
}

async function checkIncognito() {
  try {
    const { quota } = await navigator.storage.estimate()
    if (quota.toString().length > 10) return true
    document.body.innerHTML = ''
    Dialog.alert({
      message: 'Please use a normal tab to continue browsing.',
      confirmButtonText: 'OK',
    })
    throw new Error('BLOCKED.')
  } catch (error) {
    return true
  }
}

async function checkSetting() {
  const setting = LocalStorage.get('PXV_CNT_SHOW', {})
  const isOn = () => document.cookie.includes('nsfw=1')
  if (!isOn() && (setting.r18 || setting.r18g)) {
    document.cookie = 'nsfw=1'
  }

  try {
    if (!isOn()) return true
    const resp = await fetch('/ip_test')
    if (!resp.url.includes('/block.html')) return true
    document.documentElement.innerHTML = ''
    location.replace('/block.html')
    throw new Error('BLOCKED.')
  } catch (error) {
    return true
  }
}
