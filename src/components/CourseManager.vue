<template>
  <div class="hello">

      <el-breadcrumb separator="/" style="margin-bottom:10px">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a>课程管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>课程列表</el-breadcrumb-item>
      </el-breadcrumb>
     
      <el-row style="float:left;margin-left:10px;margin-bottom:10px;">
         <!-- 删除按钮-->
          <el-button type="danger" :disabled="false"
          @click="delCourse()"  icon="el-icon-delete" circle></el-button>
         <!-- 新增按钮-->
          <el-button type="success" :disabled="false"
                 @click="openAddCourse()"  icon="el-icon-plus" circle></el-button>
      </el-row>

        <div> 
            <span style='color:black'>课程: </span><el-input v-model="courseQuery" autocomplete="off" style="width:100px"></el-input>
           <el-select v-model="typeQuery" placeholder="请选择类型">
                  <el-option v-for="item in typeList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
            </el-select>
            <el-select v-model="teacherQuery" placeholder="请选择讲师"  v-if="optFlag">
                  <el-option v-for="item in teacherList"
                    :key="item.id"
                    :label="item.nick"
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
            <el-button slot="append" icon="el-icon-search" @click="initCourse()"></el-button>
            <el-button slot="append" icon="el-icon-refresh" @click="clearQueryCondition()"></el-button>
        </div>
      <el-divider><i class="el-icon-caret-bottom"></i></el-divider>
      <!--表单-->
      <template>
          <el-table
            :data="tableData"
            v-loading="loading"
            element-loading-text="Loading..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(255,255,255,0.8)"
            style="width: 100%"
            @selection-change="handleSelectionChange" >
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="title"
              label="标题"
              width="280">
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="content"
              label="简介"
              width="350">
            </el-table-column>
            <el-table-column
              prop="teacherDetail.username"
              width="180"
              label="讲师">
            </el-table-column>
            <el-table-column
              prop="price"
              label="价格"
              width="100">
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态"
              width="100">
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
                    <el-button type="primary" icon="el-icon-edit" circle @click="openEditOrQueryCourse(scope.row.id,'edit')"></el-button> 
                    <el-button type="info" icon="el-icon-message" circle @click="openEditOrQueryCourse(scope.row.id,'query')"></el-button>
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
            <el-form :model="form" :rules="courseRules" ref="form">
            <el-image  v-if="isQuery==true" :src="form.image" style="width: 200px; height: 150px;margin-bottom:10px;"></el-image>
             
              <el-form-item label="课程名" :label-width="formLabelWidth" prop="title">
                <el-input v-model="form.title" autocomplete="off" :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="简介" :label-width="formLabelWidth" prop="content">
                <el-input v-model="form.content" autocomplete="off" :disabled="isQuery"></el-input>
              </el-form-item>

              <el-form-item label="讲师" :label-width="formLabelWidth" v-if="optFlag" prop="teacher">
                <el-select v-model="form.teacher" placeholder="请选择讲师" :disabled="isQuery">
                  <el-option v-for="item in teacherList"
                    :key="item.id"
                    :label="item.username"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="类型" :label-width="formLabelWidth" prop="type">
                <el-select v-model="form.type" placeholder="请选择类型" :disabled="isQuery">
                  <el-option v-for="item in typeList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="价格" :label-width="formLabelWidth" prop="price">
                <el-input v-model="form.price" autocomplete="off" :disabled="isQuery"></el-input>
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
              <el-form-item label="课程图片" v-if="!isQuery">
                <el-avatar shape="square" class="myImg" fit="scale-down" :size="100" :src="form.image" v-if="showImg"></el-avatar>
                <input class="upload-demo" multiple type="file" ref="file" id="uploadFile" @change="fileUpload($event)"/>
             </el-form-item>
           </el-form>

           <el-progress style="margin-top:5px;" :text-inside="true" :stroke-width="15" :percentage="fileUploadPercent" status="success" v-if="fileUploadPercent!==0 && !isQuery"></el-progress>

            <div slot="footer" class="dialog-footer">
              <el-button v-if="this.isEdit==true|| this.isAdd==true" @click="clearFormInfo()">重 置</el-button>
              <el-button v-if="this.isEdit==true" type="primary" @click="saveCourse('modify')">修 改</el-button>
              <el-button v-if="this.isAdd==true" type="primary" @click="saveCourse('add')">新 增</el-button>
            </div>
          </el-dialog>


  </div>

</template>
<script src="https://cdn.staticfile.org/axios/0.18.0/axios.min.js"></script>
<script>

