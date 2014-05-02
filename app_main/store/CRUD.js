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
                remoteSort: true,
                remoteFilter: true,
                remoteGroup: true
            }
        )

        cfg.proxy = Ext.apply(cfg.proxy || { },
            {
                type: 'crud',
                url: (App.cfg.backend.url || '') + cfg.url
            }
        )

        Ext.applyIf(cfg.proxy,
            {// this proxy defaults
                idParam: '_id'// mongodb's
               ,startParam: undefined
               ,pageParam: undefined
               ,limitParam: undefined
            }
        )

        me.callParent([cfg])
    }
})
