export const messageMixins =  {
  data() {
    return {
      ipcRenderer: this.$electron.ipcRenderer,
    }
  },

  methods: {
    // 通知主线程
    informMain (eventName, params) {
      if (!this.$electron) return
      
      this.ipcRenderer.send(eventName, params)
    },
    // 从主线程接受消息
    receiveFromMain (eventName, callback) {
      if (!this.$electron) {
        return 
      }
      this.ipcRenderer.on(eventName, (event, arg) => {
        callback(event, arg)
      })
    },
  },
}
