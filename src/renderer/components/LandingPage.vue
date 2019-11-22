<template>
  <div class="wrapper">
    <el-upload
      class="upload-block"
      drag
      :limit="1"
      accept=".xls, .xlsx, .xlsm"
      action="https://jsonplaceholder.typicode.com/posts/"
      :auto-upload="false"
      :on-change="mainChangeHandler"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将主Excel拖到此处，或<em>点击上传</em></div>
      <div class="el-upload__tip" slot="tip">支持1个Excel</div>
    </el-upload>

    <el-upload
      class="upload-block"
      drag
      accept=".xls, .xlsx, .xlsm"
      action="https://jsonplaceholder.typicode.com/posts/"
      multiple
      :auto-upload="false"
      :on-change="otherChangeHandler"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将次Excel拖到此处，或<em>点击上传</em></div>
      <div class="el-upload__tip" slot="tip">支持多个Excel</div>
    </el-upload>
  </div>
</template>

<script>
  export default {
    name: 'landing-page',
    data () {
      return {
        mailFileList: [],
        otherFileList: []
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      init () {
      },
      mainChangeHandler (file, fileList) { this.mailFileList = fileList },
      otherChangeHandler (file, fileList) { this.otherFileList = fileList },
      filterRepeatedFile (fileList) {
        if (!fileList || (Array.isArray(fileList) && fileList.length === 0)) return

        fileList.array.forEach(file => {
  
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .wrapper {
    padding: 20px;
    display: flex;
    justify-content: space-around;

    .upload-block {}
  }
</style>
