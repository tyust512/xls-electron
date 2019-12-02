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
      <el-form :inline="true" style="width: 460px;">
        <el-form-item label="列名" label-width="100px" prop="name">
          <el-input v-model="columnName"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="beginToParse">开始解析</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <!-- 结果 -->
    <section class="blackboard">

    </section>
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

        columnName: '姓名',
        loading: null,
      }
    },
    computed: {
    },
    watch: {
    },
    created () {
      this.addListenerToMain()
      this.addListenerFinish()
      this.addListenerInconsistent()
    },
    methods: {
      addListenerToMain() {
        function callback(event, msgObj) {
          const {msg, type, needTip} = msgObj 

          if (needTip) {
            showTip(msg, type)
          }
        }

        this.receiveFromMain('main-message', callback)
        
      },
      // 不完全匹配时
      addListenerInconsistent() {
        const _this = this
        function callback(event, {result}) {
          showTip('次表数据不完全在主表中', 'error')
          _this.clearMountedEle()

          if (!result) {
            return
          }

          const mountedEle = document.querySelector('.blackboard')
          
          for (const path in result) {
            const div = document.createElement('div')
            const h4 = document.createElement('h4')

            div.style.cssText = 'margin-top: 30px;'
            h4.innerText = path

            const ol = document.createElement('ol')

            result[path].forEach(oneItem => {
              const li = document.createElement('li')
              li.innerText = oneItem
              ol.appendChild(li)
            })

            div.appendChild(h4)
            div.appendChild(ol)

            mountedEle.appendChild(div)
          }

          if (_this.loading) {
            _this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
              _this.loading.close()
            })
          }
        }

        this.receiveFromMain('inconsistent', callback)
      },
      // 表格解析完毕后进行展示, 
      addListenerFinish() {
        const _this = this
        function callback() {
          showTip('所有次表数据都在主表中存在', 'success')
          _this.clearMountedEle()

          if (_this.loading) {
            _this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
              _this.loading.close()
            })
          }
        }

        this.receiveFromMain('finish', callback)
      },
      // 清楚提示信息
      clearMountedEle() {
        const mountedEle = document.querySelector('.blackboard')
        mountedEle.innerHTML = ''
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
        const columnName = this.columnName
        let tip

        if (this.columnName === '') {
          tip = '请填写要对比的列名, 需要精确匹配'
        }
        if (otherFilePathList < 1) {
          tip = '请选择次Excel'
        }
        if (mainFilePathList.length < 1) {
          tip = '请选择主Excel'
        }

        if (tip !== undefined) {
          this.$message({
            message: tip,
            type: 'warning',
          })
          return
        }
        
        this.loading = this.$loading({
          lock: true,
          text: 'loading',
          spinner: 'el-icon-loading',
        })

        this.informMain('send-excels', {
          'mainExcels': mainFilePathList, 
          'otherExcels': otherFilePathList,
          columnName,
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

  .blackboard {
    margin-top: 100px;
    padding: 0 20px;
  }
</style>
