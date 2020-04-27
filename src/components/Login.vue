<template>
 <div class="homepage-hero-module">
    <div class="video-container">
    <div :style="fixStyle" class="filter">
          <el-form :model="loginForm" ref="loginForm"  :rules="loginRules" label-width="80px" class="login-box">
            <h3 class="login-title" style="color:white;font-size:25px;margin-left:30px">欢迎登录</h3>
              <el-form-item label="账号" prop="username">
                <el-input v-model="loginForm.username" placeholder="请输入账号"></el-input>
              </el-form-item>
              <el-form-item label="密码" prop="password" style="color:white">
                <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submit()" style="width:100%">登录</el-button>
              </el-form-item>
          </el-form>
    </div>
    <video :style="fixStyle" autoplay loop muted class="fillWidth" v-on:canplay="canplay">
    <source src="http://192.168.196.148:80/group1/M00/00/02/wKjElF6m1aqAciKRBwTR-RC0hYU567.mp4" type="video/mp4"/>
    浏览器不支持 video 标签，建议升级浏览器。
    <source src="http://192.168.196.148:80/group1/M00/00/02/wKjElF6m0taAfihMAVDVaKb0alY33.webm" type="video/webm"/>
    浏览器不支持 video 标签，建议升级浏览器。
    </video>
    <div class="poster hidden" v-if="!vedioCanPlay">
    <img :style="fixStyle" src="" alt="">
    </div>
    </div>
 </div>
</template>

<script>
import { async } from 'q';

export default {
  name: 'login',
 data() {
  return {
    vedioCanPlay: false,
    fixStyle: '',
    loginForm:{
      username:'',
      password:'',
      role:''
    },
    loginRules:{
      username:[{ required: true, message: '请输入用户名', trigger: 'blur' },
                { min: 5, max: 20, message: '长度在 3 到 16 个字符', trigger: 'blur' }],
      password:[{ required: true, message: '请输入密码', trigger: 'blur' },
                { min: 5, max: 20, message: '长度在 3 到 16个字符', trigger: 'blur' }]
    }
  }
 },
 methods: {
  canplay() {
  this.vedioCanPlay = true
  },
  submit() {
    let that=this;
    this.$refs['loginForm'].validate((valid) => {
          if (valid) {
             var params = new URLSearchParams();
              params.append('username',that.loginForm.username);       //你要传给后台的参数值 key/value
              params.append('password',that.loginForm.password);
              that.$axios({
                  method: "POST",
                  url: 'login', 
                  data:params
              }).then(function (response) {
                  if(response.data.code==200) //认证成功
                  {
                      let result=response.data.data;
                      if(result.userInfo.role===1 || result.userInfo.role===2)
                      {
                          that.$message.success("认证成功");
                          sessionStorage.setItem("token",result.token);
                          sessionStorage.setItem('currentUserNick',result.userInfo.nick);
                          sessionStorage.setItem('currentUserName',result.userInfo.username);
                          sessionStorage.setItem('currentUserPhoto',result.userInfo.image);
                          sessionStorage.setItem('currentUserAddress',result.userInfo.address);
                          sessionStorage.setItem('currentUserCall',result.userInfo.phone);
                          sessionStorage.setItem('currentUserID',result.userInfo.id);
                          sessionStorage.setItem('currentUserRole',result.userInfo.role);
                          that.$router.push("/home")
                      }else that.$message.error("暂无访问权限！！");
                  }else{
                     that.$message.error("账号/密码错误");
                  }
              });
         }
    });
  }

 },
 mounted: function() { //屏幕自适应
  window.onresize = () => {
  const windowWidth = document.body.clientWidth
  const windowHeight = document.body.clientHeight
  const windowAspectRatio = windowHeight / windowWidth
  let videoWidth
  let videoHeight
  if (windowAspectRatio < 0.5625) {
   videoWidth = windowWidth
   videoHeight = videoWidth * 0.5625
   this.fixStyle = {
   height: windowWidth * 0.5625 + 'px',
   width: windowWidth + 'px',
   'margin-bottom': (windowHeight - videoHeight) / 2 + 'px',
   'margin-left': 'initial'
   }
  } else {
   videoHeight = windowHeight
   videoWidth = videoHeight / 0.5625
   this.fixStyle = {
   height: windowHeight + 'px',
   width: windowHeight / 0.5625 + 'px',
   'margin-left': (windowWidth - videoWidth) / 2 + 'px',
   'margin-bottom': 'initial'
   }
  }
  }
  window.onresize()
 }
 
}
</script scoped>

<style scoped>
.homepage-hero-module,
 .video-container {
 position: relative;
 height: 100vh;
 overflow: hidden;
 }
  
 .video-container .poster img{
 z-index: 0;
 position: absolute;
 }
  
 .video-container .filter {
 z-index: 1;
 position: absolute;
 background: rgba(0, 0, 0, 0.4);
 width: 100%;
 }
  
 .fillWidth {
 width: 100%;
 }

 .login-box {
    border: 1px solid #DCDFE6;
    width: 350px;
    margin: 180px auto;
    padding: 10px 65px 20px 35px;
    border-radius: 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    box-shadow: 0 0 25px #909399;
  }

</style>
