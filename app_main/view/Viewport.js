Ext.define('App.view.Viewport',{
    extend: 'Ext.container.Viewport',
    requires:[
        'App.view.Bar',
        'App.view.Desktop'
    ],
    layout:{
        type: 'vbox'
       ,align: 'stretch'
    },
    items:[
        { xtype: 'app-bar' },
        { xtype: 'desktop' }
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
