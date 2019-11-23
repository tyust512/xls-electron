const path = require('path')
const {ipcMain} = require('electron')
const Excel = require('exceljs')

// 读取表格
function readExcel (path) {
  // 创建工作簿
  const workbook = new Excel.Workbook()
  workbook.xlsx.readFile(path)
    .then((...params) => {
      console.dir(params)
    })
}

function addEventReadExcels () {
  ipcMain.on('read-excels', (event, files) => {
    if (Array.isArray(files)) {
      files.forEach(file => {
        const {url} = file
        readExcel(url)
      })
    }
  })
}

function init () {
  addEventReadExcels()
}

module.exports = init
