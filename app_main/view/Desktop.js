Ext.define('App.view.Desktop',{
    extend: 'Ext.Container',
    xtype: 'desktop'
   ,flex: 1
   ,items: [
    {
        xtype: 'app-shortcuts'
       ,id: 'app-shortcuts-id'
    }
   ,{
        xtype: 'useredit'
    }
    ]
    ,initComponent: function(){
        var me = this

        me.on({
        'boxready':{
            'single': true,// once on load
            fn: function onBoxready(){
                var ss = Ext.create('App.view.desktop.Status')
                me.add(ss)// for `constrain` + resizing of parent
                Ext.defer(function(){// layouts are not always available
                    var r = me.getRegion()
                    ss.show()// floating Component show() manually
                    App.store.Status.showReadAllCount()// custom manual setup
                    Ext.tip.QuickTipManager.register({
                        target: ss.down('image').getEl().id,
                        title: l10n.stsHandleTipTitle,
                        text: l10n.stsHandleTip,
                        width: 244,
                        showDelay: 1024,
                        dismissDelay: 0
                    })

                    ss.down('image').getEl().on({
                        'dblclick': function(){
                            var r = me.getRegion()
                               ,s = ss.getRegion()
                            if(s.bottom - s.top < 100){//small 2 big
                                ss.animate(animate_up(350, 650, 96, 84, 18, r))
                            } else {// reverse
                                ss.animate(animate_up(
                                    s.bottom - s.top,
                                    s.right - s.left,
                                    96, 84, 18, r, true)
                                )
                            }
                        }
                    })

                    ss.setXY([r.right - 18, r.bottom - 18])
                    ss.animate(animate_up(96, 84, 7, 7, 18, r))
                    ss.getEl().setStyle('z-index', 999999)// very always on top
                    me.on({// don't loose status outside application window
                    'resize': function(){
                        var r = me.getRegion()
                           ,f = ss.getRegion()
                        if(f.top >= r.bottom || f.left >= r.right){
                            ss.animate({
                                to:{
                                    y: r.bottom - 18 - 96,
                                    x: r.right - 18 - 84
                                }
                                ,easing: 'elasticOut'
                                ,duration: 678
                            })
                        }
                    }})
                    function animate_up(h, w, f, g, d, r, t){
                    var fx = { duration: 256, keyframes: {} }
                       ,grid = ss.down('grid')
                        t = t ? ['100%', '60%', '40%', '0%' ]:
                                ['0%', '40%', '60%', '100%' ]

                        fx.keyframes[t[0]] = {
                            y: r.bottom - f - d
                           ,x: r.right - g - d
                           ,width:  g + 0000
                           ,height: f + 0000
                        }
                        fx.keyframes[t[1]] = {
                            y: r.bottom - d - h/4
                           ,x: r.right - d - w/4
                           ,width:  w/4
                           ,height: h/4
                        },
                        fx.keyframes[t[2]] = {
                            y: r.bottom - d - h/2
                           ,x: r.right - d - w/2
                           ,width:  w/2
                           ,height: h/2
                        },
                        fx.keyframes[t[3]] = {
                            y: r.bottom - d - h/1
                           ,x: r.right - d - w/1
                           ,width:  w/1
                           ,height: h/1
                        }

                        Ext.defer(function(){
                            grid.show()
                            grid.getEl().fadeIn({ duration: 512 })
                        }, 1024)
                        grid.getEl().fadeOut({ opacity: 0, duration: 0 })
                        grid.hide()

                        return fx
                    }
                }, 256)
            }
        }})
        me.callParent(arguments)
    }
})

Ext.require('App.store.Status')
Ext.require('App.view.desktop.BackendTools')

