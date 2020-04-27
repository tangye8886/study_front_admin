<template>
  <div class="hello">
     
       <el-breadcrumb separator="/" style="margin-bottom:10px">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a>权限管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row style="float:left;margin-left:10px;margin-bottom:10px;">
         <!-- 删除按钮-->
          <el-button type="danger" :disabled="false"
          @click="delRole()"  icon="el-icon-delete" circle></el-button>
         <!-- 新增按钮-->
          <el-button type="success" :disabled="false"
                 @click="addRole()"  icon="el-icon-plus" circle></el-button>
      </el-row>

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
              prop="id"
              label="编号"
              width="180">
            </el-table-column>
            <el-table-column
              prop="name"
              label="名称"
              width="220">
            </el-table-column>
            <el-table-column
              prop="code"
              label="代码"
              width="220">
            </el-table-column>
            <el-table-column
              prop="info"
              label="描述"
              width="220">
            </el-table-column>
            <el-table-column
              prop="sort"
              label="排序"
              width="80">
            </el-table-column>
            <el-table-column
                label="操作">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" circle @click="editOrQueryRole(scope.row.id,'edit')"></el-button> 
                    <el-button type="info" icon="el-icon-info" circle @click="editOrQueryRole(scope.row.id,'query')"></el-button>
                    <el-button type="success" round @click="openLink(scope.row.id)">关联菜单</el-button>
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
            <el-form :model="form" :rules="roleRules" ref="form">
              <el-form-item label="名称" :label-width="formLabelWidth" prop="name">
                <el-input v-model="form.name" autocomplete="off" :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="代码" :label-width="formLabelWidth" prop="code">
                <el-input v-model="form.code" autocomplete="off" :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="描述" :label-width="formLabelWidth" prop="info">
                <el-input v-model="form.info" autocomplete="off" :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="序号" :label-width="formLabelWidth" prop="sort">
                <el-input v-model="form.sort" autocomplete="off" :disabled="isQuery"></el-input>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button v-if="this.isEdit==true|| this.isAdd==true" @click="clearFormInfo()">重 置</el-button>
              <el-button v-if="this.isEdit==true" type="primary" @click="saveRole('modify')">修 改</el-button>
              <el-button v-if="this.isAdd==true" type="primary" @click="saveRole('add')">新 增</el-button>
            </div>
          </el-dialog>


          <!-- 关联菜单弹出框-->
          <el-dialog title="关联菜单" :visible.sync="dialogFormVisible2">
                <div style="margin: 15px 0;"></div>
                <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
                  <el-checkbox v-for="item in menuOptions" :label="item.id" :key="item.id">{{item.label}}</el-checkbox>
                </el-checkbox-group>
              <el-button type="success"  @click="linkMenu()" style="margin-top:20px">关联</el-button>
          </el-dialog>

  </div>
</template>
<script src="https://cdn.staticfile.org/axios/0.18.0/axios.min.js"></script>
<script>

