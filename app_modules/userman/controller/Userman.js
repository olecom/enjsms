(// support reloading for development
function(override){
var id = 'App.um.controller.Userman'
   ,cfg = {
    extend: App.controller.Base,
    __name: id,
    views:[
        'App.um.view.Userman'
    ],
    mainView: null,// for development in devtools
    init:
    function controllerUsermanInit(){
    var me = this, mainView

        mainView = new App.um.view.Userman({ constrainTo: Ext.getCmp('desk').getEl() })

        mainView.on({
            destroy: destroyUserman
        })

        me.mainView = mainView// for development in devtools

        return

        function destroyUserman(){
            //Ext.StoreManager.lookup(sid).destroyStore()
            me.application.eventbus.unlisten(me.id)
            me.application.controllers.removeAtKey(me.id)

            App.User.can['App.view.Window.tools.refresh'] && (
                App.backend.req('/um/lib/rbac/deve')// reload backend api
            )
        }
    }
}
if(override) cfg.override = id
Ext.define(id, cfg)
})(App.controller.Userman)
