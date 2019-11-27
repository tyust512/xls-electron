<template>
  <div>
    <article class="wrapper">
      <el-upload
        class="upload-block"
        drag
        :limit="1"
        accept=".xlsx"
        action="https://jsonplaceholder.typicode.com/posts/"
        :auto-upload="false"
        :on-change="mainChangeHandler"
        :on-remove="mainChangeHandler"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将主Excel拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">支持1个xlsx格式的Excel</div>
      </el-upload>

      <el-upload
        class="upload-block"
        drag
        accept=".xlsx"
        action="https://jsonplaceholder.typicode.com/posts/"
        multiple
        :auto-upload="false"
        :on-change="otherChangeHandler"
        :on-remove="otherChangeHandler"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将次Excel拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">支持多个xlsx格式的Excel</div>
      </el-upload>
    </article>

    <!-- 开始解析 -->
    <el-row type="flex" justify="center" style="margin-top: 100px;">
      <el-button type="primary" @click="beginToParse">开始解析</el-button>
    </el-row>
  </div>
</template>

<script>
  import {messageMixins} from '../mixins/index'
  import {showTip} from '../utils/index'

  export default {
    name: 'main-index',
    mixins: [messageMixins],
    data () {
      return {
        mainFileObj: {},
        otherFileObj: {},
        mainFilePathList: [],
        otherFilePathList: [],
      }
    },
    computed: {
    },
    watch: {
    },
    created () {
      this.addListenerToMain()
    },
    methods: {
      async addListenerToMain() {
        this.receiveFromMain('main-message', function callback(event, result) {
          const {msg, type, needTip} = result 
  
          if (needTip) {
            showTip(msg, type)
          }
        })
      },
      mainChangeHandler (file, fileList) {
        this.mainFileObj = this.transferToObj(fileList)
        this.mainFilePathList = Object.keys(this.mainFileObj)
      },
      otherChangeHandler (file, fileList) {
        this.otherFileObj = this.transferToObj(fileList)
        this.otherFilePathList = Object.keys(this.otherFileObj)
      },
      // 把数组文件list转变成key-value的对象, 方便去重
      transferToObj (fileList) {
        const objSaveTo = {}
        if (!fileList || (Array.isArray(fileList) && fileList.length === 0)) {
          return objSaveTo
        }
        // 每次都重置, 再保存进去
        fileList.forEach(file => {
          const {path} = file.raw

          if (!objSaveTo[path]) {
            objSaveTo[path] = file
          }
        })

        return objSaveTo
      },

      beginToParse () {
        const mainFilePathList = this.mainFilePathList
        const otherFilePathList = this.otherFilePathList
        let tip
        if (mainFilePathList.length < 1) {
          tip = '请选择主Excel'
        }
        if (otherFilePathList < 1) {
          tip = '请选择次Excel'
        }
        if (tip !== undefined) {
          this.$message({
            message: tip,
            type: 'warning',
          })
          return
        }
        
        this.informMain('send-excels', {
          'mainExcels': mainFilePathList, 
          'otherExcels': otherFilePathList,
        })
      },

    },
  }
</script>

<style lang="scss" scoped>
  .wrapper {
    padding: 20px;
    display: flex;
    justify-content: space-around;
  }
</style>
