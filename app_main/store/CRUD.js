Ext.define('App.store.CRUD',{
    extend: Ext.data.Store,
    requires:[
        'App.model.BaseCRUD',
        'App.proxy.CRUD'
    ],
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
                    metachange: function find_reconfigureGrids(store, meta){
                    var url = store.proxy.url

console.log('reconfig grids')
                        Ext.each(Ext.ComponentQuery.query(
                            'so_gridOrderItems[itemId="' + store.storeId +'"]'),
                            function(grid){
                                grid.reconfigure(null, meta.columns)
                            }
                        )
                        // next data will go without init && meta && reconfig
                        store.proxy.url = url.slice(0, url.indexOf('!init'))
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
