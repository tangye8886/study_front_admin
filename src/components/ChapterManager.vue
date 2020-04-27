<template>
  <div class="hello">
     
      <el-breadcrumb separator="/" style="margin-bottom:10px">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a>课程管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>章节列表</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row style="float:left;margin-left:10px;margin-bottom:10px;">
         <!-- 删除按钮-->
          <el-button type="danger" :disabled="false"
          @click="delChapter()"  icon="el-icon-delete" circle></el-button>
         <!-- 新增按钮-->
          <el-button type="success" :disabled="false"
                 @click="openAddChapter()"  icon="el-icon-plus" circle></el-button>
      </el-row>

        <div> 
            <span style='color:black'>内容: </span><el-input v-model="contentQuery" autocomplete="off" style="width:100px"></el-input>
            <el-select v-model="courseQuery" placeholder="请选择课程">
                  <el-option v-for="item in courseList"
                    :key="item.id"
                    :label="item.title"
                    :value="item.id">
                  </el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="initChapter()"></el-button>
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
              prop="courseDetail.title"
              width="250"
              label="所属课程">
            </el-table-column>
            <el-table-column
              prop="name"
              label="名称"
              width="250">
            </el-table-column>
            <el-table-column
              prop="content"
              label="内容"
              width="450">
            </el-table-column>
            <el-table-column
                label="操作">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" circle @click="openEditOrQueryChapter(scope.row.id,'edit')"></el-button> 
                    <el-button type="info" icon="el-icon-message" circle @click="openEditOrQueryChapter(scope.row.id,'query')"></el-button>
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
            <el-form :model="form" :rules="chapterRules" ref="form">
              <el-form-item label="id" :label-width="formLabelWidth" :hidden="true" v-if="isEdit==true">
                <el-input v-model="form.id"  :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="章节名" :label-width="formLabelWidth" prop="name">
                <el-input v-model="form.name" :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="内容" :label-width="formLabelWidth" prop="content">
                <el-input v-model="form.content" :disabled="isQuery"></el-input>
              </el-form-item>
             <el-form-item label="课程" :label-width="formLabelWidth" prop="course">
                <el-select v-model="form.course" placeholder="请选择课程" :disabled="isQuery">
                  <el-option v-for="item in courseList"
                    :key="item.id"
                    :label="item.title"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button v-if="this.isEdit==true|| this.isAdd==true" @click="clearFormInfo()">重 置</el-button>
              <el-button v-if="this.isEdit==true" type="primary" @click="saveChapter('modify')">修 改</el-button>
              <el-button v-if="this.isAdd==true" type="primary" @click="saveChapter('add')">新 增</el-button>
            </div>
          </el-dialog>

  </div>
</template>
<script src="https://cdn.staticfile.org/axios/0.18.0/axios.min.js"></script>
<script>

