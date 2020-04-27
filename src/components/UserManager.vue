<template>
  <div class="hello">
    
      <el-breadcrumb separator="/" style="margin-bottom:10px">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a>用户管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row style="float:left;margin-left:10px;margin-bottom:10px;">
         <!-- 删除按钮-->
          <el-button type="danger" :disabled="false"
          @click="delUser()"  icon="el-icon-delete" circle></el-button>
         <!-- 新增按钮-->
          <el-button type="success" :disabled="false"
                 @click="addUser()"  icon="el-icon-plus" circle></el-button>
          <!-- 还原密码-->
          <el-button type="warning"
                 @click="resetPwd()"  icon="el-icon-key" circle></el-button>
      </el-row>
       
        <div> 
            <span style='color:black'>用户名: </span><el-input v-model="userNameQuery" autocomplete="off" style="width:100px"></el-input>
            <el-select v-model="roleQuery" placeholder="请选择角色">
                    <el-option v-for="item in roleList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id">
                    </el-option>
            </el-select>
            <el-select v-model="statusQuery" placeholder="请选择状态">
                  <el-option v-for="item in statusList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
             </el-select>
            <el-button slot="append" icon="el-icon-search" @click="initUser()"></el-button>
            <el-button slot="append" icon="el-icon-refresh" @click="clearQueryCondition()"></el-button>

            <a href="http://127.0.0.1:8002/api/user/ExcelUserInfo" style="color:black;font-size:13px;margin-left:30px;">导出数据</a>
        </div>
      
      <el-divider><i class="el-icon-caret-bottom"></i></el-divider>
      <!--表单-->
      <template>
          <el-table
            :data="tableData"
            style="width: 100%"
            @selection-change="handleSelectionChange" >

            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column
              prop="username"
              label="用户名"
              width="100">
            </el-table-column>
             <el-table-column
              prop="nick"
              label="昵称"
              width="100">
            </el-table-column>
            <el-table-column
              prop="phone"
              label="联系方式"
              width="120">
            </el-table-column>
            <el-table-column
              prop="address"
              :show-overflow-tooltip="true"
              width="250"
              label="地址">
            </el-table-column>
            <el-table-column
              prop="info"
              :show-overflow-tooltip="true"
              label="描述"
              width="220">
            </el-table-column>
            <el-table-column
              prop="score"
              label="积分"
              width="60">
            </el-table-column>
            <el-table-column
              prop="yue"
              label="余额"
              width="60">
            </el-table-column>
            <el-table-column
              prop="roleDetail.name"
              label="角色"
              width="100">
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态"
              width="80">
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.status"
                  :active-value="1"
                  active-color="#00A854"
                  inactive-color="#F04134"
                  :inactive-value="0"
                  @change="changeStatus(scope.row.id,scope.row.status)"
                  />
              </template>
            </el-table-column>
            <el-table-column
                label="操作">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" circle @click="editOrQueryUser(scope.row.id,'edit')"></el-button> 
                    <el-button type="info" icon="el-icon-message" circle @click="editOrQueryUser(scope.row.id,'query')"></el-button>
                </template>
           </el-table-column>
           
          </el-table>
        </template>
        
        <!-- 分页-->
        <el-pagination
            background
            style="margin-top:10px;"
            v-if="page.total>page.size"
            layout="prev, pager, next"
            @current-change="currentChange"
            :page-size="page.size"
            :current-page="page.index"
            :total="page.total">
        </el-pagination>


        <!-- 编辑信息弹出框-->
          <el-dialog :title="mytitle" :visible.sync="dialogFormVisible">
            <el-form :model="form" :rules="userRules" ref="form">
              <el-image  v-if="isQuery==true && form.image!=''" :src="form.image" style="width: 150px; height: 150px;margin-bottom:10px;"></el-image>
             
              <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
                <el-input v-model="form.username" :disabled="!isAdd" :validate-event="true" @change="checkUserName(form.username)"></el-input>
              </el-form-item>
               <el-form-item label="密码" :label-width="formLabelWidth" prop="password" v-if="isAdd">
                <el-input v-model="form.password"  :disabled="isQuery"></el-input>
              </el-form-item>
               <el-form-item label="昵称" :label-width="formLabelWidth" prop="nick">
                <el-input v-model="form.nick"  :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="联系方式" :label-width="formLabelWidth" prop="phone">
                <el-input v-model="form.phone" :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="选择地址" :label-width="formLabelWidth" v-if="isAdd">
                <div class="block" :disabled="isQuery">
                  <el-cascader
                    v-model="addressList"
                    :options="options" @change="handleChange"
                    ></el-cascader>
                </div>
              </el-form-item>
              <el-form-item label="详细地址" :label-width="formLabelWidth">
                <el-input v-model="form.address" :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="积分" :label-width="formLabelWidth">
                <el-input v-model="form.score"  :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="余额" :label-width="formLabelWidth" v-if="isAdd==false">
                <el-input v-model="form.yue"  :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="描述" :label-width="formLabelWidth">
                <el-input v-model="form.info" :disabled="isQuery"></el-input>
              </el-form-item>
               <el-form-item label="角色" :label-width="formLabelWidth" prop="role">
                <el-select v-model="form.role" placeholder="请选择角色" :disabled="isQuery">
                  <el-option v-for="item in roleList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
               </el-form-item>
               <el-form-item label="状态" :label-width="formLabelWidth" prop="status">
                <el-select v-model="form.status" placeholder="请选择状态" :disabled="isQuery">
                  <el-option v-for="item in statusList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
               </el-form-item>
               <!--文件上传-->
              <el-form-item label="头像" :label-width="formLabelWidth" v-if="!isQuery">
               <input class="upload-demo" multiple type="file" ref="file" id="uploadFile" @change="fileUpload($event)" />
              </el-form-item>
               </el-form>
               <el-progress style="margin-top:5px;" :text-inside="true" :stroke-width="15" :percentage="fileUploadPercent" status="success" v-if="fileUploadPercent!==0 && !isQuery"></el-progress>

              <div slot="footer" class="dialog-footer">
                <el-button v-if="this.isEdit==true|| this.isAdd==true" @click="resetForm()">重 置</el-button>
                <el-button v-if="this.isEdit==true" type="primary" @click="saveUser('modify')">修 改</el-button>
                <el-button v-if="this.isAdd==true" type="primary" @click="saveUser('add')" :disabled="isExisit">新 增</el-button>
              </div>
            
          </el-dialog>

  </div>
