/*
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
    // mongo console methods
   //,getCollection: null
}

//var globm ,globi ,objm ,obji ,colls_cache = { }, objs_cache = { }

return module.exports = mongodb

function mongodb_connect(config, app_callback){
    /* Any data is being copied globally on every object (or node) of the system,
     * thus `_id`s on every side may collide with locally generated data.
     * So _id's are generated on Mongod's server side and play role only inside
     * local MongoDB internally
     * */
    if(config){
        cfg.options = config.options ? config.options :{
            db:{
                forceServerObjectId: true
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
    return require('mongodb').MongoClient.connect(cfg.url, cfg.options, function on_connect(err ,newdb){
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
        db.on('error', function on_db_err(err){
            log('db error: ', err.stack || err)
            /*
             * NOTE: fatal errors and/or crashes inside DB callbacks can not use
             *       `res.json()` to report UI and that. Timeout will fire in UI
             */
        })
        db.on('timeout', function on_db_timeout(conn){
            log('db timeout: ' + conn.host + ':' + conn.port)
        })
        db.on('close', function on_db_close(conn){
            log('db close: ' + conn.host + ':' + conn.port)
        })

        return db.admin(
        function on_admin(aerr ,a){
            if(aerr){
                log('db.admin():', aerr)
                return setTimeout(on_connect ,4096)
            }
            return a.command({ buildInfo: 1 } ,function(e ,d){
                if(e){
                    log('db.admin.command():', e)
                    return setTimeout(on_connect ,4096)
                }
                // collection from the driver is not the only thing we need here
                // there can be other info stored inside this objects e.g. `meta`
                db.getCollection = function getCollection(name){// using cache
                    if(!colls_cache[name]){// name is `collectionName`
                        colls_cache[name] = db.collection(name)
                    }
                    return colls_cache[name]
                }
                db.ObjectId = require('mongodb').ObjectID

                e = " MongoDB v" + d.documents[0]['version']
                return app_callback(null ,e, db)
            })
        })//cb admin
    })
}//mongodb_connect

/*
function _edb(m, e) { log('DB ERR ' + m, e) }

function init_collections(e ,cb){
    if(e) return cb(e)

    return ''

    globi = db.getCollection(GLOB + '_items')
    globm = db.getCollection(GLOB + '_moves')

    return init_trans_objects(null ,init_trans_objects_cb)

    function init_trans_objects_cb(e){
        if(e) return cb(e)
        return init_moves(globm ,init_moves_globm_cb)
    }
    function init_moves_globm_cb(e){
_log('trans trans_objects: ' + inspect(trans_objects,true,8))
_log('GLOB moves && items init')
        if(e){ _err('ERROR init_moves(globm): ' + inspect(e)) ; return cb(e) }
        return init_items(globi ,GLOB == process.env.SUPRO_OBJ ,init_items_globi_cb)
    }
    function init_items_globi_cb(e){
        if(e){ _err('FATAL ERROR init_items(globi): ' + inspect(e)) ; return cb(e) }
        return db.getCollection('dictObject').find(null).toArray(cache_objs_cb)
    }
    function cache_objs_cb(e ,objects){
        if(e){ _err('FATAL ERROR dictObject.find(): ' + inspect(e)) ; return cb(e) }
        for(e in objects) if(objects[e].id)
            objs_cache[objects[e].id] = objects[e]
_log('OBJs cached')
        e = process.env.SUPRO_OBJ
        if (GLOB == e) return cb()

        objm = db.getCollection(e + '_moves')
        obji = db.getCollection(e + '_items')
        return init_moves(objm ,function(e){
            if(e){ _err('FATAL ERROR init objm: ' + inspect(e)) ; return cb(e) }
            return init_items(obji ,true ,function obj_co_init_done(e){
                if(e){ _err('FATAL ERROR init obji: ' + inspect(e)) ; return cb(e) }
_log('OBJ init: ' + objm.collectionName + ' ' + obji.collectionName)
                return cb()// or app_start()
            })
        })
    }
}


function init_items(co ,pos ,cb){
/* check first time and create or just get a document with cart counter
> db.GLOB_items.find({ carts: { $exists:1 } })
{ "carts" : [ ], "_id" : ObjectId("5112e247f990c40000000001") }
>
    co: collection name -- GLOB (handled differently) or any other object + "_items"
    cb(error): call back
* /
    var fsid = { carts: { $exists: true } }

    co.find(fsid).toArray(get_or_set_items_reg_doc)
    return// nothing - no sync error

    function get_or_set_items_reg_doc(e, arr){
        if(e) return cb(_edb('OBJ_items.find(carts): ' + inspect(e)))
        if(arr.length > 1) return cb(_edb('id_cart dups: ' + arr.length))
        if(arr.length) return co.findAndModify(fsid ,[] ,{ $set: { carts: [] } }
        ,function(e ,d){
            if(e || !d) return cb(_edb('i.findAndModify(): ',e))
            if (d.carts.length) _log('old carts discarded: ' + inspect(d.carts.splice(0)))
            co.carts = d
            co.carts.get_id = d.carts.length
            co.init = 1
_log('updating existing doc: `items.carts` "' + co.collectionName + '" carts:' + inspect(co.carts))
            return cb()
        })
        /* first run and setup; doc is saved anyways for POS or not * /
        //delete fsid.carts	//if(pos)
        fsid.carts = []// setup: Point Of Sale
        return co.insert(fsid ,index_new_items_collection)// id_cart = carts.length
    }

    function index_new_items_collection(e){
        if(e) return cb(_edb('OBJ_items.save(carts): ',e))
        return co.findOne({ carts: { $exists: true }} ,function(e, d){
            if(e) return cb(_edb('OBJ_items.findOne(carts): ',e))
            co.carts = d ,co.carts.get_id = 0
        return co.ensureIndex( { id_mpcode: 1 } ,{ unique: true } ,function(e){
            if(e) return cb(_edb('OBJ_items.ensureIndex(u id_mpcode): ',e))
        return co.ensureIndex({ id_in: 1 } ,{ unique: false } ,function(e){
            if(e) return cb(_edb('OBJ_items.ensureIndex(id_in): ' + inspect(e)))
        return co.ensureIndex({ id_mfg: 1 } ,{ unique: false } ,function(e){
            if(e) return cb(_edb('OBJ_items.ensureIndex(id_mfg): ' + inspect(e)))
        return co.ensureIndex({ total_qty: 1 } ,{ unique: false } ,function(e){
            if(e) return cb(_edb('OBJ_items.ensureIndex(total_qty): ' + inspect(e)))
            co.init++
_log('indexing items and save new doc `items`:' + inspect(co,false,1))
        return cb()
        })})})})})
    }
}// init_items

function init_moves(co ,cb){
/* moves counter -- `m_id` is last (id_move + 1) * /
    co.findOne({ id_move: 0 } ,get_or_set_moves_reg_doc)

    return// nothing - no sync error
    function get_or_set_moves_reg_doc(e ,zmove){
        if(e) return cb(_edb('find moves.m_id: ',e))
        if(zmove){
            co.meta = zmove
            return co.findOne(null ,{ id_move: 1 } ,{ sort: { id_move: -1 } }
            ,function(e ,last_move){
                if(e) return cb(_edb('co.findOne(id_move): ' + inspect(e)))
                co.m_id = 1 + last_move.id_move
_log('updating existing doc: `co.m_id`' + inspect(co.m_id) + '\n last move:' + inspect(last_move) )
                return cb()
            })
        }
        /* first run and setup of the meta document * /
        var meta = { id_move: 0 ,op: "META" ,incs: { incq: 0 ,selq: 0 } }
        return co.insert(meta ,function(e ,d){
_log('saved meta: ' + inspect(d))
            if(e) return cb(_edb('OBJ_moves.save(id_move): ' + inspect(e)))
            co.meta = d[0]
            co.m_id = 1
            return co.ensureIndex({ id_move: -1 } ,{ unique: true } ,function(e){
                if(e) return cb(_edb('OBJ_moves.ensureIndex(u id_move): ' + inspect(e)))
            return co.ensureIndex({ op: 1 } ,{ unique: false } ,function(e){
                if(e) return cb(_edb('OBJ_moves.ensureIndex(op): ' + inspect(e)))
            return co.ensureIndex({ da: -1 } ,{ unique: false } ,function(e){
                if(e) return cb(_edb('OBJ_moves.ensureIndex(date): ' + inspect(e)))
_log('saved new doc and indexed moves: ' + inspect(co,false,1))
            return cb()
        })})})})
    }
}// init_moves


/* TODO transport later
function init_trans_objects(e, cb){
/ * register objects for information transport from GLOB-to-all && from all-to-GLOB * /
    if(e) return cb(e)
    trans_objects = { }
    trans_objects_count = 0
    if(GLOB != process.env.SUPRO_OBJ){
        trans_objects[GLOB] = process.env.DATAEXT ,trans_objects_count++
        return cb()// all-to-GLOB
    }
    return db.getCollection("dictObject")// GLOB-to-all
             .find({ remote: { $exists: true }} ,{ id:1 ,_id:0 }).toArray(
/ *{
  n: 2
, id: "S1"
, name: "Gippo"
, remote: true
, desc: "description"
, "retail_price": "4UP"
, "_id": new ObjectID("516df143986ef6c0ab000009")
}* /
    function trans_objects_list(e ,objs){
_log('trans objs: ' + inspect(objs))
        if(e){ _err('FATAL ERROR DB dictObject.find()') ; return cb(e) }
        for(e in objs)
            trans_objects[objs[e].id] = '.' + objs[e].id + '.' + GLOB ,trans_objects_count++
        return cb()// sync step
    })
}*/

})(module, process)
