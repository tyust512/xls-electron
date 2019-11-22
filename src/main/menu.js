const {Menu} = require('electron')

function setMenu () {
  Menu.buildFromTemplate([
    {
      label: '龙猫'
    },
    {
      label: '小龙猫',
      submenu: [
        {
          lable: '想减肥'
        },
        {
          lable: '想变漂亮'
        }
      ]
    }

  ])
}

module.exports = setMenu
