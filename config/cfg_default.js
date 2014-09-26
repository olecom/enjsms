config = {
/* NOTE: this is not JSON just JavaScript
 *       idea is taken from github.com/louischatriot/mongo-edit
 */
    /* standard configuration of extjs+node[.js -webkit] application */

    lang: 'ru',// base localization, must be provided by any module as fallback
    log: 'log/',
    modules:{// cfg for stack of things from 'app_modules'
    // order matters as in middlewares
    // auth module overwrites default and sets up per-user auth module loading
        userman:{//#0: authentication and authorization (plus Chat)
            store: 'fs' // TODO: fs || db
            //sess_maxage: //null: browser lifetime; default: ~9.3 hours one working day
           ,sess_puzl: 'puzzle-word$54321X'
           ,data: '/data/um'// store fs: chat logs
           ,rbac:{
               can:{// list of permissions with arbitrary positive value
                    'module.pingback': true//FIXME: add modules to can while loading
                   ,'module.enjsms': true
                }
               ,roles:{
                    'user.test':[
                        // select valid in `can` permissions for role
                        'module.enjsms'
                        // this are being added in `can` by `userman` module
                       ,'App.um.controller.Chat','App.um.view.Chat','/um/chat'
                    ]
                }
               ,users:{
                    'utest':{
                        pass: '9d4e1e23bd5b727046a9e3b4b7db57bd8d6ee684',
                        roles:[ 'user.test' ],
                        name: 'Test User'
                    }
                }
            },
            extjs:{
                waitEvents:{
                    timeout: 7777777,// 2.16 hours vs max on backend: (1 << 23) = 2.33
                    defer: 77777// if error on minute and half
                }
            }
        }
       /* after auth anything can go in no particular order */
       ,enjsms: true
       ,pingback: true
    },
    extjs:{
        path: 'ext-4.2.1.883/',// find and provide this path; 'extjs/' is for web
        launch:  null,/*{ css:[ ], js:[ ]} loaded by `extjs_launch()` */
        modules: null,/*{ css:[ ], js:[ ]} */
        fading:  true// visual effects for content appearance
    },
    backend:{
        file: 'app_main/app_back.js',
        ctl_port: 3008,
        job_port: 3007,
        init_timeout: 123
       ,extjs:{
            pathFile: 'extjs.txt'// search this file (extjs.txt)
       }
       ,mongodb:{//'mongodb://' + process.env.MONGODS + process.env.MONGO_DBNAME
            url: 'mongodb://127.0.0.1:27027/'
           ,db_name: 'supro_GLOB'
           ,options:{// you know what you are doing here!
               bufferMaxEntries: 0,
               forceServerObjectId: true,
               journal: true
            }
        }
    }
}
