/**
 * Status {@link App.model.Status} model for all backend info
 */
Ext.require('App.model.Base')
Ext.define('App.cfg.modelStatus',{
    extend: 'App.cfg.model.Base',
    singleton: true,// used only once
    fields:[
    {
        name: 'op',
        type: 'string'
       ,text: l10n.operation, dataIndex:'op', width: 78
    }
   ,{
        name: 'args',
        type: 'string'
       ,text: l10n.description, dataIndex:'args', flex: 1
    }
   ,{
        name: 'res',
        type: 'string'
       ,text: l10n.result, dataIndex:'res', width: 42
    }
    ]
})

Ext.define('App.model.Status',{
   extend: 'App.model.Base',
   fields: App.cfg.modelStatus.fields
})
