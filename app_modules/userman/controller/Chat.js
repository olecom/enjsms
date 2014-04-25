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
    init: function controllerChatInit(){
        var me = this
        //me.listen({
        //    global:{
        //    }
            //,controller: { }
            //,store: {}
        //})
           ,chat = me.getView('Chat').create({
            renderTo: Ext.getCmp('desk').getEl()
        })

        chat.on({ destroy: destroyChat })

        return

        function destroyChat(){
        var s, ev
           ,bus = me.application.eventbus.bus
           ,i = me.refs.length - 1

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
