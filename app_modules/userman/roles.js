var Can = require('./can.js')
var Roles = {// 'role': new Array(of `can`s)
    'developer.local': [ Can.backend ]// can do all from specified `can`
   ,'admin.local': [ 'App.view.desktop.BackendTools' ]// single true-permissions
   ,'developer': [ 'App.back.JS' ]
}

module.exports = Roles
