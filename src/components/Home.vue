<template>
  <div class="hello">
    
      <el-container>

        <!--头部内容-->
        <el-header>
             <div class="header">
                  <div class="logo">THT后台管理系统</div>
                  <div class="user-info">
                      <el-dropdown>
                          <span class="el-dropdown-link">
                              <img class="user-logo" :src="userForm.img">
                            {{currentUserNick}}
                          </span>
                          <el-dropdown-menu slot="dropdown">     
                              <el-dropdown-item @click.native="openChangePWD()">修改密码</el-dropdown-item>     
                              <el-dropdown-item @click.native="modifyUserInfoDialogVisible=true">信息修改</el-dropdown-item>
                              <el-dropdown-item @click.native="logout()">退出</el-dropdown-item>
                          </el-dropdown-menu>
                      </el-dropdown>
                    </div>
              </div>
              <!-- 修改密码弹出框-->
              <el-dialog
                title="修改密码"
                :visible.sync="centerDialogVisible"
                width="30%"
                center>
               <el-form :model="form">
                  <el-form-item label="旧密码">
                    <el-input v-model="form.oldpassword" placeholder="请输入旧密码"  type="password" @change="oldPasswordCheck()"></el-input>
                  </el-form-item>
                  <el-form-item label="新密码">
                    <el-input v-model="form.newpassword" placeholder="请输入新密码" type="password"></el-input>
                  </el-form-item>
                  <el-form-item label="确认密码">
                    <el-input v-model="form.twopassword" placeholder="确认密码" type="password"></el-input>
                 </el-form-item>
               </el-form>
                <span slot="footer" class="dialog-footer">
                  <el-button @click="centerDialogVisible = false">取 消</el-button>
                  <el-button type="primary" @click="changeSubmit()" :disabled="!canChange">修 改</el-button>
                </span>
              </el-dialog>

              <!-- 信息修改-->
              <el-dialog
                title="信息修改"
                :visible.sync="modifyUserInfoDialogVisible"
                width="30%"
                center>
               <el-form :model="userForm">

                  <el-form-item label="联系电话">
                    <el-input v-model="userForm.phone" placeholder="请输入联系电话"></el-input>
                  </el-form-item>

                  <el-form-item label="昵称">
                    <el-input v-model="userForm.nick" placeholder="请输入昵称"></el-input>
                  </el-form-item>

                  <el-form-item label="地址">
                    <el-input v-model="userForm.address" placeholder="请输入地址"></el-input>
                  </el-form-item>

                  <el-form-item label="个人描述">
                    <el-input v-model="userForm.info" placeholder="请输入个人描述"></el-input>
                  </el-form-item>


                  <el-form-item label="更换头像">
                    <input class="upload-demo" multiple type="file" ref="file" id="uploadFile" @change="fileUpload($event)"/>
                  </el-form-item>

                  <el-progress style="margin-top:5px;" :text-inside="true" :stroke-width="15" :percentage="fileUploadPercent" status="success" v-if="fileUploadPercent!==0"></el-progress>

               </el-form>
                <span slot="footer" class="dialog-footer">
                  <el-button @click="centerDialogVisible = false">取 消</el-button>
                  <el-button type="primary" @click="saveCurrentUser()">修 改</el-button>
                </span>
              </el-dialog>

        </el-header>

        <!--左侧菜单-->
        <el-container>
          <el-aside width="200px">
                    <el-menu router unique-opened
                      default-active="2"
                      class="el-menu-vertical-demo"
                      @open="handleOpen"
                      @close="handleClose">

                      <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
                        <!--一级菜单-->
                        <template slot="title">
                          <i :class="item.icon"></i>
                          <span>{{item.label}}</span>
                        </template>

                        <!--二级菜单-->
                         <el-menu-item :index="subItem.url" v-for="subItem in item.children" :key="subItem.id">
                             <template slot="title">
                                <span style="float:right">{{subItem.label}}</span>
                              </template>
                         </el-menu-item>
                      </el-submenu>

                    </el-menu>
          </el-aside>

          <!--右侧内容   动态显示中间页面的内容-->
          <el-main>
              <router-view/>
          </el-main>

        </el-container>

      </el-container>

  </div>
</template>


