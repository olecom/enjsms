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
           ,handler: function(){
                Ext.globalEvents.fireEventArgs('logout')
            }
        }
    ]
})
