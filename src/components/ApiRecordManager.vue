<template>
  <div class="hello">
     
      <el-breadcrumb separator="/" style="margin-bottom:10px">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a>日志管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>接口调用日志</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row style="float:left;margin-left:10px;margin-bottom:10px;">
         <!-- 删除按钮-->
          <el-button type="danger" :disabled="false"
          @click="delApi()"  icon="el-icon-delete" circle></el-button>
      </el-row>
      
      <!--表单-->
      <template>
          <el-table
          v-loading="loading"
          element-loading-text="Loading..."
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(255,255,255,0.8)"
            :data="tableData"
            style="width: 100%"
            @selection-change="handleSelectionChange" >
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column
              prop="api"
              width="150"
              label="api">
            </el-table-column>
            <el-table-column
              prop="address"
              label="地址"
              width="150">
            </el-table-column>
            <el-table-column
              prop="method"
              label="请求方式"
              width="100">
            </el-table-column>
            <el-table-column
              prop="port"
              label="端口"
              width="100">
            </el-table-column>
            <el-table-column
              prop="url"
              label="路径"
              :show-overflow-tooltip="true"
              width="250">
            </el-table-column>
            <el-table-column
              prop="time"
              label="请求时间"
              width="200">
            </el-table-column>
            <el-table-column
              prop="info"
              :show-overflow-tooltip="true"
              label="详情"
              width="110">
            </el-table-column>
            <el-table-column
                label="操作">
                <template slot-scope="scope">
                    <el-button type="info" icon="el-icon-message" circle @click="queryApiInfo(scope.row.id)"></el-button>
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


        <!-- 信息详情框-->
          <el-dialog title="接口信息" :visible.sync="dialogVisible">
            <el-form :model="form">
              <el-form-item label="api" :label-width="formLabelWidth" >
                <el-input v-model="form.api" :disabled="true"></el-input>
              </el-form-item>
              <el-form-item label="方式" :label-width="formLabelWidth" >
                <el-input v-model="form.method" :disabled="true"></el-input>
              </el-form-item>
              <el-form-item label="地址" :label-width="formLabelWidth" >
                <el-input v-model="form.address" :disabled="true"></el-input>
              </el-form-item>
              <el-form-item label="端口" :label-width="formLabelWidth" >
                <el-input v-model="form.port" :disabled="true"></el-input>
              </el-form-item>
              <el-form-item label="路径" :label-width="formLabelWidth">
                <el-input v-model="form.url" :disabled="true"></el-input>
              </el-form-item>
              <el-form-item label="时间" :label-width="formLabelWidth">
                <el-input v-model="form.time" :disabled="true"></el-input>
              </el-form-item>
              <el-form-item label="详情" :label-width="formLabelWidth">
                <el-input v-model="form.info" :disabled="true"></el-input>
              </el-form-item>
            </el-form>
          </el-dialog>

  </div>
</template>
<script src="https://cdn.staticfile.org/axios/0.18.0/axios.min.js"></script>
<script>

export default {
  data () {
    return {
      loading:true,
      msg: '接口调用记录',
      resubmit:false,
      currentUserNo:sessionStorage.getItem('currentUserID'),
      currentUserRole:sessionStorage.getItem('currentUserRole'),
      token:sessionStorage.getItem('token'),
      tableData: [],
      idList:[],
      page:{
          size:8,
          total:0,
          index:1
      },
      dialogVisible: false,
      form: {
          id:'',
          api: '',
          method: '',
          address: '',
          port:'',
          url:'',
          time:'',
          info:''
       },
      formLabelWidth: '100px'
    }
  },
  mounted () {
      this.initApi();
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
      delApi(){   //批量删除
          let that=this;
          if(this.idList.length>0)
          {
              let url='api/admin/course/chapter/delete?idList='+that.idList.toString();
              if(confirm('确认删除？'))
              {
                  that.$axios.delete(url,{headers:{"Authorization":"Bearer "+this.token}})
                  .then((response)=>{
                     that.$message.success("删除成功");
                     that.initApi();
                  });
              }
          }else{
            that.$message.error("请选择记录！");
          }
      },
      initApi()  //初始化数据
      {
        let url='api/admin/log/query';
        let jsonDate={
            "pageSize":+this.page.size,"pageNum":this.page.index
        };
        this.$axios.post(url,jsonDate,{headers:{"Authorization":"Bearer "+this.token}})
        .then((response)=>{
          this.tableData=response.data.data.list;
          this.page.total=response.data.data.total;
          this.page.index=response.data.data.pageNum;
          this.loading=false;
        });
      },
      //分页触发的方法
      currentChange(current){
            this.page.index=current;
            this.initApi();
      },
      queryApiInfo(id)
      {
        let url='api/admin/log/query/'+id;
         this.$axios.get(url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
            this.form.api=response.data.data.api;
            this.form.method=response.data.data.method;
            this.form.address=response.data.data.address;
            this.form.port=response.data.data.port;
            this.form.url=response.data.data.url;
            this.form.time=response.data.data.time;
            this.form.info=response.data.data.info;
        });
        this.dialogVisible=true;
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
