config = {
/* NOTE: this is not JSON just JavaScript
 *       idea is taken from github.com/louischatriot/mongo-edit
 */
    gsm_modules: [
        {
            //name
            //addr:
        }
    ],

    /* standard configuration of extjs+node-webkit application */

    dev: 'enjsms',// developring this component
    log: 'log/',
    app: {
        db: { mongodb:1 ,nedb:0 }, // github.com/louischatriot/nedb
        modules: {// cfg things from 'app_modules'
            procman: {
                // default: cfg_procman.js in own directory
                config: 'config/cfg_procman_mongo_node_sms.js'
                ,autoSpawn: true
            }
            ,usersman: {
                store: 'dummy' //dummy (internal ro default roles), json file, db
            }
        }
    },
    extjs: {
        name: 'App',             // default
        appFolder: '.',          // default
        launch: null             // default

        /* custom ExtJS applicaiton config...
         * models: ['', ''],
         * stores: ['', '', ''],
         * controllers: ['', '']
         */
    },
    backend: {
        nodeGUI: {
            active: true,
            file: 'app_main/app_back.js'
        }
        ,express:0
    },
    mongodb: {
         host: 'localhost'
        ,port: 27017
        ,journal: true
        ,dbname: 'test'
        ,dbpath: 'data/db'
        ,dbprefix: ''
    }
}
