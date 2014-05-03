(// support reloading for development
function(override){
var id = 'App.controller.Chat'
   ,cfg = {
    extend:'App.controller.Base',
    __name: id,
    models:[
        'chatUser'
    ],
    views:[
        'Chat'
    ],
    refs:[
        { ref: 'Chat', selector: '[wmId=Chat]' }
    ],
    chat: null,
    init:
    function controllerChatInit(){
    var me = this
       ,sid = 'chatUsers'
       ,users, chat

        chat = me.getView('Chat').create({
            renderTo: Ext.getCmp('desk').getEl()
        })

        chat.on({
            destroy: destroyChat
        })

        chat.down('[title=' + l10n.um.chat.users + ']').add(
        {
            xtype: 'grid',
            header: false,
            hideHeaders: true,
            columns: App.cfg.modelChatUser.fields,
            store: users = Ext.StoreManager.lookup(sid) || Ext.create('App.store.CRUD',
            {
                storeId: sid,
                url: App.cfg.modelChatUser.url,
                model: App.model.userman.chatUser
            })
        })

        me.chat = chat

        // some developer friendly stuff
        chat.down('[type=help]').el.dom.setAttribute(
'data-qtip',
'dev info, app module: <b>userman</b>;<br>' +
'classes:<br><b>`model.userman.chatUser`<br>`view.Chat`<br>`controller.Chat`</b>'
        )

        return

        function destroyChat(){
        var s, ev
           ,bus = me.application.eventbus.bus
           ,i = me.refs.length - 1

            Ext.StoreManager.lookup(sid).destroyStore()
            Ext.Ajax.request({ url: '/um/lib/chat/deve' })// reload backend api
            // models, stores, etc can be reloaded here
            do {
                s = me.refs[i].selector
                for(ev in bus){
                    (s = bus[ev][s]) && s.Chat && delete s.Chat
                }
            } while(i--)
            console.log('destroyController')

            me.application.controllers.removeAtKey('Chat')
            me.destroy()
        }
    }
}
if(override) cfg.override = id

Ext.define(id, cfg)

})(App.controller.Chat)
