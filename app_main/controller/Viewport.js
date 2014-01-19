/**
    controller.Viewport: dymacally loaded and binded
 */
Ext.define('App.controller.Viewport',{
    extend: 'Ext.app.Controller',
    /* this deps are being loaded by view.Desktop:
    models: [ 'Status' ], stores: [ 'Status' ]
    */
    init: function(){
        if (this.inited){
            return
        }
        this.inited = true

        this.control({
            'viewport #userstatus button':{
                click: this.handleUserStatus
            }
        })
    }
    ,handleUserStatus: function(status, event){
        //Ext.Msg.alert('UserStatus', '123')
        App.sts(
            'userstatus',
            status.itemId,
            l10n.stsOK,
            new Date
        )
    }
})
