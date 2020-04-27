<template>
  <div class="hello">

       <el-breadcrumb separator="/" style="margin-bottom:10px">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a>视频管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>视频列表</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row style="float:left;margin-left:10px;margin-bottom:10px;">
         <!-- 删除按钮-->
          <el-button type="danger" :disabled="false"
          @click="delVedio()"  icon="el-icon-delete" circle></el-button>
         <!-- 新增按钮-->
          <el-button type="success" :disabled="false"
                 @click="openAddVedio()"  icon="el-icon-plus" circle></el-button>
      </el-row>

      
        <div> 
            <span style='color:black'>标题: </span><el-input v-model="titleQuery" autocomplete="off" style="width:100px"></el-input>
            <el-button slot="append" icon="el-icon-search" @click="initVedio()"></el-button>
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
              prop="title"
              label="标题"
              width="300">
            </el-table-column>
            <el-table-column
              prop="chapterDetail.content"
              label="章节"
              width="300">
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="src"
              label="路径"
              width="380">
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
                    <el-button type="primary" icon="el-icon-edit" circle @click="openEditOrQueryVedio(scope.row.id,'edit')"></el-button> 
                    <el-button type="info" icon="el-icon-message" circle @click="openEditOrQueryVedio(scope.row.id,'query')"></el-button>
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
            <el-form :model="form" :rules="vedioRules" ref="form">
       
              <el-form-item label="标题" :label-width="formLabelWidth" prop="title">
                <el-input v-model="form.title" :disabled="isQuery"></el-input>
              </el-form-item>

              <el-form-item label="章节" :label-width="formLabelWidth" prop="chapter">
                <el-cascader v-model="form.chapter" :options="options" :show-all-levels="false" :disabled="isQuery"></el-cascader>
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

            <el-form-item label="视频文件" :label-width="formLabelWidth" v-if="!isQuery">
              <input multiple type="file" ref="file" id="uploadFile" @change="fileUpload($event)" v-if="!isQuery" />
             </el-form-item>

            </el-form>
            <el-progress style="margin-top:5px;" :text-inside="true" :stroke-width="15" :percentage="fileUploadPercent" status="success" v-if="fileUploadPercent!==0 && !isQuery"></el-progress>
            <div slot="footer" class="dialog-footer">
              <el-button v-if="this.isEdit==true|| this.isAdd==true" @click="resetForm()">重 置</el-button>
              <el-button v-if="this.isEdit==true" type="primary" @click="saveVedio('modify')">修 改</el-button>
              <el-button v-if="this.isAdd==true" type="primary" @click="saveVedio('add')">新 增</el-button>
            </div>
          </el-dialog>

  </div>
</template>
<script src="https://cdn.staticfile.org/axios/0.18.0/axios.min.js"></script>
<script>

