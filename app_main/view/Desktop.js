Ext.define('App.view.Desktop', {
    extend: 'Ext.Container',
    xtype: 'desktop'
    ,flex:1
    ,items: [
        {
            xtype: 'app-shortcuts'
            ,id: 'app-shortcuts-id'
        }
        ,{ xtype: 'useredit' }
    ]
    ,initComponent: function(){
        var me = this

        /* resizing of parent: add `status_Desktop` to `desktop`
         * show() floating Component, or it is hidden
         * */

        me.on({
        'boxready': {
            'single': true,
            fn: function onBoxready(){
                var ss = Ext.create('App.view.desktop.Status')
                me.add(ss)// for `constrain`
                Ext.defer(function(){// layouts are not always available
                    var r = me.getRegion()
                    ss.show()
                    Ext.tip.QuickTipManager.register({
                        target: ss.down('image').getEl().id,
                        title: 'Что и как происходит внутри системы?',
                        text: 'Двойной клик по шестерням раскрывает/скрывает окно',
                        width: 300,
                        dismissDelay: 0
                    })
                    ss.setXY([r.right - 18, r.bottom - 18])
                    ss.animate({
                        duration: 1234,
                        keyframes : {
                        '0%': {
                            y: r.bottom - 18 - 0000
                            ,x: r.right - 18 - 0000
                            ,width:  7 + 0000
                            ,height: 7 + 0000
                        },
                        '40%': {
                            y: r.bottom - 18 - 67/4
                            ,x: r.right - 18 - 84/4
                            ,width:  84/4
                            ,height: 67/4
                        },
                        '60%': {
                            y: r.bottom - 18 - 67/2
                            ,x: r.right - 18 - 84/2
                            ,width:  84/2
                            ,height: 67/2
                        },
                        '100%': {
                            y: r.bottom - 18 - 67/1
                            ,x: r.right - 18 - 84/1
                            ,width:  84/1
                            ,height: 67/1
                        }}
                    })
                    ss.getEl().setStyle('z-index', 999999)// very always on top
                    me.on({// don't loose status outside application window
                    'resize': function(){
                        var r = me.getRegion()
                           ,f = ss.getRegion()
                        if(f.top >= r.bottom || f.left >= r.right){
                            ss.animate({
                                to: {
                                    top: r.bottom - 28 - 84,
                                    left: r.right - 28 - 67
                                }
                                ,easing: 'elasticOut'
                                ,duration: 678
                            })
                        }
                    }})
                }, 1)
            }
        }})
        me.callParent(arguments)
    }
})

Ext.define('App.view.desktop.Status', {
    //extend: 'Ext.Component',
    xtype: 'app-status-bubble',
    extend: 'Ext.container.Container',
    layout: 'hbox',
    width: 7,
    height: 7,
    floating: true,
    constrain: true,
    draggable: true,
    resizable: true,

    stateful: true,
    stateId: 'dpsb',
    style: 'padding: 4px; box-shadow: 0px 10px 20px #111; text-align: center;',
    items: [
        {
            xtype: 'container'
            ,tooltip: 'Двойной клик раскрывает/скрывает содержимое'
            ,layout: 'vbox'
            ,width: 77
            ,align: 'strech'
            ,defaults: {
                width: '100%'
            }
            ,items:[
                Ext.create('Ext.Img', {
                    src: 'css/extdeskrun.gif',
                    height:61// fix first layout

                })
                ,{
                    xtype: 'component'
                    ,html: 'СУПРО СУПРО СИСТЕМАНИПЕЛЬб СУПРО СУПРО СУПРО СУПРО СИСТЕМАНИПЕЛЬ'
                }
            ]
        }
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
            text: '<img height=64 width=64 src="css/procman_shortcut.png"/><br/><br/>' +
                  'Процессы<br/>'
            ,height:110 ,minWidth:92
            ,tooltip: 'Запуск/Управление процессами'
        }

        ,{
            text: '<img height=64 width=64 src="css/usersman_shortcut.png"/><br/><br/>' +
                  l10n.um.users + '<br/>'
            ,height:110 ,minWidth:92
            ,tooltip: 'Управление пользователями, правами доступа и т.п.'
        }

        ,{
            text: '<img height=64 width=64 src="css/favicon.png"/><br/><br/>' +
                  'SMS Программа<br/>'
            ,height:110 ,minWidth:92
            ,tooltip: 'SMS Программа'
        }

    ]
})

Ext.define('App.view.Bar', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'app-bar'
    ,baseCls: 'x-gray-toolbar'
    ,defaults:{
        //scale: 'small'
        //cls: 'appdesktop-btn'
        //height:44
    }
    ,items : [
        {
            xtype:'toolbar'
            ,baseCls: 'x-gray-toolbar'
            ,style:'border:0;'
            ,flex: 1
            ,enableOverflow: true
            ,items:[{
                text: '<img height=16 width=16 src="css/favicon.png"/>'
                ,enableToggle: true
                //,toggleHandler: onItemToggle
                ,pressed: true
            }
            ,{  text: '<img height=16 width=16 src="css/usersman_shortcut.png"/>'
            }
            ]
        },'-',
        {
            iconCls: 'appbar-user-online'
            ,height:28
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
           ,icon: 'css/user-' +  l[i]+ '.png'
           ,handler: onItemClick ,width: '100%'
        }
        s[i] = { text: l10n.um.users ,scale:'large' ,icon:'css/um32x32.gif'}
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
        /*,{
            iconCls: 'appbar-connect-on'
            ,height:28 ,width:28
            ,tooltip: l10n.connection
            //,menu: [{text: 'Menu Item'}]
        }*/
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
    autoShow: true,//!!! doesn't work with fadeing viewport
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
        ]

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
