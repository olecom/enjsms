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
                url: (App.cfg.backend.url || '') + cfg.url,
                listeners:{
                    exception: crud_exception
                }
            }
        )

        me.callParent([cfg])

        return

        function crud_exception(proxy, res, op){
            console.error(arguments)
            Ext.Msg.show({
               title: l10n.errun_title,
               buttons: Ext.Msg.OK,
               icon: Ext.Msg.ERROR,
               msg: '<b>CRUD Proxy (or Reader or Model) exception!<br><br>operation ' +
                    (op.error ? 'error: ' + op.error  : 'success: ' + op.success) +
                    '</b>'
            })
        }
    }
})
