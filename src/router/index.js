import Vue from 'vue'
import VueRouter from 'vue-router'
import Billing from '../views/Billing.vue'
import About from '../views/About.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Billing',
    component: Billing
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = new VueRouter({
  routes
})

export default router
