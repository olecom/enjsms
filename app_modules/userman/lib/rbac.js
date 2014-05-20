/*
 * Auth* provider and manager
 **/
module.exports = rbac

function rbac(api){
var rbac_api = { can: null, roles: null, users: null, mw: mwRBAC }
   ,fs = require('fs') ,dir

    default_access()

    qs = require('connect/node_modules/qs')
    dir = process.cwd() + api.cfg.app.modules.userman.data + '/rbac'

    fs.stat(dir,
        function stat_um_data_rbac_dir(err, d){
            if(err){
                require('mkdirp').mkdirp(dir,
                    function mkdirp_um_data_rbac_dir(err){
                        if(err) throw(err)
                        //load_api()
                    }
                )
                return
            }
            if(!d.isDirectory()){
                throw new Error('Is not a directory: ' + dir)
            }
            //load_api()// init api
        }
    )

    return rbac_api

    function default_access(){
        rbac_api.can = {
            backend:{
                'App.view.desktop.BackendTools': true
               ,'App.backend.JS': true
            }
           ,Static: { }// deny access to Class or other files by `initAuthStatic()`
        }
        rbac_api.roles = {// 'role': new Array(of `can`s)
            'developer.local':[
                rbac_api.can.backend// can do all from specified `can`
               ,'App.view.Window.tools.refresh'// developer's stuff
            ]
           ,'admin.local': [ 'App.view.desktop.BackendTools' ]// single true-permissions
           ,'developer': [ 'App.backend.JS' ]
        }
        rbac_api.users = {
            devka:{
                id: 'devka',
                // require('crypto').createHash('sha1').update(pass).digest('hex')
                pass: '9d4e1e23bd5b727046a9e3b4b7db57bd8d6ee684',
                roles: [ 'developer.local', 'admin.local' ],
                name:'default login'
            }
        }
    }

    function mwRBAC(req, res, next){
    var ret = { success: false, data: null }
        res.json(ret)
    }
}
