<template>
  <div id="wrapper">
    <!-- <SystemInformation></SystemInformation> -->

    <ul>
      <li v-for="file in files" :key="file">
        {{file.name}} - Error: {{file.error}}, Success: {{file.success}}
      </li>
    </ul>
    <file-upload
      ref="upload"
      v-model="files"
      post-action="/post.method"
      put-action="/put.method"
      @input-file="inputFile"
      @input-filter="inputFilter"
    >
    上传文件
    </file-upload>
    <button v-show="!$refs.upload || !$refs.upload.active" @click.prevent="$refs.upload.active = true" type="button">开始上传</button>
    <button v-show="$refs.upload && $refs.upload.active" @click.prevent="$refs.upload.active = false" type="button">停止上传</button>
  </div>
</template>

<script>
  export default {
    name: 'landing-page',
    data: function () {
      return {
        files: []
      }
    },
    methods: {
      /**
       * Has changed
       * @param  Object|undefined   newFile   只读
       * @param  Object|undefined   oldFile   只读
       * @return undefined
       */
      inputFile: function (newFile, oldFile) {
        if (newFile && oldFile && !newFile.active && oldFile.active) {
          // 获得相应数据
          console.log('response', newFile.response)
          if (newFile.xhr) {
            //  获得响应状态码
            console.log('status', newFile.xhr.status)
          }
        }
      },
      /**
       * Pretreatment
       * @param  Object|undefined   newFile   读写
       * @param  Object|undefined   oldFile   只读
       * @param  Function           prevent   阻止回调
       * @return undefined
       */
      inputFilter: function (newFile, oldFile, prevent) {
        if (newFile && !oldFile) {
          // 过滤不是图片后缀的文件
          if (!/\.(jpeg|jpe|jpg|gif|png|webp)$/i.test(newFile.name)) {
            return prevent()
          }
        }

        // 创建 blob 字段 用于图片预览
        newFile.blob = ''
        let URL = window.URL || window.webkitURL
        if (URL && URL.createObjectURL) {
          newFile.blob = URL.createObjectURL(newFile.file)
        }
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    width: 100vw;
    height: 100vh;
    padding: 60px 80px;
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
  }

</style>