Ext.define ('App.view.desktop.StatusGrid',{
    extend: 'Ext.grid.Panel',
    singleton: true,
    title: l10n.stsSystem,
    /* config for stretching `grid` to fit container correctly: */
    height: '100%', width: 123, flex: 1,//+ { layout: 'hbox', align: 'stretch' }
    viewConfig: {
        deferEmptyText: false
       ,emptyText: '--== ? ? ? ? ==--'
       ,getRowClass: function(record) {
            return record.get('n') ? 'new-bold-row' : ''
        }
    },
    listeners:{
       itemclick: function itemclickStatusGrid(grid, rec){
           if(rec.get('n')) rec.set('n', false)
       }
    },
    dockedItems:[{
        xtype: 'toolbar',
        dock: 'top',
        items:[
            'log: ',
            {
            text: l10n.stsMarkRead
           ,iconCls: 'sg-m'
           ,handler: function(){
                    this.up('grid').getStore().markAllAsRead()
                }
            },'->',
            {
            text: l10n.stsClean
           ,iconCls: 'sg-c'
           ,handler: function(){
                    this.up('grid').getStore().removeAll()
                }
            }
        ]
    },{
        xtype: 'sg-ct'
    }],
    /* `columns` are going to be dynamicly configured, here is some experiment */
    columns: Ext.Array.merge(App.cfg.modelBase.fields, App.cfg.modelStatus.fields),
    store: App.store.Status
})

Ext.define('App.view.desktop.Status',{
    xtype: 'app-status-bubble',
    extend: 'Ext.container.Container',
    layout: 'hbox',
    align: 'stretch',
    width: 7, height: 7,// it is being resized and animated, when created
    floating: true,
    constrain: true,
    draggable: true,
    resizable: true,

    style: 'padding: 4px; box-shadow: 0px 10px 20px #111; text-align: center;',
    items: [{
        xtype: 'container'
        ,layout: 'vbox'
        ,width: 77
        ,align: 'strech'
        ,defaults:{
            width: '100%'
        }
        ,items:[
            Ext.create('Ext.Img',{
                src: 'css/extdeskrun.gif',
                style: 'cursor:move;',
                height: 61// fix first layout
            }),
        {
            xtype: 'component'
           ,html: (l10n.stsMsg + '<b id="stscount">0/0</b><br><div id="versions">' +
'-= versions =-\n'+
'extjs:,' + Ext.versions.extjs.version + '\n' +
           (App.cfg.backend.url ?
'nodejs:,' + App.cfg.backend.versions.node +
'connectjs:,' + App.cfg.backend.versions.connectjs +
'node-webkit:,'+ App.cfg.backend.versions.nw : '')
            ).replace(/\n/g,'</b><br>').replace(/,/g, '<br><b>') +
'</div><br><a href="' + (App.cfg.backend.url ? App.cfg.backend.url : '#TyT') +
'">HTTP Remote Application</a>'
        }
        ]
    }
        ,App.view.desktop.StatusGrid
    ]
})

Ext.define('App.view.shortcuts_Desktop', {
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

Ext.define('App.view.Bar',{
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'app-bar'
   ,baseCls: 'x-gray-toolbar'
   ,defaults:{
        //scale: 'small'
        //cls: 'appdesktop-btn'
        //height:44
    }
   ,items:[
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
           ,{ text: '<img height=16 width=16 src="css/usersman_shortcut.png"/>' }
            ]
        },'-',
        {
            iconCls: 'appbar-user-online'
           ,height:28
           //,tooltip: l10n.userStatus + ': <b>' + App.user.id + '</b>'
           //,text: '<i>' + App.user.name + '</i> (<b>' + App.user.role + '</b>)'
           ,menu:{
                xtype: 'menu',
                plain: true,
                items:{
                    xtype: 'buttongroup',
                    title: l10n.userStatusMenu,
                    itemId: 'userstatus',
                    columns: 1,
                    items:(
    function mk_status_list(){
        var s = new Array(5) ,l = [ 'online', 'away', 'busy', 'offline' ]
        for(var i = 0; i < 4; i++)  s[i] = {
            text: l10n.userStatuses[l[i]]
           ,itemId: l[i]
           ,width: '100%'
           ,icon: 'css/user-' +  l[i] + '.png'
           ,handler: onItemClick
        }
        s[i] = { text: l10n.um.users ,scale: 'large' ,icon: 'css/um32x32.gif' }
        return s
        function onItemClick(item){
            item.up('button').setIcon(item.icon).hideMenu()
            Ext.globalEvents.fireEventArgs('userStatus', [ item ])
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
