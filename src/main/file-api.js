const {ipcMain} = require('electron')
// const path = require('path')

function addEventDragStart () {
  ipcMain.on('ondragstart', (event, filePath) => {
    event.sender.startDrag({
      file: filePath,
      icon: '../../build/icons/256x256.png'
    })
  })
}

module.exports = addEventDragStart