export default {
  data () {
    return {
      msg: '角色管理',
      resubmit:false,
      currentUserNo:sessionStorage.getItem('currentUserID'),
      currentUserRole:sessionStorage.getItem('currentUserRole'),
      token:sessionStorage.getItem('token'),
      tableData: [], // 存table数据
      idList:[],  // 存多选边框ID  用于保存要删除ID的数组
      checkAll: false,
      menuOptions:[], // 保存菜单ID
      checkedCities:[],  //保存角色有的菜单ID(默认选中的菜单ID)
      isIndeterminate: true,
      page:{   // 分页
          size:7,
          total:0,
          index:1,
          flag:true,
      },
      mytitle:'编辑角色信息',
      isQuery: true,  //默认是查询操作
      isEdit:false,
      isAdd:false,
      dialogVisible: false,
      dialogFormVisible: false,
      dialogFormVisible2: false,
      mymsg:'',
      searchContent: '',
      form: {
          id:'',
          name: '',
          code:'',
          info:'',
          sort:''
        },
      formLabelWidth: '100px',
      roleRules:{
          name:[{ required: true, message: '请填写名称', trigger: 'blur'}],
          info:[{ required: true, message: '请填写描述信息', trigger: 'blur'}],
          code:[{ required: true, message: '请填写代码编号', trigger: 'blur'}],
          sort:[{ required: true, message: '请填写排列顺序', trigger: 'blur'}]
      }
    }
  },
  mounted () {
      this.initRole();
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
      delRole(){   //批量删除
          let that=this;
          if(that.idList.length>0)
          {
              let url='api/admin/user/userRole/delete?idList='+that.idList.toString();
              if(confirm('确认删除？'))
              {
                  that.$axios.delete(url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                    that.$message.success("删除成功");
                    that.initRole();
                  })
                  .catch(function (error) { // 请求失败处理
                    that.$message.error(error);
                  });
              }
          }else{
            alert('请选择记录！');
          }
      },
      initRole()  //初始化数据
      {
        let url='api/admin/user/userRole/query?pageSize='+this.page.size+'&pageNum='+this.page.index;
        if(this.searchContent!='' && this.searchContent!=null ) url+="&username="+this.searchContent;

        this.$axios.get(url,{headers:{"Authorization":"Bearer "+this.token}})
        .then((response)=>{
          this.tableData=response.data.data.list;
          this.page.total=response.data.data.total;
          this.page.index=response.data.data.pageNum;
        })
        .catch(function (error) { // 请求失败处理
          console.log(error);
        });

        this.$http.get("api/admin/menu/queryOneMenu",{headers:{"Authorization":"Bearer "+this.token}}).then(res=>{
           this.menuOptions=res.data;
        });
      },
      //分页触发的方法
       currentChange(current){
            this.page.index=current;
            this.initRole();
       },
       editOrQueryRole(val,flag)
       {
          this.dialogFormVisible = true;
          this.resubmit=false;
          if(flag=='edit')
          {
            this.isQuery=false;
            this.isEdit=true;
            this.isAdd=false;
            this.mytitle='编辑角色';
          }
          if(flag=='query')
          {
            this.isQuery=true;
            this.isEdit=false;
            this.isAdd=false;
            this.mytitle="角色详情";
          }
          if(val!=null)
          {
            let find_url='api/admin/user/userRole/query/'+val.toString();
            this.$axios.get(find_url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
              let mydata=response.data.data;
              this.form.id=mydata.id;
              this.form.name=mydata.name;
              this.form.code=mydata.code;
              this.form.info=mydata.info;
              this.form.sort=mydata.sort;
            })
            .catch(function (error) { // 请求失败处理
              this.$message.error(error);
            });
          }
          
       },
       addRole()
       {
            this.dialogFormVisible = true;
            this.isQuery=false;
            this.isEdit=false;
            this.isAdd=true;
            this.mytitle='新增角色';
            this.resubmit=false;
            this.clearFormInfo();
       },
       clearFormInfo(){
            this.form.id='';
            this.form.name='';
            this.form.code='';
            this.form.info='';
            this.form.sort='';
          if (this.$refs['form'] != undefined) {
            this.$refs['form'].resetFields();
          }
       }, 
       saveRole(flag)
       {
         this.$refs['form'].validate((valid) => {
            if (valid) {
              if(!this.resubmit)  //如果是第一次提及 放行
              {
                  this.resubmit=true;
                  this.dialogFormVisible = false;
                  if(flag=='add')
                  {
                    let add_url = 'api/admin/user/userRole/insert';
                    let postData = {"name":this.form.name,"code":this.form.code,"info":this.form.info,"sort":this.form.sort};
                    this.$axios.post(add_url,postData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                        this.$message.success("添加成功");
                        this.initRole();
                     })
                    .catch(function (error) { // 请求失败处理
                      this.$message.error(error);
                    });
                  }
                  if(flag=='modify')
                  {
                    let modify_url = 'api/admin/user/userRole/modify';
                    let putData = { "id":this.form.id,"name":this.form.name,"code":this.form.code,"info":this.form.info,"sort":this.form.sort};
                    this.$axios.put(modify_url,putData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                        this.$message.success("修改成功");
                        this.initRole();
                     })
                    .catch(function (error) { // 请求失败处理
                      this.$message.error(error);
                    });
                  }
              }else{
                this.$message.error("请勿重复提交");
              }
            }
            else{
                return false;
            }
          });
          
       },
       openLink(val){
          let that=this;
          that.checkedCities=[];
          this.dialogFormVisible2=true;
          this.$axios.get('api/admin/user/userRole/query/'+val.toString(),{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
              let mydata=response.data.data;
              this.form.id=mydata.id;
              this.form.name=mydata.name;
          });
          //val:  角色ID
          //初始化 多选框的值
          this.$axios.get('api/admin/menu/queryOneMenuByRole?roleid='+val.toString(),{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
              response.data.forEach(function (item, index) {
                  that.checkedCities.push(item.id);
              });
          });
       },
       linkMenu(){
            // this.form.id :  单击记录的 角色ID
          if(confirm("确定关联?"))
          {
                let meneidList=[];
               //关联菜单
                this.checkedCities.forEach(res=>{
                    meneidList.push(res);
                });
                let url='api/admin/menu/roleMenu/addManyRoleMenu?roleid='+this.form.id+'&menuid='+meneidList.toString();
                this.$axios.get(url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                 this.$message.success("关联成功");
                });
                this.dialogFormVisible2=false;
          }
       },
       handleCheckedCitiesChange(value) {
        // value ： 多选框选中的ID     
        this.checkedCities=value;
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
