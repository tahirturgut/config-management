import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../main'

import HomeView from '../views/HomeView.vue'
import SignInView from '../views/SignInView.vue'
import SignUpView from '../views/SignUpView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import ConfigEditView from '../views/ConfigEditView.vue'

const requireAuth = async (to, from, next) => {
  const currentUser = auth.currentUser
  
  if (!currentUser) {
    const userPromise = new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe()
        resolve(user)
      })
    })
    
    const user = await userPromise
    
    if (!user) {
      next({ 
        path: '/signin', 
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: requireAuth
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignInView
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView
    },
    {
      path: '/config/:name',
      name: 'config-edit',
      component: ConfigEditView,
      props: true,
      beforeEnter: requireAuth
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView
    }
  ]
})

export default router 