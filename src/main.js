// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import qs from 'qs'
import ElementUI from 'element-ui';
import store from './vuex/store.js'
import 'element-ui/lib/theme-chalk/index.css';
import Message from 'element-ui'


Vue.config.productionTip = false
Vue.prototype.$ajax = axios
Vue.prototype.$qs = qs
Vue.prototype.$axios = axios
axios.defaults.baseURL='http://127.0.0.1:9100/study-admin/'
Vue.prototype.$http=axios
Vue.prototype.$$message=Message

Vue.use(ElementUI);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})

// export function isvalidPhone(str) {
//   const reg = /^1[3|4|5|7|8][0-9]\d{8}$/
//   return reg.test(str)
// }


// //挂载路由导航守卫(拦截器)
// router.beforeEach((to,from,next)=>{
//   //to 将要访问的路径
//   //代表从哪里来
//   //next是一个函数，表示放行
  
//   let islogin = sessionStorage.getItem("islogin");
//   islogin = Boolean(Number(islogin));
//   //console.log(islogin);
  
// })