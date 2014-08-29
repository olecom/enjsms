Ext.define('App.store.CRUD',{
    extend: Ext.data.Store,
    requires:[ 'App.model.BaseCRUD' ],
    //url: required; is used to configure proxy

    constructor: function(cfg){
    var me = this

        if(!cfg.url) throw new Error('OOPS: `App.store.CRUD` has no `url` config')

        cfg = Ext.applyIf(cfg || { },
            {
                storeId: 'supro_CRUD',
                model: App.model.BaseCRUD,//default dynamic field setup from db
                //batchUpdateMode: 'complete',
                remoteSort: true,
                remoteFilter: false,
                remoteGroup: true,
                listeners:{
                    metachange: function find_reconfigureGrids(store, metaData){
                    var p = store.proxy
                        // next data will go without init && meta && reconfig
                        p.url = p.url.slice(0, p.url.indexOf('+init'))
                        if(metaData.hasOwnProperty('edit')){
//TODO: if error, send diff of changes for conflict resolution, if any
                            // send back for concurrent write checks
                            p.extraParams.edit = metaData.edit
                        }
                    }
                }
            }
        )

        App.cfg.backend.url && (cfg.url = App.cfg.backend.url + cfg.url)
        cfg.proxy = Ext.apply(// apply this store proxy
            cfg.proxy || { },
            { type: 'crud', url: cfg.url }
        )
        delete cfg.url// is not needed in store
        me.callParent([cfg])
    }
})
