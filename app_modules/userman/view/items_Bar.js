App.view.items_Bar = Ext.Array.push(App.view.items_Bar || [], [
    '-'
    ,{
        iconCls: 'appbar-user-online'
       ,height: 28
       ,tooltip: '', text: ''// filled by controller after auth
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
           //,icon: 'css/user-' +  l[i] + '.png'
           ,iconCls: 'appbar-user-' + l[i]
           ,handler: onItemClick
        }
        s[i] = { text: l10n.um.users ,scale: 'large' ,iconCls: 'userman'
            ,handler: function open_userman_from_bar(){
                var tb = Ext.getCmp('wm').items.getByKey('Userman')
                if(tb){
                    //debugger
                    //tb.toggle(true)
                    tb.onWMToggle()
                } else {
                    Ext.create('App.view.Userman', { renderTo: Ext.getCmp('desk').getEl() })
                }
                this.up('button').hideMenu()
            }
        }
        return s

        function onItemClick(item){
            item.up('button').setIconCls(item.iconCls).hideMenu()
            Ext.globalEvents.fireEventArgs('userStatus', [ item ])
            //TODO: set state && sync state with backend
        }
    }
                )()// buttongroup.items
            }// menu.items
        }// menu
    }// tbutton
    ,{
        iconCls: 'appbar-shutdown'
       ,height: 28 ,width: 28
       ,tooltip: l10n.shutdown
       ,handler: function(){
            Ext.globalEvents.fireEventArgs('logout')
        }
    }
])
