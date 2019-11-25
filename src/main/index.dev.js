/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })

// Install `vue-devtools / devtron`
require('electron').app.on('ready', () => {
  const {default: installExtension, VUEJS_DEVTOOLS}  = require('electron-devtools-installer')
  installExtension(VUEJS_DEVTOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch(err => {
      console.log('Unable to install `vue-devtools`: \n', err)
    })

  require('devtron').install()
})

// Require `main` process to boot app
require('./index')