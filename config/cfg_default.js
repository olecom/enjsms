config = {
/* NOTE: this is not JSON just JavaScript
 *       idea is taken from github.com/louischatriot/mongo-edit
 */
    /* standard configuration of extjs+node-webkit application */

    log: 'log/',
    app:{
        modules:{// cfg things from 'app_modules'
        // order matters as in middlewares
            '?auth': null,// callback to auth modules in loader (implemented by `userman`)
            userman:{//#0: authentication and authorization (plus Chat)
                store: 'fs' // TODO: fs || db
               ,data: '/data/um' // store fs: chat logs
               ,rbac:{
                   can:{
                        'module.pingback': true
                       ,'module.enjsms': true
                    }
                   ,roles:{
                        'user.test':[
                            'module.enjsms'
                        ]
                    }
                   ,users:{
                        test:{
                            pass: '9d4e1e23bd5b727046a9e3b4b7db57bd8d6ee684',
                            roles: [ 'user.test' ],
                            name: 'test user'
                        }
                    }
                }
            }
            /* after auth anything can go in not particular order */
           ,enjsms: true// sms app dummy
           ,pingback: true
        }
    },
    lang: 'ru',// base localization, must be provided by any module as fallback
    extjs:{
        name: 'App',             // default
        appFolder: '.',          // default
        launch: null,            // default
        controllers: [ ],        // default
        load:{
            requireLaunch: [ ],  // components to require in `Applicaion.launch()`
            require: [ ],        // array of common 'Class.Names' App must require
                                 // to use some app modules without auth
            css: [ ]
        }
        /* removable / changable items */
       ,pathFile: 'extjs.txt'
       ,path: 'ext-4.2.1.883/'   // search extjs.txt or this above './'; 'extjs/' is for HTML
       ,fading: true             // visual effects for content appearance
       ,wait_events:{
            timeout: 7777777,    // 2.16 hours vs max on backend: (1 << 23) = 2.33
           defer: 77777          // minute and half
        }
    },
    backend:{
        file: 'app_main/app_back.js',
        ctl_port: 3008,
        job_port: 3007,
        sess_puzl: 'puzzle-word$54321X'
       ,init_timeout: 123
    }
}
