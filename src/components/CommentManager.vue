<template>
  <div class="hello">
     
      <el-breadcrumb separator="/" style="margin-bottom:10px">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a>课程管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>评论列表</el-breadcrumb-item>
        <span>{{currentUserRole}}</span>
      </el-breadcrumb>

      <el-row style="float:left;margin-left:10px;margin-bottom:10px;">
         <!-- 删除按钮-->
          <el-button type="danger" :disabled="!optFlag"
          @click="delComment()"  icon="el-icon-delete" circle></el-button>
         <!-- 新增按钮-->
          <el-button type="success" :disabled="!optFlag"
                 @click="openAddComment()"  icon="el-icon-plus" circle></el-button>
      </el-row>
        <div v-if="optFlag"> 
            <span style='color:black'>内容: </span><el-input v-model="contentQuery" autocomplete="off" style="width:100px"></el-input>
            
            <el-select v-model="statusQuery" placeholder="请选择状态">
                  <el-option v-for="item in statusList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
             </el-select>
            <el-button slot="append" icon="el-icon-search" @click="initComment()"></el-button>
            <el-button slot="append" icon="el-icon-refresh" @click="clearQueryCondition()"></el-button>
        </div>
      <el-divider v-if="optFlag"><i class="el-icon-caret-bottom"></i></el-divider>
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
              prop="courseDetail.title"
              label="课程"
              width="200">
            </el-table-column>
            <el-table-column
              prop="userDetail.username"
              label="评论者"
              width="100">
            </el-table-column>
             <el-table-column
              prop="parentComment"
              :show-overflow-tooltip="true"
              label="上级评论"
              width="210">
              <template slot-scope="scope">
                {{scope.row.parentComment? scope.row.parentComment.content: '此评论为一级评论'}}
              </template>
            </el-table-column>
            <el-table-column
              prop="content"
              :show-overflow-tooltip="true"
              width="210"
              label="评论内容">
            </el-table-column>
            <el-table-column
              prop="creatime"
              label="评论时间"
              width="200">
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
                    <el-button type="primary" icon="el-icon-edit" circle @click="openEditOrQueryComment(scope.row.id,'edit')" :disabled="!optFlag"></el-button> 
                    <el-button type="info" icon="el-icon-info" circle @click="openEditOrQueryComment(scope.row.id,'query')"></el-button>
                    <el-button type="info" icon="el-icon-message" circle @click="openReplyWindow(scope.row.id,scope.row.pid)"></el-button>
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
            <el-form :model="form" :rules="commentRules" ref="form">
              <el-form-item label="课程" :label-width="formLabelWidth" prop="pid">
                <el-select v-model="form.pid" placeholder="请选择课程" :disabled="isQuery">
                  <el-option v-for="item in courseList"
                    :key="item.id"
                    :label="item.title"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="评论内容" :label-width="formLabelWidth" prop="content">
                <el-input v-model="form.content" :disabled="isQuery"></el-input>
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
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button v-if="this.isEdit==true|| this.isAdd==true" @click="clearFormInfo()">重 置</el-button>
              <el-button v-if="this.isEdit==true" type="primary" @click="saveComment('modify')">修 改</el-button>
              <el-button v-if="this.isAdd==true" type="primary" @click="saveComment('add')">新 增</el-button>
            </div>
          </el-dialog>


          <!-- 评论回复弹出框-->
           <el-dialog title="请输入回复内容" :visible.sync="dialogFormVisible2">
            <el-form :model="form">
              
              <el-form-item label="回复内容" :label-width="formLabelWidth">
                <el-input v-model="replyForm.content" autocomplete="off" type="textarea"></el-input>
              </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="dialogFormVisible2 = false">取 消</el-button>
              <el-button @click="submitReply()">发 布</el-button>
            </div>
          </el-dialog>

  </div>
</template>
<script src="https://cdn.staticfile.org/axios/0.18.0/axios.min.js"></script>
<script>