</template>
<script src="https://cdn.staticfile.org/axios/0.18.0/axios.min.js"></script>
<script>

export default {
  data () {
    return {
      msg: '用户管理',
      resubmit: false,  //防止表单重复提交
      currentUserNo:sessionStorage.getItem('currentUserID'),
      currentUserRole:sessionStorage.getItem('currentUserRole'),
      token:sessionStorage.getItem('token'),
      tableData: [],
      idList:[],
      statusList:[{"id":1,"name":"正常"},{"id":0,"name":"停用"}],
      roleList:[],
      addressList:[],
      page:{
          size:7,
          total:0,
          index:1,
          flag:true,
      },
      mytitle:'编辑用户信息',
      isQuery: true,  //默认是查询操作
      isEdit:false,
      isAdd:false,
      isExisit:false,
      dialogVisible: false,
      dialogFormVisible: false,
      mymsg:'',
      userNameQuery: '',
      roleQuery: '',
      statusQuery: '',
      fileUploadPercent:0,
      form: {
          id:'',
          username: '',
          phone: '',
          address: '',
          score: '',
          yue: '',
          status: '',
          role: '',
          password:'',
          image:'',
          info:'',
          nick:''
        },
        formLabelWidth: '100px',
        userRules:{
          username:[{ required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 5, max: 20, message: '长度在 5 到 20 个字符', trigger: 'blur' }],
          password:[{ required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 5, max: 20, message: '长度在 5 到 20 个字符', trigger: 'blur' }],
          phone:[{ required: true, message: '请输入联系方式', trigger: 'blur' },
                    { min: 11, max: 11, message: '请输入正确的电话号码', trigger: 'blur' }],
          role:[{ required: true, message: '请选择角色', trigger: 'change'}],
          status:[{ required: true, message: '请选择状态', trigger: 'change' }],
          nick:[{ required: true, message: '请填写昵称', trigger: 'change' }]
        },
        options: [{
          value: '广东省',
          label: '广东省',
          children: [{
            value: '广州市',
            label: '广州市',
            children: [{
              value: '天河区',
              label: '天河区',
                children: [{
                  value: '天园街道',
                  label: '天园街道'
               }]
            }]
          },]
        }],
    }
  },
  mounted () {
      this.initUser();
  },
  methods: {
      toggleSelection(rows) { ///checkbox点击触发1
        if (rows) {
          rows.forEach(row => {
            this.$refs.multipleTable.toggleRowSelection(row);
          });
        } else {
          this.$refs.multipleTable.clearSelection();
        }
      },
      handleSelectionChange(val) { //checkbox点击触发2
        this.idList=[];
        val.forEach(res=>{
             this.idList.push(res.id);
        });
      },
      delUser(){   //批量删除
          let that=this;
          if(that.idList.length>0)
          {
              let url='api/admin/user/delete?idList='+that.idList.toString();
              if(confirm('确认删除？'))
              {
                  that.$axios.delete(url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                  that.$message.success("删除成功");
                    that.initUser();
                  })
                  .catch(function (error) { // 请求失败处理
                    that.$message.error(error);
                  });
              }
          }else{
            alert('请选择记录！');
          }
      },
      initUser()  //初始化数据
      {
        let url='api/admin/user/query'; 
        let jsonDate={
            "pageSize":+this.page.size,"pageNum":this.page.index,"username":this.userNameQuery,"role":this.roleQuery,"status":this.statusQuery
        };
        this.$axios.post(url,jsonDate,{headers:{"Authorization":"Bearer "+this.token}})
        .then((response)=>{
          this.tableData=response.data.data.list;
          this.page.total=response.data.data.total;
          this.page.index=response.data.data.pageNum;
        })
        .catch(function (error) { // 请求失败处理
          console.log(error);
        });

        this.$axios.get("api/admin/user/userRole/queryRole",{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
          this.roleList=response.data.data;
        })
        .catch(function (error) { // 请求失败处理
          console.log(error);
        });
      },
      //分页触发的方法
       currentChange(current){
            this.page.index=current;
            this.initUser();
       },
       editOrQueryUser(val,flag)
       {
          this.dialogFormVisible = true;
          this.resubmit=false;
          if(flag=='edit')
          {
            this.isQuery=false;
            this.isEdit=true;
            this.isAdd=false;
            this.mytitle='编辑信息详情';
          }
          if(flag=='query')
          {
            this.isQuery=true;
            this.isEdit=false;
            this.isAdd=false;
            this.mytitle='用户信息详情';
          }
          if(val!=null)
          {
            let find_url='api/admin/user/query/'+val.toString();
            this.$axios.get(find_url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
              let mydata=response.data.data;
              this.form.id=mydata.id;
              this.form.username=mydata.username;
              this.form.phone=mydata.phone;
              this.form.address=mydata.address;
              this.form.score=mydata.score;
              this.form.yue=mydata.yue;
              this.form.status=mydata.status;
              this.form.role=mydata.role;
              this.form.nick=mydata.nick;
              //this.form.password=mydata.password;
              this.form.image=mydata.image;
              this.form.info=mydata.info;
            })
            .catch(function (error) { // 请求失败处理
              this.$message.error(error);
            });
          }
          
       },
       addUser()
       {
            this.dialogFormVisible = true;
            this.isQuery=false;
            this.isEdit=false;
            this.isAdd=true;
            this.mytitle='新增用户信息';
            this.resubmit=false;
            let _self = this;
            this.resetForm();
       },
       clearQueryCondition(){
        this.userNameQuery='';
        this.roleQuery='';
        this.statusQuery='';
        this.initUser();
       },
       saveUser(flag)
       {
         this.$refs['form'].validate((valid) => {
            if (valid) {   //格式填写正确
              if(!this.resubmit)  //如果是第一次提及 放行
              {
                this.resubmit=true;
                this.dialogFormVisible = false; 
                if(flag=='add')
                {
                  let add_url = 'api/admin/user/insert';
                  let postData = {
                    "username":this.form.username,"phone":this.form.phone,"address":this.form.address,"password":this.form.password,
                    "score":this.form.score,"yue":this.form.yue,"status":this.form.status,"role":this.form.role,"creater":this.currentUserNo
                    ,"image":this.form.image,"info":this.form.info,"nick":this.form.nick};
                  this.$axios.post(add_url,postData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                      this.$message.success("添加成功");
                      this.initUser();
                   })
                  .catch(function (error) { // 请求失败处理
                    this.$message.error(error);
                  });
                }

                if(flag=='modify')
                {
                  let modify_url = 'api/admin/user/modify';
                  let putData = { "id":this.form.id,
                    "username":this.form.username,"phone":this.form.phone,"address":this.form.address,"info":this.form.info,"updater":this.currentUserNo,//"password":this.form.password
                    "score":this.form.score,"yue":this.form.yue,"status":this.form.status,"role":this.form.role,"image":this.form.image,"nick":this.form.nick};
                  this.$axios.put(modify_url,putData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                      this.$message.success("修改成功");
                      this.initUser();
                   })
                  .catch(function (error) { // 请求失败处理
                    this.$message.error(error);
                  });
                }
              }else{
                this.$message.error("请勿重复提交");
              }
            } else {
              return false;
            }
          });
       },
       checkUserName(value){
         if(value!='')
         {
          let postData={"pageSize":1,"pageNum":1,"username":this.form.username}
          this.$axios.post('api/admin/user/query',postData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
              if(response.data.data.total>0)  //用户名存在
              {
                 this.isExisit=true;
                 this.$message.error("用户名已存在");
              }else{
                this.isExisit=false;
              }
          })
         }
       },
      handleChange(value) {
        value.forEach(res=>{
            this.form.address+=res;
        })
      }
      ,fileUpload(e) {
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
                    // 'Content-Type': 'application/x-www-form-urlencoded',  // 表单
                    //'Content-Type': 'application/json;charset=UTF-8'  // json
                },
                onUploadProgress: progressEvent => {
                  this.fileUploadPercent=(progressEvent.loaded / progressEvent.total * 100) | 0 //调用onProgress方法来显示进度条，需要传递个对象 percent为进度值
                }
            }).then(function (response) {
                that.form.image=response.data;
            }).catch(function (reason) {
                console.log(reason);
           })
      },
      resetForm() {
        this.form.address='';
        this.form.info='';
        this.form.score='';
        this.addressList=[];
        this.form.image='';
        this.form.id='';
        this.form.nick='';
        this.form.address='';
        this.form.yue='';
        this.form.status='';
        this.form.role='';
        this.fileUploadPercent=0;
        this.form.password='';
        if (this.$refs['form'] != undefined) {
            this.$refs['form'].resetFields();
        }
      },
      resetPwd()  //重置密码
      {
          if(this.idList)
          {
            if(confirm("确定要重置密码?"))
            {
              this.$axios.put('api/admin/user/resetPwd?idList='+this.idList,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                this.$message.success("操作成功!!");
              })
            }
          }else{
            this.$message.error("请选择记录!!");
          }
      },
      changeStatus(id,status)
      {
        let putData = { "id":id,"status":status};
        let modify_url = 'api/admin/user/modify';
        this.$axios.put(modify_url,putData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
             this.initUser();
        })
      }
    
  }
}
</script>

<style scoped>

.el-select .el-input {
    width: 130px;
  }
  .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }
</style>
