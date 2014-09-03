/*
 * Setup robust MongoDB connection using native driver
 */
(function mongoDB(module, process){

// module interface
var db, cfg = { url: null, options: null }
var colls_cache = { }// for collections which may have additional dynamic fields

// API for Mongodb access
var mongodb = {
    client: null,
    // methods
    connect: mongodb_connect
}

return module.exports = mongodb

function mongodb_connect(config, app_callback){
    /* Any data is being copied globally on every object (or node) of the system,
     * thus `_id`s on every side may collide with locally generated data.
     * So _id's are generated on Mongod's server side and play role only inside
     * local MongoDB internally
     *
     * * NOTE: fatal errors and/or crashes inside DB callbacks can not use
     * *       `res.json()` to report UI and that. Timeout will fire in UI
     * *        and `bufferMaxEntries: 0` here
     * */
    if(config){
        cfg.options = config.options ? config.options :{
            db:{
                forceServerObjectId: true
               ,bufferMaxEntries: 0//??? doesn't work
               ,journal: true
            }
           ,server: {
                auto_reconnect: true
               ,socketOptions:{
                    connectTimeoutMS: 512
                   ,socketTimeoutMS: 512
                }
            }
        }
        cfg.url = config.url && config.db_name?
                  config.url + config.db_name :
                  'mongodb://127.0.0.1:27027/supro_GLOB'
    }
    return require('mongodb').MongoClient.connect(cfg.url, cfg.options,
    function on_connect(err ,newdb){
        if(err){
            log('MongoClient.connect:', err)
            return setTimeout(
                function reconnect(){
                    mongodb_connect(config, app_callback)
                },
                4096
            )
        }
        if(!db && newdb){
            db = mongodb.client = newdb
        }
        db.on('error', function on_db_err(err){// see NOTE above
            db.status = ''
            log('db error: ', err.stack || err)
        })
        db.on('timeout', function on_db_timeout(conn){
            db.status = ''
            log('db timeout: ' + conn.host + ':' + conn.port)
        })
        db.on('close', function on_db_close(conn){
            db.status = ''
            log('db close: ' + conn.host + ':' + conn.port)
        })

        db.on('reconnect', function on_db_close(conn){
            db_admin()
        })

        // `collection` from the driver is not the only thing we need here
        // there can be other info stored inside this objects e.g. `meta`
        db.getCollection = function getCollection(name){// using cache
            if(!colls_cache[name]){// name is `collectionName`
                colls_cache[name] = db.collection(name)
            }
            return colls_cache[name]
        }
        db.ObjectId = require('mongodb').ObjectID

        return db_admin(app_callback)

        function db_admin(cb){
            return db.admin(function on_admin(aerr ,a){
                if(aerr){
                    log('db.admin():', aerr)
                    return setTimeout(on_connect ,4096)
                }
                return a.command({ buildInfo: 1 } ,function(e ,d){
                    if(e){
                        log('db.admin.command():', e)
                        return setTimeout(on_connect ,4096)
                    }
                    db.status = " MongoDB v" + d.documents[0]['version']
                    log('Connected to' + db.status)

                    return cb ? cb(null ,db) : null
                })
            })//cb admin
        }
    })
}//mongodb_connect

})(module, process)