<script>
export default {
  data () {
    return {
      msg: '主页',
      centerDialogVisible: false,
      modifyUserInfoDialogVisible: false,
      menuList:[],
      currentUserName:sessionStorage.getItem('currentUserName'),
      currentUserNick:sessionStorage.getItem('currentUserNick'),
      currentUserNo:sessionStorage.getItem('currentUserID'),
      currentUserRole:sessionStorage.getItem('currentUserRole'),
      currentUserPhoto:sessionStorage.getItem('currentUserPhoto'),
      currentUserCall:sessionStorage.getItem('currentUserCall'),
      currentUserAddress:sessionStorage.getItem('currentUserAddress'),
      token:sessionStorage.getItem('token'),
      form:{
        username:'',
        id:'',
        oldpassword:'',
        newpassword:'',
        twopassword:''
      },
      canChange:false,
      fileUploadPercent:0,
      userForm:{
        phone:'',
        address:'',
        img:'',
        info:'',
        role:0,
        nick:''
      }
    }
  },
  created(){
      this.initCurrentUser();
      this.initMenu();//调用初始化菜单数据
  },
  methods: {
      initCurrentUser(){
        this.userForm.phone=this.currentUserCall;
        this.userForm.address=this.currentUserAddress;
        this.userForm.role=this.currentUserRole;
        this.userForm.nick=this.currentUserNick;
        this.userForm.img=this.currentUserPhoto?this.currentUserPhoto:'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
      },
      saveCurrentUser(){
        let mol_url = 'api/admin/user/modify';
        let postData = {
              "phone":this.userForm.phone,"nick":this.userForm.nick,"address":this.userForm.address,
              "info":this.userForm.info,"image":this.userForm.img,"id":this.currentUserNo};
        this.$axios.put(mol_url,postData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
            this.$message.success("修改成功");
            this.modifyUserInfoDialogVisible=false;
        })
      },
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      },
      logout()
      {
          if(confirm("确定要退出系统?"))
          {
            window.sessionStorage.clear();   //清除掉SessionStore里面的内容
            this.$router.push("/login");
          }
      },
      openChangePWD(){
          this.centerDialogVisible=true;
      },
      oldPasswordCheck(){  //检查原有密码是否正确
        let url="api/admin/user/parseOldPassword?username="+this.currentUserName+"&password="+this.form.oldpassword;
        this.$axios.get(url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
          if(response.data==false)
          {
            this.$message.error('请输入正确的旧密码');
            this.canChange=false;
          }else{
            this.canChange=true;
          }
        });
      },
      changeSubmit(){
          let that=this;
          let p1=this.form.newpassword;
          let p2=this.form.twopassword;
          let p3=this.form.oldpassword;
          if(p1===p2 && !(p1===p3))  //===全等
          {
            let putData = {"id":that.currentUserNo,"password":p2};
            that.$axios.put('api/admin/user/modify',putData,{headers:{"Authorization":"Bearer "+that.token}}).then((response)=>{
                that.$message.success("修改成功");
            });
            that.centerDialogVisible=false;
          }else if(p1===p3)
          {
            that.$message.error("新密码不能与原密码一致");
          }
          else{
            that.$message.error("密码不一致");
          }
      },
      initMenu(){
         this.$axios.get('api/admin/menu/query?roleid='+this.currentUserRole,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
             this.menuList=response.data;
         });
      }
      ,
      fileUpload(e) {
        let that=this;
        let post_url="http://127.0.0.1:8002/api/vedio/fileUpload";
            var _this = this;
            var formData = new FormData();
            formData.append("file",e.target.files[0]);
            this.$axios({
                method: "post",
                url: post_url, 
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',  // 文件上传
                    "Authorization":"Bearer "+that.token
                    // 'Content-Type': 'application/x-www-form-urlencoded',  // 表单
                    //'Content-Type': 'application/json;charset=UTF-8'  // json
                },
                onUploadProgress: progressEvent => {
                  this.fileUploadPercent=(progressEvent.loaded / progressEvent.total * 100) | 0 //调用onProgress方法来显示进度条，需要传递个对象 percent为进度值
                }
            }).then(function (response) {
                that.userForm.img=response.data;
                console.log(that.userForm.img);
            }).catch(function (reason) {
                this.$message.success("上传失败");
           })
      },

  }
}
</script>

<style scoped>
  .el-header {
    background-color: #ffffff;
    color: #333;
    text-align: center;
    line-height: 60px;
    margin:0;
    padding:0;
  }
  
  .el-aside {
    background-color: #ffffff;
    color: 3;
    text-align: center;
    line-height: 200px;
  }
  
  .el-main {
    background-color: #ffffff;
    color: #E9EEF3;
    text-align: center;
    line-height: 5px;
  }
  
  body > .el-container {
    margin-bottom: 40px;
  }
  
  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }
  
  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }


.header {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 60px;
  font-size: 22px;
  line-height: 60px;
  color: #fff;
  background-color:#242f42;
}
.logo{
    float: left;
    width:250px;
    text-align: center;
    top:10px;
}
.user-info {
    float: right;
    padding-right: 50px;
    font-size: 16px;
    color: #fff;
}
.el-dropdown-link{
                position: relative;
                display: inline-block;
                padding-left: 50px;
                color: #fff;
                cursor: pointer;
                vertical-align: middle;
 }
 .user-logo{
    position: absolute;
    left:0;
    top:10px;
    width:40px;
    height:40px;
    border-radius: 50%;
}

.hello{
  margin:0;
  padding:0;
}
</style>