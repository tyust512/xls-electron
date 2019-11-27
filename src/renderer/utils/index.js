import Vue from 'vue'

const $vue = new Vue()

export function showTip(msg='', type='error') {
  if (!['error', 'success'].includes(type)) {
    type = 'success'
  }

  $vue.$notify({
    title: type === 'error' ? '错误' : '成功',
    message: msg,
    type,
  })
}