<template>
  <div class="hello">
    
      <el-breadcrumb separator="/" style="margin-bottom:10px">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a>课程管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>类型列表</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row style="float:left;margin-left:10px;margin-bottom:10px;">
         <!-- 删除按钮-->
          <el-button type="danger" :disabled="false"
          @click="delCourseType()"  icon="el-icon-delete" circle></el-button>
         <!-- 新增按钮-->
          <el-button type="success" :disabled="false"
                 @click="openAddCourseType()"  icon="el-icon-plus" circle></el-button>
      </el-row>

      
        <div> 
            <span style='color:black'>名称: </span><el-input v-model="courseTypeQuery" autocomplete="off" style="width:100px"></el-input>
            <el-button slot="append" icon="el-icon-search" @click="initCourseType()"></el-button>
            <el-button slot="append" icon="el-icon-refresh" @click="clearQueryCondition()"></el-button>
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
              prop="id"
              label="编号"
              width="180">
            </el-table-column>
            <el-table-column
              prop="name"
              label="名称"
              width="450">
            </el-table-column>
            <el-table-column
              prop="creatime"
              label="创建时间"
              width="400">
            </el-table-column>
            <el-table-column
                label="操作">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" circle @click="openEditOrQueryCourseType(scope.row.id,'edit')"></el-button> 
                    <el-button type="info" icon="el-icon-message" circle @click="openEditOrQueryCourseType(scope.row.id,'query')"></el-button>
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
            <el-form :model="form" :rules="typeRules" ref="form">
              <el-form-item label="名称" :label-width="formLabelWidth" prop="name">
                <el-input v-model="form.name" autocomplete="off" :disabled="isQuery"></el-input>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button v-if="this.isEdit==true|| this.isAdd==true" @click="clearFormInfo()">重 置</el-button>
              <el-button v-if="this.isEdit==true" type="primary" @click="saveCourseType('modify')">修 改</el-button>
              <el-button v-if="this.isAdd==true" type="primary" @click="saveCourseType('add')">新 增</el-button>
            </div>
          </el-dialog>

  </div>
</template>
<script src="https://cdn.staticfile.org/axios/0.18.0/axios.min.js"></script>
<script>

export default {
  data () {
    return {
      msg: '课程类型列表',
      resubmit:false,
      currentUserNo:sessionStorage.getItem('currentUserID'),
      currentUserRole:sessionStorage.getItem('currentUserRole'),
      token:sessionStorage.getItem('token'),
      tableData: [],
      idList:[],
      page:{
          size:7,
          total:0,
          index:1,
          flag:true,
      },
      mytitle:'编辑课程信息',
      isQuery: true,  //默认是查询操作
      isEdit:false,
      isAdd:false,
      dialogVisible: false,
      dialogFormVisible: false,
      mymsg:'',
      searchContent: '',
      form: {
          id:'',
          name: ''
       },
      formLabelWidth: '100px',
      courseTypeQuery:'',
      typeRules:{
          name:[{ required: true, message: '请填写名称', trigger: 'blur'}]
      }
    }
  },
  mounted () {
      this.initCourseType();
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
      delCourseType(){   //批量删除
          if(this.idList.length>0)
          {
              let url='api/admin/course/type/delete?idList='+this.idList.toString();
              if(confirm('确认删除？'))
              {
                  this.$axios.delete(url,{headers:{"Authorization":"Bearer "+this.token}})
                  .then((response)=>{
                  this.$message.success("删除成功");
                      this.initCourseType();
                  })
                  .catch(function (error) { // 请求失败处理
                    this.$message.error(error);
                  });
              }
          }else{
            alert('请选择记录！');
          }
      },
      initCourseType()  //初始化数据
      {
        let url='api/admin/course/type/query';
        let jsonDate={
            "pageSize":this.page.size,"pageNum":this.page.index,"name":this.courseTypeQuery,
            "creater":this.currentUserNo,"role":this.currentUserRole
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
        
      },
      //分页触发的方法
       currentChange(current){
            this.page.index=current;
            this.initCourseType();
       },
       openEditOrQueryCourseType(val,flag)
       {
          this.resubmit=false;
          this.dialogFormVisible = true;
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
            this.mytitle='课程信息详情';
          }
          if(val!=null)
          {
            let find_url='api/admin/course/type/query/'+val.toString();
            this.$axios.get(find_url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
              let mydata=response.data.data;
              this.form.id=mydata.id;
              this.form.name=mydata.name;
            })
            .catch(function (error) { // 请求失败处理
              this.$message.error(error);
            });
          }
          
       },
       openAddCourseType()
       {
            this.dialogFormVisible = true;
            this.isQuery=false;
            this.isEdit=false;
            this.isAdd=true;
            this.mytitle='新增课程信息';
            this.resubmit=false;
            this.clearFormInfo();
       },
       clearFormInfo(){
            this.form.id='';
            this.form.name='';
          if (this.$refs['form'] != undefined) {
            this.$refs['form'].resetFields();
          }
       }, 
       clearQueryCondition(){
        this.courseTypeQuery='';
        this.initCourseType();
       },
       saveCourseType(flag)
       {
          this.$refs['form'].validate((valid) => {
            if (valid) {
              if(!this.resubmit)  //如果是第一次提及 放行
              {
                  this.resubmit=true;
                   this.dialogFormVisible = false;
                  if(flag=='add')
                  {
                    let add_url = 'api/admin/course/type/insert';
                    let postData = {"name":this.form.name,"creater":this.currentUserNo};
                    this.$axios.post(add_url,postData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                        this.$message.success("添加成功");
                        this.initCourseType();
                     })
                    .catch(function (error) { // 请求失败处理
                      this.$message.error(error);
                    });
                  }
                  if(flag=='modify')
                  {
                    let modify_url = 'api/admin/course/type/modify';
                    let putData = { "id":this.form.id,"name":this.form.name};
                    this.$axios.put(modify_url,putData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                        this.$message.success("修改成功");
                        this.initCourseType();
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
