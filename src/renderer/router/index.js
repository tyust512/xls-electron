import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main-index',
      component: require('@/components/Index.vue').default,
    },
    {
      path: '*',
      redirect: '/',
    }
  ],
})
