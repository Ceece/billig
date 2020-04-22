import Vue from 'vue'
import VueRouter from 'vue-router'
import NewBill from '../views/NewBill.vue'
import About from '../views/About.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'NewBill',
    component: NewBill
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
