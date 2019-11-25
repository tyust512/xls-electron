const fs = require('fs')
const {ipcMain} = require('electron')
const Excel = require('exceljs')

// 创建工作簿
const workbook = new Excel.Workbook()

// 读取表格
function readExcel (path) {
  workbook.xlsx.readFile(path).then(() => {
    const worksheet = workbook.getWorksheet(1)
    worksheet.eachRow((row, rowNum) => {
      const rowSize = row.cellCount
      const numValues = row.actualCellCount
    })
  })
}

// 创建表格
function writeToExcel() {
  const workbook = new Excel.Workbook()
  workbook.addWorksheet('result-sheet')
  workbook.xlsx.writeFile('结果').then(() => {
    console.log('文件生成成功')
  })

  // const writerStream = fs.createWriteStream('ouput.txt')
  // writerStream.on('finish', () => console.log('-----------finish write--------'))
  // writerStream.on('error', (error) => console.log(`-----------write error--------${error.stack}`))
  // const data = '123'
  // writerStream.write(data, 'UTF8')
  // writerStream.end()

}

function addEventReadExcels () {
  const events = ['send-excels-main', 'send-excels-others']
  events.forEach(eventName => {
    ipcMain.on(eventName, (event, filePathList) => {
      if (Array.isArray(filePathList)) {
        filePathList.forEach(filePath => {
          readExcel(filePath)
        })
      }
    })
  })
}

function init () {
  addEventReadExcels()
}

module.exports = init
