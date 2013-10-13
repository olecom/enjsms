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
    app: {
        db: { mongodb:1 ,nedb:0 }, // github.com/louischatriot/nedb
        modules: [ 'procman' ] // things from 'app_modules'
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
    backend: { nw:1 ,express:0 },
    mongodb: {
         host: 'localhost'
        ,port: 27017
        ,journal: true
        ,dbname: 'test'
        ,dbpath: 'data/db'
        ,dbprefix: ''
    }
}
