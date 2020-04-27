<template>
  <div class="hello">
 
      <el-breadcrumb separator="/" style="margin-bottom:10px">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a>订单管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row style="float:left;margin-left:10px;margin-bottom:10px;">
         <!-- 删除按钮-->
          <el-button type="danger" :disabled="false"
          @click="delOrder()"  icon="el-icon-delete" circle></el-button>
         <!-- 新增按钮-->
          <el-button type="success" :disabled="false"
                 @click="addOrder()"  icon="el-icon-plus" circle></el-button>
      </el-row>

     
        <div> 
            <span style='color:black'>订单号: </span><el-input v-model="orderIDQuery" autocomplete="off" style="width:130px"></el-input>
            <el-select v-model="payStatusQuery" placeholder="请选择支付状态">
                  <el-option v-for="item in payStatusList"
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
            <el-button slot="append" icon="el-icon-search" @click="initOrder()"></el-button>
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
              label="订单号"
              width="180">
            </el-table-column>
             <el-table-column
              prop="person"
              label="收件人"
              width="160">
            </el-table-column>
            <el-table-column
              prop="phone"
              label="联系方式"
              width="150">
            </el-table-column>
            <el-table-column
              prop="address"
              width="220"
              label="地址">
            </el-table-column>
            <el-table-column
              prop="count"
              label="数量"
              width="50">
            </el-table-column>
            <el-table-column
              prop="price"
              label="金额"
              width="100">
            </el-table-column>
            <el-table-column
              prop="paystatus"
              label="支付状态"
              width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.paystatus == 1 ? 'success' : 'danger' " disable-transitions>{{scope.row.paystatus==1?'已支付':'未支付'}}</el-tag>
              </template>
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
                    <el-button type="primary" icon="el-icon-edit" circle @click="editOrQueryOrder(scope.row.id,'edit')"></el-button> 
                    <el-button type="info" icon="el-icon-message" circle @click="editOrQueryOrder(scope.row.id,'query')"></el-button>
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
            <el-form :model="form" :rules="orderRules" ref="form">
              <el-image  v-if="isQuery==true" :src="form.image" style="width: 200px; height: 150px;margin-bottom:10px;"></el-image>
              <el-form-item label="课程名称" :label-width="formLabelWidth" v-if="isQuery==true">
                <el-input v-model="form.title" :disabled="isQuery"></el-input>
              </el-form-item>
               <el-form-item label="用户" :label-width="formLabelWidth" v-if="isQuery==true">
                <el-input v-model="form.username" :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="收件人" :label-width="formLabelWidth">
                <el-input v-model="form.person"  :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="联系方式" :label-width="formLabelWidth">
                <el-input v-model="form.phone"  :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="地址" :label-width="formLabelWidth">
                <el-input v-model="form.address"  :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="数量" :label-width="formLabelWidth" prop="count">
                <el-input v-model="form.count"  :disabled="isQuery"></el-input>
              </el-form-item>
              <el-form-item label="金额" :label-width="formLabelWidth" v-if="isAdd==false">
                <el-input v-model="form.price"  :disabled="isQuery"></el-input>
              </el-form-item>
               <el-form-item label="支付状态" :label-width="formLabelWidth"  prop="paystatus">
                <el-select v-model="form.paystatus" placeholder="请选择支付状态" :disabled="isQuery">
                  <el-option v-for="item in payStatusList"
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
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button v-if="this.isEdit==true|| this.isAdd==true" @click="clearFormInfo()">重 置</el-button>
              <el-button v-if="this.isEdit==true" type="primary" @click="saveOrder('modify')">修 改</el-button>
              <el-button v-if="this.isAdd==true" type="primary" @click="saveOrder('add')">新 增</el-button>
            </div>
          </el-dialog>

  </div>
</template>
<script src="https://cdn.staticfile.org/axios/0.18.0/axios.min.js"></script>
<script>

