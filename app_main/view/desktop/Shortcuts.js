Ext.define('App.view.desktop.Shortcuts',{
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'app-shortcuts',
    style: 'background-color:transparent;background-image:none;'

    //,stateId: 'dpss'
    //,stateful: true

    ,enableOverflow: true
    ,defaults: {
        reorderable: true
    }
    ,plugins : [ { xclass: 'Ext.uxo.BoxReorderer' } ]
    ,initComponent: function shortcuts_dynamic_init(){
        var me = this

        me.items = Ext.Array.push([
            {
            xtype:'splitbutton',
            text: 'Draggable / Reorderable Menu Button',
            iconCls: 'ok',
            menu: App.view.items_Shortcuts// app modules items
            }
            ]
           ,App.view.items_Shortcuts
        )

        me.callParent(arguments)
        delete App.view.items_Shortcuts
    }
})
