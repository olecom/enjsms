Ext.define('App.view.Viewport',{
    extend: 'Ext.container.Viewport',
    requires:[
        'App.view.Bar',
        'App.view.Desktop'
    ],
    layout: 'border',
    items:[
        { xtype: 'app-bar' },//uses    `App.view.items_Shortcuts`
        { xtype: 'desktop' } //deletes `App.view.items_Shortcuts`
    ]
/*    ,initComponent: function dynamic_init() {
 *       var me = this
 *       me.items = [
 *           { xtype: 'app-bar' }
 *          ,{ xtype: 'desktop' }
 *       ]
 *       me.callParent(arguments)
 *   }*/
})
