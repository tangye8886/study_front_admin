<template>

  <div>
    <el-breadcrumb separator="/" style="margin-bottom:30px">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a>菜单管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>菜单树</el-breadcrumb-item>
      </el-breadcrumb>
      
          <div class="custom-tree-container">
                <div class="block">
                  <el-tree
                    :data="data"
                    show-checkbox
                    node-key="id"
                    default-expand-all
                    :expand-on-click-node="false"
                    :render-content="renderContent">
                  </el-tree>
                </div>
                <el-row style="float:left;margin-left:10px;margin-top:30px;">
                      <!-- 新增一级菜单按钮-->
                        <el-button type="success"  @click="openAddRootMenu()" >新增一级菜单</el-button>
                </el-row>
            </div>
          <div>
                <el-dialog :title="mytitle" :visible.sync="dialogFormVisible">
                    <el-form :model="form" :rules="menuRules" ref="form">
                      <el-form-item label="菜单名称" :label-width="formLabelWidth" prop="label">
                        <el-input v-model="form.label"></el-input>
                      </el-form-item>
                      <el-form-item label="路径" :label-width="formLabelWidth">
                        <el-input v-model="form.url"></el-input>
                      </el-form-item>
                      <el-form-item label="图标" :label-width="formLabelWidth"  v-if="!isAddForm">
                        <el-input v-model="form.icon"></el-input>
                      </el-form-item>
                      <el-form-item label="状态" :label-width="formLabelWidth" prop="status">
                          <el-select v-model="form.status" placeholder="请选择状态">
                            <el-option v-for="item in statusList"
                              :key="item.id"
                              :label="item.name"
                              :value="item.id">
                            </el-option>
                          </el-select>
                        </el-form-item>
                    </el-form>
                    <div slot="footer" class="dialog-footer">
                      <el-button @click="dialogFormVisible = false">取 消</el-button>
                      <el-button v-if="isAddForm" type="primary" @click="addMenu()">确 定</el-button>
                      <el-button v-if="isEditForm" type="primary" @click="submitEdit()">修 改</el-button>
                    </div>
                </el-dialog>
          </div>
            <!-- 一级菜单编辑框 -->
          <div>
                <el-dialog title="添加一级菜单" :visible.sync="dialogFormVisible2">
                    <el-form :model="form" :rules="menuRules" ref="form">
                      <el-form-item label="菜单名称" :label-width="formLabelWidth" prop="label">
                        <el-input v-model="form.label"></el-input>
                      </el-form-item>
                      <el-form-item label="图标" :label-width="formLabelWidth" prop="icon">
                        <el-input v-model="form.icon"></el-input>
                      </el-form-item>
                      <el-form-item label="状态" :label-width="formLabelWidth" prop="status">
                        <el-select v-model="form.status" placeholder="请选择状态">
                          <el-option v-for="item in statusList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id">
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-form>
                    <div slot="footer" class="dialog-footer">
                      <el-button  @click="clearForm()">重 置</el-button>
                      <el-button  type="primary" @click="addRootMenu()">添 加</el-button>
                    </div>
                </el-dialog>
          </div>
  </div>
    
</template>

<script>
 let id = 1000;
