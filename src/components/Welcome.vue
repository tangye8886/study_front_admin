<template>
  <div class="hello">
        <h1 style="color:skyblue;">尊敬的{{currentUserName}},欢迎来到云学堂后台管理系统</h1>
  </div>
</template>

<script>

export default {
  data () {
    return {
      currentUserName:sessionStorage.getItem('currentUserName')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
