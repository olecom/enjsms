Ext.define('App.store.CRUD', {
    extend: 'Ext.data.Store',
    requires: [
        'App.proxy.CRUD'
    ],
    //url: required; is used to configure proxy

    constructor: function(cfg){
    var me = this

        if(!cfg.url) throw new Error('OOPS: `App.store.CRUD` has no `url` config')

        cfg = Ext.applyIf(cfg || { },
            {
                storeId: 'CRUD',
                //batchUpdateMode: 'complete',
                remoteSort: true,
                remoteFilter: true,
                remoteGroup: true
            }
        )

        cfg.proxy = Ext.apply(cfg.proxy || { },
            {
                type: 'crud',// apply this store proxy
                url: (App.cfg.backend.url || '') + cfg.url
            }
        )

        me.callParent([cfg])
    }
})
