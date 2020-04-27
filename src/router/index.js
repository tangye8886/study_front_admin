import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import OrderManager from '@/components/OrderManager'
import RoleManager from '@/components/RoleManager'
import UserManager from '@/components/UserManager'
import VideoManager from '@/components/VideoManager'
import CourseManager from '@/components/CourseManager'
import ChapterManager from '@/components/ChapterManager'
import CommentManager from '@/components/CommentManager'
import CourseType from '@/components/CourseType'
import Login from '@/components/Login'
import Welcome from '@/components/Welcome'
import MenuManager from '@/components/MenuManager'
import ApiRecordManager from '@/components/ApiRecordManager'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', 
      redirect:'/login',
      meta: { isLogin: false } 
    },
    { path: '/login',
      component: Login,
      beforeEnter: (to, from, next) => {
        // authkey 存在 进入该路由，不存在跳转到登陆页面
          if (Boolean(sessionStorage.getItem('token'))) {
            console.log(Boolean(sessionStorage.getItem("token")))
            next({path:'/home'})
          } else {
            next()
          }
      }
    },
    { path: '/home',
      component: Home ,
      redirect:'/welcome',
       children:[  
        { path: '/welcome', component: Welcome},
        { path: '/orderManager', component: OrderManager },
        { path: '/roleManager', component: RoleManager },
        { path: '/userManager', component: UserManager},
        { path: '/videoManager', component: VideoManager},
        { path: '/courseManager', component: CourseManager},
        { path: '/chapterManager', component: ChapterManager},
        { path: '/commentManager', component: CommentManager},
        { path: '/typeManager', component: CourseType},
        { path: '/menuManager', component: MenuManager},
        { path: '/apiRecordManager', component: ApiRecordManager}
        ],
        meta: { isLogin: false } 
    }
  ]
})



export default router