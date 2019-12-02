const {ipcMain} = require('electron')
const Excel = require('exceljs')
const parallel = require('async/parallel')

let render

/**
 * 
 * @param {msg} msg
 * @param {type} type
 * @param {needTip} 是否需要弹框提示 
 */
function postMessageToRender({msg, type='error', needTip=false, ...otherParams}) {
  if (!render) {
    return
  }

  let messageName = 'main-message'
  if (otherParams.messageName) {
    messageName = otherParams.messageName
  }

  render.sender.send(messageName, {
    msg, type, needTip, ...otherParams,
  })
}

function addEventReadExcels () {
  ipcMain.on('send-excels', function(event, {mainExcels, otherExcels, ...otherParams}) {
    render = event
    const fileObj = {
      mainExcels, otherExcels,
    }
    const {columnName} = otherParams

    const actionList = []

    // 主 / 次表格, 开始查找的列的起始坐标
    const coordinateCache = {}

    // 主表数据
    const dataCache = {}

    for (let eventName in fileObj) {
      const filePathList = fileObj[eventName]
      filePathList.forEach(filePath => {
        actionList.push((callback) => {
          readExcel(filePath, eventName, callback)
        })
      })
    }

     // 处理完所有excel数据的promise后, 开始解析数据
    parallel(actionList,  (error) => {
      if (error) {
        postMessageToRender({
          msg: `解析出错: ${error.stack}`,
          needTip: true,
        }) 

        return 
      } else {
        postMessageToRender({
          msg: 'excel解析成功, 开始进行数据筛选',
          type: 'success',
          needTip: true,
        })
      }

      operateData(dataCache)
    })
    
    // 读取表格
    function readExcel (path, eventType, callback) {
      if (!path) {
        return
      }

      const workbook = new Excel.Workbook()

      return workbook.xlsx.readFile(path)
        .then(() => {
          try {
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
  
            callback(null, path)
              
            return true

          } catch (error) {
            postMessageToRender({
              msg: `解析${path}出现错误: ${error.stack}`,
              needTip: true,
            })
          }
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
      })

      return sheetObj.worksheet
    }

    // 保存所有excel, 查找数列的起始坐标
    function saveDataCoordinate(worksheet, eventType, path) {
      coordinateCache[eventType] = coordinateCache.eventType || {}

      const keyName = columnName
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
      dataCache[eventType] = dataCache[eventType] || {}

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
      const dobCol = worksheet.getColumn(x)

      dobCol.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
        if (rowNumber >= y) {
          dataCache[eventType][path].push(cell.value)
        }
      })
    }
  })
}

// 获取数据
function operateData(dataCache) {
  if (!dataCache || Object.keys(dataCache).length < 1) {
    postMessageToRender({
      msg: '程序错误, excel中没有解析到数据',
      needTip: true,
    })

    return 
  }

  const {mainExcels, otherExcels} = dataCache

  // 为了获取path, 单独对每一个数组进行遍历
  const result = {}
  Object.keys(otherExcels).forEach(path => {
    const mainAllList = concatAllArray(mainExcels)
    const missingList = findMissingItem(mainAllList, otherExcels[path])

    if (Array.isArray(missingList) && missingList.length > 0) {
      result[path] = missingList
    }
  })

  if (Object.keys(result).length === 0) {
    postMessageToRender({
      messageName: 'finish',
    })
  } else {
    postMessageToRender({
      messageName: 'inconsistent',
      result,
    })
  }

  // 收集所有数据为1个数组
  function concatAllArray(obj) {
    let arr = []
    Object.values(obj).forEach(oneArray => {
      arr = arr.concat(oneArray)
    })

    return arr
  }

  function findMissingItem(mainList, oneOtherList) {
    if (mainList.length < oneOtherList.length) {
      postMessageToRender({
        msg: '主表数据比次表数据少, 数据也许有问题',
        needTip: true,
      })

      return 
    }

    return oneOtherList.filter(otherVal => {
      if (mainList.includes(otherVal)) {
        return false
      } else {
        return true
      }
    })
  }

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
