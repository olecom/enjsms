config = {
/* NOTE: this is not JSON just JavaScript
 *       idea is taken from github.com/louischatriot/mongo-edit
 */
    /* standard configuration of extjs+node-webkit application */

    log: 'log/',
    app:{
        modules:{// cfg things from 'app_modules'
        // order matters as in middlewares
            userman:{// authentication and authorization
                store: 'dummy' //dummy (internal ro default roles), json file, db
               ,data: '/data/um' // chat logs
            }
           ,enjsms: true
           ,pingback: true// execute JS in backend
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
            require: [ ],        // array of 'Class.Names' ExtJS must require
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
