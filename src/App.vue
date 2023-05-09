<template>
  <div id="app">
    <Preload />
    <router-view />
  </div>
</template>

<script>
import Preload from '@/components/Preload'
import { mapMutations } from 'vuex'
import { existsSessionId, initUser } from '@/api/user'

export default {
  components: {
    Preload,
  },
  mounted() {
    const loading = document.querySelector('#ldio-loading')
    loading && (loading.style.display = 'none')

    if (!existsSessionId()) {
      console.log('No session id found. Maybe you are not logged in?')
      this.setUser(null)
      return
    }

    initUser().then(this.setUser).catch(() => this.setUser(null))
  },
  methods: {
    ...mapMutations(['setUser']),
  },
}
</script>

<style lang="stylus">
html,body
  width 100%;
  // height 100%

#app
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  // max-width 750px
  width 100%
  // height 100%
  margin 0 auto

#nprogress
  .bar
    background-color: rgb(253, 186, 47)
  .spinner
    display none

.Home
  padding-top 1.2rem
  .com_sel_tabs
    position fixed
    z-index 1
    left 50%
    transform translateX(-50%)
    top 0.3rem
    margin-bottom 0
    padding 0

@media screen and (min-width: 1280px)
  .Home,
  .search .tags,
  .search .result-list,
  .rank,
  .users,
  #app .Spotlights,
  #app .Discovery,
  #app .HomeRecommIllust
    padding-left 5vw
    padding-right 5vw

  #app
    .nav-container
      left unset
      right 0
      bottom 60px
      width 1.2rem
      height auto
      transform: translateX(100%);
      &.showNav
        transform: translateX(0);
    .nav-bar
      flex-direction: column
      justify-content: center
      align-items: center
      border-top-left-radius: 0.21333rem;
      border-top-right-radius: 0;
      border-bottom-left-radius: 0.21333rem;
      li
        width 100%
        margin-bottom 30px
        .icon
          font-size 0.72rem
        span
          display none

</style>