export default {
  data () {
    return {
      msg: '章节列表',
      resubmit:false,
      currentUserNo:sessionStorage.getItem('currentUserID'),
      currentUserRole:sessionStorage.getItem('currentUserRole'),
      token:sessionStorage.getItem('token'),
      tableData: [],
      idList:[],
      courseList:[],
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
          name: '',
          content: '',
          course: '',
          creater:'',
          creatime:''
       },
      formLabelWidth: '100px',
      contentQuery:'',
      courseQuery:'',
      chapterRules:{
          name:[{ required: true, message: '请填写名称', trigger: 'blur'}],
          content:[{ required: true, message: '请选择内容', trigger: 'blur'}],
          course:[{ required: true, message: '请选择课程', trigger: 'change' }]
      }
    }
  },
  mounted () {
      this.initChapter();
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
      delChapter(){   //批量删除
          let that=this;
          if(that.idList.length>0)
          {
              let url='api/admin/course/chapter/delete?idList='+that.idList.toString();
              if(confirm('确认删除？'))
              {
                  that.$axios.delete(url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                      that.$message.success("删除成功");
                      that.initChapter();
                  })
                  .catch(function (error) { // 请求失败处理
                      that.$message.error(error);
                  });
              }
          }else{
            alert('请选择记录！');
          }
      },
      initChapter()  //初始化数据
      {
        let that=this;
        let url='api/admin/course/chapter/query';
        let jsonDate={
            "pageSize":+that.page.size,"pageNum":that.page.index,
            "content":that.contentQuery,"course":that.courseQuery,
            "creater":that.currentUserNo,
            "role":that.currentUserRole
        };

        that.$axios.post(url,jsonDate,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
          that.tableData=response.data.data.list;
          that.page.total=response.data.data.total;
          that.page.index=response.data.data.pageNum;
        })
        .catch(function (error) { // 请求失败处理
          console.log(error);
        });
         //初始化 courseList
        let courseQueryJsonDate={
            "pageSize":50,"pageNum":1,"role":that.currentUserRole,"creater":that.currentUserNo
        };
        that.$axios.post('api/admin/course/query',courseQueryJsonDate,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
            that.courseList=response.data.data.list;
        })
        .catch(function (error) { // 请求失败处理
          console.log(error);
        });

      },
      //分页触发的方法
       currentChange(current){
            this.page.index=current;
            this.initChapter();
       },
       openEditOrQueryChapter(val,flag)
       {
          this.resubmit=false;
          this.dialogFormVisible = true;
          if(flag=='edit')
          {
            this.isQuery=false;
            this.isEdit=true;
            this.isAdd=false;
            this.mytitle='编辑章节信息';
          }
          if(flag=='query')
          {
            this.isQuery=true;
            this.isEdit=false;
            this.isAdd=false;
            this.mytitle='章节信息详情';
          }
          if(val!=null)
          {
            let find_url='api/admin/course/chapter/query/'+val.toString();
            this.$axios.get(find_url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
              let mydata=response.data.data;
              this.form.id=mydata.id;
              this.form.name=mydata.name;
              this.form.content=mydata.content;
              this.form.creatime=mydata.creatime;
              this.form.creater=mydata.creater;
              if(this.isQuery)
              {
                  this.form.course=mydata.courseDetail.title;
              }else
              this.form.course=mydata.course;
            })
            .catch(function (error) { // 请求失败处理
              this.$message.error(error);
            });
          }
          
       },
       openAddChapter()
       {
            this.dialogFormVisible = true;
            this.isQuery=false;
            this.isEdit=false;
            this.isAdd=true;
            this.mytitle='新增章节信息';
            this.resubmit=false;
            this.clearFormInfo();
       },
       clearFormInfo(){
          this.form.id='';
          this.form.name= '';
          this.form.content= '';
          this.form.course='';
          this.form.creater='';
          this.form.creatime='';
          if (this.$refs['form'] != undefined) {
            this.$refs['form'].resetFields();
          }
       }, 
       clearQueryCondition(){
        this.contentQuery='';
        this.courseQuery='';
        this.initChapter();
       },
       saveChapter(flag)
       {
          let that=this;
          that.$refs['form'].validate((valid) => {
            if (valid) {
              if(!that.resubmit)  //如果是第一次提及 放行
              {
                  that.resubmit=true;
                  that.dialogFormVisible = false;
                  if(flag=='add')
                  {
                    let add_url = 'api/admin/course/chapter/insert';
                    let postData = {"name":that.form.name,"content":that.form.content,"course":that.form.course,"creater":that.currentUserNo};
                    that.$axios.post(add_url,postData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                        that.$message.success("添加成功");
                        that.initChapter();
                    })
                    .catch(function (error) { // 请求失败处理
                        that.$message.error(error);
                    });
                  }
                  if(flag=='modify')
                  {
                    let modify_url = 'api/admin/course/chapter/modify';
                    let putData = { "id":that.form.id,"name":that.form.name,"content":that.form.content,"course":that.form.course};
                    this.$axios.put(modify_url,putData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                        that.$message.success("修改成功");
                        that.initChapter();
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
