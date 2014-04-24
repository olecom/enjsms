Ext.define('App.controller.Chat', {
    extend: 'App.controller.Base',

    models:[
        'chatUser'
    ],
    views: [
        'Chat'
    ],
    refs: [
        //{ ref: 'auth', selector: 'button[iconCls=ok]' }
    ],
    init: function controllerChatInit(){
        var me = this
        //me.listen({
        //    global:{
        //    }
            //,controller: { }
            //,store: {}
        //})
        var chat = me.getView('Chat').create()

        chat.on({ destroy: destroyChat })
        App.cfg.extjs.load && App.cfg.extjs.load.setLoading(false)
        return

        function destroyChat(){
            me.application.controllers.removeAtKey('Chat')

            /*
            TODO: clear if selectors:
        for(var i=0,len=controller.selectors.length;i<len;i++){
			var obj = controller.selectors[i];
			for(var s in obj){
				for(var ev in obj[s]){
					//remove selectors from event bus
					delete me.eventbus.bus[ev][s];
				}

			}
		}
            */
        }
    }
})