export default {
  data () {
    return {
      options: [],
      resubmit:false,
      currentUserNo:sessionStorage.getItem('currentUserID'),
      currentUserRole:sessionStorage.getItem('currentUserRole'),
      token:sessionStorage.getItem('token'),
      msg: '视频管理',
      tableData: [],
      idList:[],
      statusList:[{"id":1,"name":"正常"},{"id":0,"name":"停用"}],
      chapterList:[],
      page:{
          size:7,
          total:0,
          index:1,
          flag:true,
      },
      mytitle:'编辑视频信息',
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
          chapter: '',
          src: '',
          time: '',
          status: '',
          image: '',
          creater:''
       },
      formLabelWidth: '100px',
      titleQuery:'',
      fileUploadPercent:0,
      vedioRules:{
          title:[{ required: true, message: '请填写标题', trigger: 'blur'}],
          chapter:[{ required: true, message: '请选择章节', trigger: 'change'}],
          status:[{ required: true, message: '请选择状态', trigger: 'change' }]
        }
    }
  },
  mounted () {
      this.initVedio();
  },
  methods: {
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
                console.log(response.data);
                that.form.src=response.data;
            }).catch(function (reason) {
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
      delVedio(){   //批量删除
          let that=this;
          if(that.idList.length>0)
          {
              let url='api/admin/vedio/delete?idList='+that.idList.toString();
              if(confirm('确认删除？'))
              {
                  that.$axios.delete(url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                      that.$message.success("删除成功");
                      that.initVedio();
                  })
                  .catch(function (error) { // 请求失败处理
                      that.$message.error(error);
                  });
              }
          }else{
            alert('请选择记录！');
          }
      },
      initVedio()  //初始化数据
      {
        let url='api/admin/vedio/query';
        let jsonDate={
            "pageSize":+this.page.size,"pageNum":this.page.index,"title":this.titleQuery,"isBack":"1",
            "creater":this.currentUserNo,"role":this.currentUserRole
        };

        //初始化列表数据
        this.$axios.post(url,jsonDate,{headers:{"Authorization":"Bearer "+this.token}})
        .then((response)=>{
          this.tableData=response.data.data.list;
          this.page.total=response.data.data.total;
          this.page.index=response.data.data.pageNum;
        })
        .catch(function (error) { // 请求失败处理
          console.log(error);
        });

        //初始化章节
        this.$axios.get("api/admin/course/chapter/queryChapter",{headers:{"Authorization":"Bearer "+this.token}})
        .then((response)=>{
            this.chapterList=response.data.data;
        })
        .catch(function (error) { // 请求失败处理
          console.log(error);
        });

        //初始化级联下拉列表
        let jsonDateCourse={
            "role":this.currentUserRole,"creater":this.currentUserNo
        };
        this.$axios.post("api/admin/vedio/queryJLByCourse",jsonDateCourse,{headers:{"Authorization":"Bearer "+this.token}})
        .then((response)=>{
            this.options=response.data;
        });
        
      },
      //分页触发的方法
       currentChange(current){
            this.page.index=current;
            this.initVedio();
       },
       openEditOrQueryVedio(val,flag)
       {
          this.resubmit=false;
          this.dialogFormVisible = true;
          if(flag=='edit')
          {
            this.isQuery=false;
            this.isEdit=true;
            this.isAdd=false;
            this.mytitle='编辑视频';
          }
          if(flag=='query')
          {
            this.isQuery=true;
            this.isEdit=false;
            this.isAdd=false;
            this.mytitle='视频信息';
          }
          if(val!=null)
          {
            let find_url='api/admin/vedio/query/'+val.toString();
            this.$axios.get(find_url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
              let mydata=response.data.data; 
              this.form.id=mydata.id;
              this.form.title=mydata.title;
              this.form.src=mydata.src;
              this.form.chapter=mydata.chapter;
              this.form.image=mydata.image;
              this.form.time=mydata.time;
              this.form.status=mydata.status;
              this.form.creater=mydata.creater;
            })
            .catch(function (error) { // 请求失败处理
              this.$message.error(error);
            });
          }
          
       },
       openAddVedio()
       {
            this.dialogFormVisible = true;
            this.isQuery=false;
            this.isEdit=false;
            this.isAdd=true;
            this.mytitle='新增视频';
            this.resubmit=false;
            this.clearFormInfo();
       },
       clearFormInfo(){
            this.form.id='';
            this.form.title='';
            this.form.chapter='';
            this.form.time='';
            this.form.src='';
            this.form.status='';
            this.form.image='';
            this.form.creater='';
            this.resubmit=false;
            this.fileUploadPercent=0;
            this.resetForm();
       }, 
       clearQueryCondition(){
        this.titleQuery='';
        this.initVedio();
       },
       saveVedio(flag)
       {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if(!this.resubmit)  //如果是第一次提及 放行
            {
              this.resubmit=true;
              this.dialogFormVisible = false;
              if(flag=='add')
              {
                let add_url = 'api/admin/vedio/insert';
                let postData = {
                  "title":this.form.title,"chapter":this.form.chapter[1],"status":this.form.status,"src":this.form.src,
                  "creater":this.currentUserNo};
                this.$axios.post(add_url,postData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                    this.$message.success("添加成功");
                    this.initVedio();
                 })
                .catch(function (error) { // 请求失败处理
                  this.$message.error(error);
                });
              }
              if(flag=='modify')
              {
                let modify_url = 'api/admin/vedio/modify';
                let putData = { "id":this.form.id,"title":this.form.title,"chapter":this.form.chapter[1],"status":this.form.status,
                "src":this.form.src,"updater":this.currentUserNo};
                this.$axios.put(modify_url,putData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                    this.$message.success("修改成功");
                    this.initVedio();
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
      resetForm() {
         if (this.$refs['form'] != undefined) {
            this.$refs['form'].resetFields();
         }
      },
      changeStatus(id,status)
      {
        let putData = { "id":id,"status":status};
        let modify_url = 'api/admin/vedio/modify';
        this.$axios.put(modify_url,putData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
             this.initVedio();
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
  .video{
    width: 600px;
    height: 300px;
  }
</style>