export default {
  data () {
    return {
      isLoading: true, //是否正在加载
      imageSrc:'',
      optFlag:false,
      resubmit:false,
      showImg:false,
      currentUserRole:sessionStorage.getItem("currentUserRole"),
      currentUserID:sessionStorage.getItem("currentUserID"),
      token:sessionStorage.getItem('token'),
      msg: '课程列表',
      tableData: [],
      idList:[],
      statusList:[{"id":1,"name":"正常"},{"id":0,"name":"停用"}],
      teacherList:[],
      typeList:[],
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
          title: '',
          content: '',
          teacher: '',
          price: '',
          status: '',
          image: '',
          type:''
       },
      formLabelWidth: '100px',
      courseQuery:'',
      teacherQuery:'',
      statusQuery:'',
      typeQuery:'',
      fileUploadPercent:0,
      courseRules:{
          title:[{ required: true, message: '请填写标题', trigger: 'blur'}],
          content:[{ required: true, message: '请填写简介', trigger: 'blur'}],
          teacher:[{ required: true, message: '请选择教师', trigger: 'change' }],
          type:[{ required: true, message: '请选择类型', trigger: 'change' }],
          price:[{ required: true, message: '请填写价格', trigger: 'blur' }],
          status:[{ required: true, message: '请选择状态', trigger: 'change' }],
      }
    }
  },
  created()
  {
    if(this.currentUserRole==1)
    {
      this.optFlag=true;
    }
  },
  mounted () {
      this.initCourse();
  },
  methods: {
      format(percentage) {
        return percentage === 100 ? '满' : `${percentage}%`;
      },
      fileUpload(e) {
        let that=this;
        let post_url="api/admin/vedio/fileUpload";
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
            that.form.image=response.data;
            that.showImg=true;
               // sessionStorage.setItem('CourseImg',response.data);
        }).catch(function (reason) {
            this.$message.success("上传失败");
        })
      },
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
      delCourse(){   //批量删除
          let that=this;
          if(that.idList.length>0)
          {
              let url='api/admin/course/delete?idList='+that.idList.toString();
              if(confirm('确认删除？'))
              {
                  that.$axios.delete(url,{headers:{"Authorization":"Bearer "+this.token}})
                  .then((response)=>{
                      that.$message.success("删除成功");
                      that.initCourse();
                  })
                  .catch(function (error) { // 请求失败处理
                      that.$message.error(error);
                  });
              }
          }else{
            that.$message.error("请选择记录！");
          }
      },
      initCourse()  //初始化数据
      {
        let url='api/admin/course/query';
        let jsonDate={
            "pageSize":this.page.size,"pageNum":this.page.index,"title":this.courseQuery,
            "teacher":this.teacherQuery,"status":this.statusQuery,"type":this.typeQuery,
            "role":this.currentUserRole,"creater":this.currentUserID
        };

        this.$axios.post(url,jsonDate,{headers:{"Authorization":"Bearer "+this.token}})
        .then((response)=>{
          this.tableData=response.data.data.list;
          this.page.total=response.data.data.total;
          this.page.index=response.data.data.pageNum;
          this.loading=false;
        })
        .catch(function (error) { // 请求失败处理
          console.log(error);
        });

        //初始化教师列表
        this.$axios.get("api/admin/user/queryTeacher",{headers:{"Authorization":"Bearer "+this.token}})
        .then((response)=>{
          this.teacherList=response.data.data;
        })
        .catch(function (error) { // 请求失败处理
          console.log(error);
        });

        //初始化课程类型列表
        this.$axios.get("api/admin/course/type/queryAll",{headers:{"Authorization":"Bearer "+this.token}})
        .then((response)=>{
          this.typeList=response.data;
        })
        .catch(function (error) { // 请求失败处理
          console.log(error);
        });
      },
      //分页触发的方法
       currentChange(current){
            this.page.index=current;
            this.initCourse();
       },
       openEditOrQueryCourse(val,flag)
       {
          this.fileUploadPercent=0;
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
            let find_url='api/admin/course/query/'+val.toString();
            this.$axios.get(find_url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
              let mydata=response.data; 
              this.form.id=mydata.id;
              this.form.title=mydata.title;
              this.form.content=mydata.content;
              this.form.price=mydata.price;
              this.form.image=mydata.image;
              this.form.teacher=mydata.teacher;
              this.form.status=mydata.status;
              this.form.type=mydata.type;
            })
            .catch(function (error) { // 请求失败处理
              this.$message.error(error);
            });
          }
          
       },
       openAddCourse()
       {
            this.fileUploadPercent=0;
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
            this.form.title='';
            this.form.content='';
            this.form.teacher='';
            this.form.price='';
            this.form.status='';
            this.form.image='';
            this.form.type='';
          if (this.$refs['form'] != undefined) {
            this.$refs['form'].resetFields();
          }
       }, 
       clearQueryCondition(){
        this.courseQuery='';
        this.teacherQuery='';
        this.statusQuery='';
        this.typeQuery='';
        this.initCourse();
       },
       saveCourse(flag)
       {
         let that=this;
         that.$refs['form'].validate((valid) => {
            if (valid) {
              if(!that.resubmit)  //如果是第一次提及 放行
              {
                  that.resubmit=true;
                  that.dialogFormVisible = false;
                  if(that.currentUserRole==2)  //如果是教师操作的话 不需要选择，直接赋值自己
                  {
                    that.form.teacher=that.currentUserID;
                  }
                    if(flag=='add')
                    {
                      let add_url = 'api/admin/course/insert';
                      let postData = {
                        "title":that.form.title,"content":that.form.content,"teacher":that.form.teacher,
                        "price":that.form.price,"status":that.form.status,"image":that.form.image,"type":that.form.type,
                        "creater":that.currentUserID};
                       that.$axios.post(add_url,postData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                          that.$message.success("添加成功");
                          that.initCourse();
                       })
                      .catch(function (error) { // 请求失败处理
                          that.$message.error(error);
                      });
                    }
                    if(flag=='modify')
                    {
                      let modify_url = 'api/admin/course/modify';
                      let putData = { "id":that.form.id,"title":that.form.title,"content":that.form.content,"teacher":that.form.teacher,
                        "price":that.form.price,"status":that.form.status,"image":that.form.image,"type":that.form.type,
                        "updater":that.currentUserID};
                      that.$axios.put(modify_url,putData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                          that.$message.success("修改成功");
                          that.initCourse();
                       })
                      .catch(function (error) { // 请求失败处理
                          that.$message.error(error);
                      });
                    }
              }else{
                that.$message.error("请勿重复提交");
              }
            }else{
                return false;
            }
         });
       },
      changeStatus(id,status)
      {
        let putData = { "id":id,"status":status};
        let modify_url = 'api/admin/course/modify';
        this.$axios.put(modify_url,putData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
             this.initCourse();
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
  .myImg 
{border-style: solid;border-color: blue rgb(25%,35%,45%) #909090 red;}
</style>