export default {
  data() {
    const data = [];
    const globaldData = [];
      return {
        activeName: 'first',
        resubmit:false,
        statusList:[{"id":1,"name":"正常"},{"id":0,"name":"停用"}],
        currentUserNo:sessionStorage.getItem('currentUserID'),
        currentUserRole:sessionStorage.getItem('currentUserRole'),
        token:sessionStorage.getItem('token'),
        data: JSON.parse(JSON.stringify(data)),
        form:{
          id:'',
          label:'',
          url:'',
          status:'',
          pid:'',
          icon:''
        },
        mytitle:'',
        isAddForm:false,
        isEditForm:false,
        dialogTableVisible: false,
        dialogFormVisible: false,
        dialogFormVisible2: false,
        formLabelWidth: '120px',
        isOneMenu:false,
        menuRules:{
          label:[{ required: true, message: '请填写标题', trigger: 'blur'}],
          icon:[{ required: true, message: '请填写图标', trigger: 'blur'}],
          url:[{ required: true, message: '请填写路径', trigger: 'blur'}],
          status:[{ required: true, message: '请选择状态', trigger: 'change'}]
        }
      };
    },
    created(){
      this.initMenuManager();
    },
    methods: {
      handleClick(tab, event) {
        console.log(tab, event);
      },
      append(data) {
        this.clearForm();
        this.dialogFormVisible=true
        this.globaldData=data;
        this.mytitle='新增子菜单';
        this.isAddForm=true;
        this.isEditForm=false;
        this.resubmit=false;
        this.$refs['form'].resetFields();
      },
      remove(node, data) {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        if(confirm("确定删除此菜单？"))
        {
            this.$http.delete("api/admin/menu/delete?idList="+data.id,{headers:{"Authorization":"Bearer "+this.token}}).then(res=>{
               this.data=res.data.data;
               this.initMenuManager();
               children.splice(index, 1);
            });
        }
      },

      renderContent(h, { node, data, store }) {
        return (
          <span class="custom-tree-node">
            <span>{node.label}</span>
            <span>
              <el-button size="mini" style="margin-left:20%" type="text" on-click={ () => this.append(data) }>新增</el-button>
              <el-button size="mini" type="text" on-click={ () => this.remove(node, data) }>删除</el-button>
              <el-button size="mini" type="text" on-click={ () => this.editMenu(data) }>编辑</el-button>
            </span>
          </span>);
      },
      initMenuManager()  //初始化数据
      {
        this.$axios.get("api/admin/menu/query?roleid="+this.currentUserRole,{headers:{"Authorization":"Bearer "+this.token}}).then(res=>{
           this.data=res.data;
        });
      },
      addMenu()//点击添加提交表单触发
      {
          this.$refs['form'].validate((valid) => {
            if (valid) {
                if(!this.resubmit)  //如果是第一次提及 放行
                {
                    this.resubmit=true;
                    this.dialogFormVisible = false
                    let add_url="api/admin/menu/insert";
                    let postData = {"label":this.form.label,"url":this.form.url,"creater":this.currentUserNo,
                                  "status":this.form.status,"pid":this.globaldData.id}
                    this.$axios.post(add_url,postData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                           this.$message.success("添加成功");
                           this.initMenuManager();
                     })
                }else{
                  this.$message.error("请勿重复提交");
                }
              }
              else{
                return false;
              }
          });
       
      },
      editMenu(data){  //点击编辑触发
        this.isAddForm=false;
        this.isEditForm=true;
        this.resubmit=false;
        this.mytitle='编辑菜单';
        this.$http.get("api/admin/menu/query/"+data.id,{headers:{"Authorization":"Bearer "+this.token}}).then(res=>{
            let mydata=res.data.data;
            this.form.id=mydata.id;
            this.form.url=mydata.url;
            this.form.label=mydata.label;
            this.form.status=mydata.status;
            this.form.pid=mydata.pid;
            this.form.icon=mydata.icon;
         });
         this.dialogFormVisible = true;
      },
      submitEdit(){   //点击提交修改表单触发
          this.$refs['form'].validate((valid) => {
            if (valid) {
              if(!this.resubmit)  //如果是第一次提及 放行
              {
                  this.resubmit=true;
                  let modifyMenu_url="api/admin/menu/modify";
                  if(this.form.id){
                    if(this.form.status=='正常') this.form.status=1;
                    if(this.form.status=='停用') this.form.status=0;
                    let putData = {"id":this.form.id,"label":this.form.label,"url":this.form.url,"updater":this.currentUserNo,
                                "status":this.form.status,"pid":this.form.pid,"icon":this.form.icon}
                    this.$axios.put(modifyMenu_url,putData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                            this.$message.success("修改成功");
                            this.dialogFormVisible = false;
                            this.initMenuManager();
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
      clearForm()  //清空数据
      {
          this.form.id='';
          this.form.url='';
          this.form.label='';
          this.form.status='';
          this.form.pid='';
          this.form.icon='';
      },
      openAddRootMenu()  //点击添加一级菜单
      {
          this.dialogFormVisible2 = true
          this.resubmit=false
          this.clearForm();
          if (this.$refs['form'] != undefined) {
            this.$refs['form'].resetFields();
          }
      },
      addRootMenu()    //提交添加一级菜单表单触发
      {
          this.$refs['form'].validate((valid) => {
            if (valid) {
              if(!this.resubmit)  //如果是第一次提及 放行
              {
                  this.resubmit=true;
                  let addMenu_url="api/admin/menu/insert";
                  let postData = {"label":this.form.label,"status":this.form.status,"pid":"0","icon":this.form.icon}
                  this.$axios.post(addMenu_url,postData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                         this.$message.success("添加成功");
                   })
                  this.dialogFormVisible2 = false;
                  this.initMenuManager();
              }else{
                this.$message.error("请勿重复提交");
              }
            }
            else{
                return false;
            }
          });
      },
    }
}
</script>


<style scoped>
 .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
