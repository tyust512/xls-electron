const {ipcMain} = require('electron')
const Excel = require('exceljs')
const series = require('async/series')

let render

function postMessageToRender({msg, type='error', needTip=false}) {
  if (!render) {
    return
  }

  render.sender.send('main-message', {
    msg, type, needTip,
  })
}

function addEventReadExcels () {
  ipcMain.on('send-excels', function(event, params) {
    render = event
    const actionList = []

    // 主 / 次表格, 开始查找的列的起始坐标
    const coordinateCache = {}

    // 主表数据
    const dataCache = {}

    for (let eventName in params) {
      const filePathList = params[eventName]
      filePathList.forEach(filePath => {
        actionList.push(() => readExcel(filePath, eventName))
      })
    }

     // 保存完所有对应的数据后, 开始搜集数据
    series(actionList, (...params) => {
      operateData(dataCache)

      // 获取数据
      function operateData(dataCache) {
        if (!dataCache || Object.keys(dataCache).length < 1) {
          postMessageToRender({
            msg: '程序错误, excel中没有解析到数据',
            needTip: true,
          })

          return 
        }
      }
    })
    
    // 读取表格
    function readExcel (path, eventType) {
      if (!path) {
        return
      }

      const workbook = new Excel.Workbook()

      return workbook.xlsx.readFile(path)
        .then(() => {
          // 1 读取表格1
          const worksheet = getFirstWorksheet(workbook)
          if (!worksheet) {
            postMessageToRender({
              msg: `${path}中不存在表格1, 跳过此excel解析`,
              needTip: true,
            })
            return
          }

          // 2 保存所有excel, 查找数列的起始坐标
          saveDataCoordinate(worksheet, eventType, path)

          // 3 保存列数据
          saveData(worksheet, eventType, path)

          return true
        })
    }

    function getFirstWorksheet(workbook) {
      const sheetObj = {}
      let index = 0

      workbook.eachSheet(function(worksheet, sheetId) {
        if (index === 0) {
          sheetObj.worksheet = worksheet
          sheetObj.id = sheetId
        }

        index++
      });

      return sheetObj.worksheet
    }

    // 保存所有excel, 查找数列的起始坐标
    function saveDataCoordinate(worksheet, eventType, path) {
      coordinateCache[eventType] = coordinateCache.eventType || {}

      const keyName = '电话'
      const coordinate = getCoordinateOfKeyName(keyName,  worksheet)
      if (coordinate.x === 0 && coordinate.y === 0) {
        postMessageToRender({
          msg: `${keyName}在excel${path}中不存在, 请确认拼写`,
          needTip: true,
        })

        coordinateCache[eventType][path] = null
        return
      } 
      coordinate.y++
      coordinateCache[eventType][path] = coordinate
    }

    // 获取标识header的坐标
    function getCoordinateOfKeyName (keyName, worksheet) {
      const coordinate = {
        x: 0,
        y: 0,
      }
      
      // 双层遍历行, 然后一行的列
      for (let rowIndex=0, rowLength=worksheet.rowCount; rowIndex < rowLength; rowIndex++) {
        const columnList = worksheet.getRow(rowIndex + 1).values

        for (let columnIndex=0, colLength=columnList.length; columnIndex < colLength; columnIndex++) {
          const oneColumn = columnList[columnIndex]
          if (oneColumn === undefined) {
            continue
          }
          if (oneColumn.includes(keyName)) {
            coordinate.x = columnIndex
            coordinate.y = rowIndex + 1
            break
          }
        }
      }

      return coordinate
    }

    //分别保存数据数据
    function saveData(worksheet, eventType, path) {
      dataCache[eventType] = dataCache.eventType || {}

      const path_coordinate = coordinateCache[eventType]

      if (!coordinateCache || Object.keys(coordinateCache).length < 1 || !path_coordinate[path]) {
        postMessageToRender({
          msg: `${path}中没有找到坐标路径`,
          needTip: true,
        })

        dataCache[eventType][path] = null
        return
      } 

      const {x, y} = path_coordinate[path]
      
      dataCache[eventType][path] = []
      const dobCol = worksheet.getColumn(y)

      dobCol.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
        if (rowNumber >= x) {
          dataCache[eventType][path].push(cell.value)
        }
      })
    }
  })
}

// 创建表格
function writeToExcel() {
  // 创建工作簿
  const workbook = new Excel.Workbook()
  workbook.addWorksheet('result-sheet')
  workbook.xlsx.writeFile('结果').then(() => {
    console.log('文件生成成功')
  })
}

// 初始化
function init () {
  addEventReadExcels()
}

// module.exports = init
export default init