export default {
  data () {
    return {
      msg: '评论列表',
      optFlag:false,
      resubmit:false,
      currentUserNo:sessionStorage.getItem('currentUserID'),
      currentUserRole:sessionStorage.getItem('currentUserRole'),
      token:sessionStorage.getItem('token'),
      tableData: [],
      idList:[],
      courseList:[],
      statusList:[{"id":1,"name":"正常"},{"id":0,"name":"停用"}],
      page:{
          size:7,
          total:0,
          index:1,
          flag:true,
      },
      mytitle:'编辑评论信息',
      isQuery: true,  //默认是查询操作
      isEdit:false,
      isAdd:false,
      dialogVisible: false,
      dialogFormVisible: false,
      dialogFormVisible2:false,
      mymsg:'',
      searchContent: '',
      form: {
          id:'',
          pid: '',
          content: '',
          user: '',
          status: '',
          parent:'',
          root:''
       },
      formLabelWidth: '100px',
      contentQuery:'',
      userQuery:'',
      statusQuery:'',
      replyForm:{  //回复评论
        parent:'',
        pid: '',
        content: ''
      },
      commentRules:{
        content:[{ required: true, message: '请填写评价内容', trigger: 'blur'}],
        pid:[{ required: true, message: '请选择评价课程', trigger: 'change'}],
        status:[{ required: true, message: '请选择评价状态', trigger: 'change' }]
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
      this.initComment();
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
      delComment(){   //批量删除
          let that=this;
          if(that.idList.length>0)
          {
              let url='api/admin/course/comment/delete?idList='+that.idList.toString();
              if(confirm('确认删除？'))
              {
                  that.$axios.delete(url,{headers:{"Authorization":"Bearer "+this.token}})
                  .then((response)=>{
                      that.$message.success("删除成功");
                      that.initComment();
                  })
                  .catch(function (error) { // 请求失败处理
                      that.$message.error(error);
                  });
              }
          }else{
            alert('请选择记录！');
          }
      },
      initComment()  //初始化数据
      {
        let that=this;
        let url='api/admin/course/comment/query';
        let jsonDate={
            "pageSize":that.page.size,"pageNum":that.page.index,"content":that.contentQuery,"status":that.statusQuery,
            "creater":that.currentUserNo,"role":that.currentUserRole
        };
        that.$axios.post(url,jsonDate,{headers:{"Authorization":"Bearer "+this.token}})
        .then((response)=>{
          that.tableData=response.data.data.list;
          that.page.total=response.data.data.total;
          that.page.index=response.data.data.pageNum;
          this.loading=false;
        })
        .catch(function (error) { // 请求失败处理
          console.log(error);
        });

        //初始化 courseList
        that.$axios.get("api/admin/course/queryCourse",{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
            that.courseList=response.data.data;
        })
        .catch(function (error) { // 请求失败处理
          console.log(error);
        });

      },
      //分页触发的方法
       currentChange(current){
            this.page.index=current;
            this.initComment();
       },
       openEditOrQueryComment(val,flag)
       {
          let that=this;
          this.dialogFormVisible = true;
          this.resubmit=false;
          if(flag=='edit')
          {
            this.isQuery=false;
            this.isEdit=true;
            this.isAdd=false;
            this.mytitle='编辑评论';
          }
          if(flag=='query')
          {
            this.isQuery=true;
            this.isEdit=false;
            this.isAdd=false;
            this.mytitle='评论信息';
          }
          if(val!=null)
          {
            let find_url='api/admin/course/comment/query/'+val.toString();
            this.$axios.get(find_url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
              let mydata=response.data.data; 
              that.form.id=mydata.id;
              that.form.pid=mydata.pid;
              that.form.user=mydata.user;
              that.form.content=mydata.content;
              that.form.status=mydata.status;
            })
            .catch(function (error) { // 请求失败处理
              this.$message.error(error);
            });
          }
          
       },
       openAddComment()
       {
            this.dialogFormVisible = true;
            this.isQuery=false;
            this.isEdit=false;
            this.isAdd=true;
            this.mytitle='新增评论';
            this.resubmit=false;
            this.clearFormInfo();
       },
       clearFormInfo(){
            this.form.id='';
            this.form.pid='';
            this.form.user='';
            this.form.content='';
            this.form.status='';
          if (this.$refs['form'] != undefined) {
            this.$refs['form'].resetFields();
          }
       }, 
       clearQueryCondition(){
          this.contentQuery='';
          this.statusQuery='';
          this.initComment();
       },
       saveComment(flag)
       {
         this.$refs['form'].validate((valid) => {
            if (valid) {
              if(!this.resubmit)  //如果是第一次提及 放行
              {
                  this.resubmit=true;
                  this.dialogFormVisible = false;
                  if(flag=='add')
                  {
                    let add_url = 'api/admin/course/comment/insert';
                    let postData = {
                      "pid":this.form.pid,"user":this.currentUserNo,"content":this.form.content,"status":this.form.status,"creater":this.currentUserNo,"root":1};
                    this.$axios.post(add_url,postData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                        this.$message.success("添加成功");
                        this.initComment();
                     })
                    .catch(function (error) { // 请求失败处理
                      this.$message.error(error);
                    });
                  }
                  if(flag=='modify')
                  {
                    let modify_url = 'api/admin/course/comment/modify';
                    let putData = { "id":this.form.id,"pid":this.form.pid,"user":this.form.user,"content":this.form.content,"status":this.form.status,"updater":this.currentUserNo};
                    this.$axios.put(modify_url,putData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                        this.$message.success("修改成功");
                        this.initComment();
                     })
                    .catch(function (error) { // 请求失败处理
                      this.$message.error(error);
                    });
                  }
              }else{
                this.$message.error("请勿重复提交");
              }
            }else{
                return false;
            }
         });
          
       },
       openReplyWindow(id,pid){
         this.dialogFormVisible2=true;
         this.replyForm.parent=id;  //赋值为将要新增的父ID
         this.replyForm.pid=pid;
       },
       submitReply(){
         let url = 'api/admin/course/comment/insert';
         let putData = { "pid":this.replyForm.pid,"user":this.currentUserNo,"content":this.replyForm.content,
                        "status":1,"creater":this.currentUserNo,"parent":this.replyForm.parent,"root":0};
         this.$axios.post(url,putData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
            this.$message.success("回复成功");
             this.initComment();
         })
         this.dialogFormVisible2=false;
       },
       changeStatus(id,status)
      {
        let putData = { "id":id,"status":status};
        let modify_url = 'api/admin/course/comment/modify';
        this.$axios.put(modify_url,putData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
             this.initComment();
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
