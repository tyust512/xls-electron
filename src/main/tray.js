const path = require('path')
const {Menu, Tray} = require('electron')

let tray = null

function setTray () {
  tray = new Tray(path.join(__dirname, '../../build/icons/icon.ico'))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '学习，加油',
      type: 'radio'
    },
    {
      label: '减肥，加油'
    }
  ])

  tray.setToolTip('this is an excel processor')
  tray.setContextMenu(contextMenu)
}

module.exports = setTray
