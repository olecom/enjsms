Ext.define('App.store.CRUD', {
    extend: 'Ext.data.Store',
    requires: [
        'App.proxy.CRUD'
    ],
    url: null,

    constructor: function(cfg){
    var me = this

        cfg = Ext.apply(
            {
                storeId: 'CRUD',
                remoteSort: true,
                remoteFilter: true,
                remoteGroup: true
            }
            ,cfg || { }
        )
        cfg.url && (cfg.proxy = {
            type: 'crud',
            url: (App.cfg.backend.url || '') + cfg.url
        })
        me.callParent([cfg])
    }
})
