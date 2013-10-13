Ext.define('App.view.Viewport', {
    extend: 'Ext.container.Viewport',

    layout: {
        type: 'vbox'
        ,align: 'stretch'
    }

    ,items: [
        //,plugins: null //works instead of `defaults.reorderable = false`
        { xtype: 'app-bar' },

        { xtype: 'desktop' }
    ]
})

Ext.define('App.view.Desktop', {
    extend: 'Ext.Container',
    alias: 'widget.desktop'
    ,flex:1
    ,items: [
        {
            xtype: 'app-shortcuts'
            ,id: 'app-shortcuts-id'
        },
        { xtype: 'useredit' }
    ]
})

Ext.define('App.view.shortcuts_Desktop', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'app-shortcuts',
    style: 'background-color:transparent;background-image:none;'

    ,stateId: 'dpss'
    ,stateful: true

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
            menu: [{text: 'Menu Item 1'}]
        }
        ,{ xtype: 'datefield' }
        ,{
            text: '<img height=64 width=64 src="images/procman_shortcut.png"/><br/><br/>' +
                  'Процессы<br/>'
            ,height:110 ,width:92
            ,tooltip: 'Запуск/Управление процессами'
        }

        ,{
            text: '<img height=64 width=64 src="images/usersman_shortcut.png"/><br/><br/>' +
                  l10n.um.users + '<br/>'
            ,height:110 ,width:92
            ,tooltip: 'Управление пользователями, правами доступа и т.п.'
        }

        ,{
            text: '<img height=64 width=64 src="images/favicon.png"/><br/><br/>' +
                  'SMS Программа<br/>'
            ,height:110 ,width:92
            ,tooltip: 'SMS Программа'
        }

    ]
})

Ext.define('App.view.Bar', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'app-bar'
    ,defaults:{
        //scale: 'small'
        //cls: 'appdesktop-btn'
        //height:44

    }
    ,enableOverflow: true
    ,items : [
        {
            xtype:'splitbutton',
            text: 'Menu Button',
            iconCls: 'add16',
            menu: [{text: 'Menu Item 1'}]
        },
        {
            xtype:'splitbutton',
            text: 'Cut',
            iconCls: 'add16',
            menu: [{text: 'Cut Menu Item'}]
        },
        /*{
            xtype: 'datefield'
        },*/
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
            iconCls: 'appbar-user-online'
            ,height:28 //,width:28
            ,tooltip: l10n.userStatus + ': <b>' + App.user.id + '</b>'
            ,text: '<i>' + App.user.name + '</i> (<b>' + App.user.role + '</b>)'
            ,menu:{
                xtype: 'menu',
                plain: true,
                items: {
                    xtype: 'buttongroup',
                    title: l10n.userStatusMenu,
                    columns: 1,
                    items:(
    function mk_status_list(){
        var s = new Array(5) ,l = [ 'online','away','busy','offline' ]
        for(var i = 0; i < 4; i++)  s[i] = {
            text: l10n.userStatuses[l[i]]
           ,icon: 'images/user-' +  l[i]+ '.png'
           ,handler: onItemClick ,width: '100%'
        }
        s[i] = { text: l10n.um.users ,scale:'large' ,icon:'images/um32x32.gif'}
        return s
        function onItemClick(i ,j){
           (j = i.up('button')).setIcon(i.icon)
            j.hideMenu()
            //TODO: set state && sync state with backend
        }
    }
                    )()// buttongroup.items
                }// menu.items
            }// menu
        }// tbutton
        ,{
            iconCls: 'appbar-connect-on'
            ,height:28 ,width:28
            ,tooltip: l10n.connection
            //,menu: [{text: 'Menu Item'}]
        }
        ,{
            iconCls: 'appbar-shutdown'
            ,height:28 ,width:28
            ,tooltip: l10n.shutdown
        }
    ]
})

Ext.define('App.view.user_Edit', {
    extend: 'Ext.window.Window',
    alias: 'widget.useredit',

    title: 'Edit User',
    layout: 'fit',
    autoShow: true,
    constrain: true

    ,stateId: 'vwue'
    ,stateful: true,

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