export default {
  data () {
    return {
      msg: '订单管理',
      currentUserNo:sessionStorage.getItem('currentUserID'),
      currentUserRole:sessionStorage.getItem('currentUserRole'),
      token:sessionStorage.getItem('token'),
      resubmit:false,
      tableData: [],
      idList:[],
      statusList:[{"id":1,"name":"正常"},{"id":0,"name":"停用"}],
      payStatusList:[{"id":1,"name":"已支付"},{"id":0,"name":"未支付"}],
      page:{
          size:7,
          total:0,
          index:1,
          flag:true,
      },
      mytitle:'编辑订单信息',
      isQuery: true,  //默认是查询操作
      isEdit:false,
      isAdd:false,
      dialogVisible: false,
      dialogFormVisible: false,
      mymsg:'',
      searchContent: '',
      form: {
          id:'',
          uid: '',
          cid: '',
          address: '',
          phone: '',
          person: '',
          count: '',
          price: '',
          status: '',
          paystatus: '',
          title:'',
          image:'',
          username:''
        },
      formLabelWidth: '100px',
      orderIDQuery:'',
      payStatusQuery:'',
      statusQuery:'',
      orderRules:{
          paystatus:[{ required: true, message: '请选择支付状态', trigger: 'change' }],
          count:[{ required: true, message: '请填写数量', trigger: 'blur' }],
          status:[{ required: true, message: '请选择状态', trigger: 'change' }]
      },
    }
  },
  mounted () {
      this.initOrder();
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
      delOrder(){   //批量删除
          let that=this;
          if(that.idList.length>0)
          {
              let url='api/admin/order/delete?idList='+that.idList.toString();
              if(confirm('确认删除？'))
              {
                  that.$axios.delete(url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
                      that.$message.success("删除成功");
                      that.initOrder();
                  })
                  .catch(function (error) { // 请求失败处理
                      that.$message.error(error);
                  });
              }
          }else{
            alert('请选择记录！');
          }
      },
      initOrder()  //初始化数据
      {
         let url='api/admin/order/query';
         let jsonDate={
            "pageSize":this.page.size,
            "pageNum":this.page.index,
            "orderID":this.orderIDQuery,
            "payStatus":this.payStatusQuery,
            "status":this.statusQuery,
            "uid":this.currentUserNo,
            "role":this.currentUserRole
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
            this.initOrder();
       },
       editOrQueryOrder(val,flag)
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
            this.mytitle="订单信息详情";
          }
          if(val!=null)
          {
            let find_url='api/admin/order/query/'+val.toString();
            this.$axios.get(find_url,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
              let mydata=response.data.data;
              this.form.id=mydata.id;
              this.form.person=mydata.person;
              this.form.phone=mydata.phone;
              this.form.address=mydata.address;
              this.form.count=mydata.count;
              this.form.price=mydata.price;
              this.form.status=mydata.status;
              this.form.paystatus=mydata.paystatus;
              this.form.image=mydata.detailCourse.image,
              this.form.title=mydata.detailCourse.title,
              this.form.username=mydata.detailUser.username
            })
            .catch(function (error) { // 请求失败处理
              this.$message.error(error);
            });
          }
          
       },
       addOrder()
       {
            this.dialogFormVisible = true;
            this.isQuery=false;
            this.isEdit=false;
            this.isAdd=true;
            this.mytitle='新增订单信息';
            this.resubmit=false;
            this.clearFormInfo();
       },
       clearFormInfo(){
            this.form.id='';
            this.form.uid='';
            this.form.cid='';
            this.form.person='';
            this.form.phone='';
            this.form.address='';
            this.form.count='';
            this.form.price='';
            this.form.status='';
            this.form.paystatus='';
            this.resetForm();
       }, 
       clearQueryCondition(){
          this.orderIDQuery='';
          this.payStatusQuery='';
          this.statusQuery='';
          this.initOrder();
       },
       saveOrder(flag)
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
                    let add_url = 'api/admin/order/insert';
                    let postData = {
                      "person":that.form.person,"phone":that.form.phone,"address":that.form.address,
                      "count":that.form.count,"price":that.form.price,"status":that.form.status,"paystatus":that.form.paystatus};
                     that.$axios.post(add_url,postData,{headers:{"Authorization":"Bearer "+that.token}}).then((response)=>{
                      that.$message.success("添加成功");
                      that.initOrder();
                     })
                    .catch(function (error) { // 请求失败处理
                        that.$message.error(error);
                    });
                  }
                  if(flag=='modify')
                  {
                    let modify_url = 'api/admin/order/modify';
                    let putData = { "id":that.form.id,
                      "person":that.form.person,"phone":that.form.phone,"address":that.form.address,
                      "count":that.form.count,"price":that.form.price,"status":that.form.status,"paystatus":that.form.paystatus};
                    that.$axios.put(modify_url,putData,{headers:{"Authorization":"Bearer "+that.token}}).then((response)=>{
                        that.$message.success("修改成功");
                        that.initOrder();
                     })
                    .catch(function (error) { // 请求失败处理
                        that.$message.error(error);
                    });
                  }
            }
            else{
              that.$message.error("请勿重复提交");
            }
          }
          else {
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
        let modify_url = 'api/admin/order/modify';
        this.$axios.put(modify_url,putData,{headers:{"Authorization":"Bearer "+this.token}}).then((response)=>{
             this.initOrder();
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
