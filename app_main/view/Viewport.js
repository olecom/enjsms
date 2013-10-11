Ext.define('App.view.Viewport', {
    extend: 'Ext.container.Viewport',

    layout: {
        type: 'vbox'
        ,align: 'stretch'
    }

    ,items: [
        { xtype: 'topbar' },
        { xtype: 'desktop' }
    ]
})

Ext.define('App.view.Topbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.topbar'

    ,enableOverflow: true
    ,defaults: {
        reorderable: true
    }
    ,plugins : [ { xclass: 'Ext.uxo.BoxReorderer' } ]
    ,items   : [
        {
            xtype:'splitbutton',
            text: 'Menu Button',
            iconCls: 'add16',
            menu: [{text: 'Menu Item 1'}],
            reorderable: false
        },
        {
            xtype:'splitbutton',
            text: 'Cut',
            iconCls: 'add16',
            menu: [{text: 'Cut Menu Item'}]
        },
        {
            text: 'Copy',
            iconCls: 'add16'
        },
        {
            text: 'Copy',
            iconCls: 'add16'
        },
        {
            text: 'Copy',
            iconCls: 'add16'
        },
        {
            text: 'Copy',
            iconCls: 'add16'
        },
        {
            text: 'Copy',
            iconCls: 'add16'
        },
        {
            text: 'Copy',
            iconCls: 'add16'
        },
        {
            text: 'Copy',
            iconCls: 'add16'
        },
        {
            text: 'Paste',
            iconCls: 'add16',
            menu: [{text: 'Paste Menu Item'}]
        },
        {
            text: 'Format',
            iconCls: 'add16'
        }
    ]
})

Ext.define('App.view.Desktop', {
    extend: 'Ext.Container',
    alias: 'widget.desktop'
    ,flex:1
    ,items: [
        { xtype: 'useredit' }
    ]
})

Ext.define('App.view.user_Edit', {
    extend: 'Ext.window.Window',
    alias: 'widget.useredit',

    title: 'Edit User',
    layout: 'fit',
    autoShow: true,
    constrain: true,
    initComponent: function() {
        this.items = [
            {
                xtype: 'form',
                items: [
                    {
                        xtype: 'textfield',
                        name : 'name',
                        fieldLabel: 'Name'
                    },
                    {
                        xtype: 'textfield',
                        name : 'email',
                        fieldLabel: 'Email'
                    }
                ]
            }
        ];

        this.buttons = [
            {
                text: 'Save',
                action: 'save'
            },
            {
                text: 'Cancel',
                scope: this,
                handler: this.close
            }
        ];

        this.callParent(arguments);
    }
})