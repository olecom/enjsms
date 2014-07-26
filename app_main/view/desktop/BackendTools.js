Ext.define ('App.view.desktop.BackendTools',{
    extend: Ext.toolbar.Toolbar,
    xtype: 'sg-ct',
    dock: 'bottom',
    items:[ '-','nodejs: ',{
        text: l10n.stsEcho
       ,iconCls: 'sg-e'
       ,handler: function(){
            if(App.doCheckBackend)// request, check/sync $PID
                return App.doCheckBackend()
            throw new Error(l10n.oops_rcif)
       }
    },'->','-',{
        text: l10n.stsStopSystem
       ,iconCls: 'sg-s'
       ,handler: function(){
            if(App.doStopBackend)// TODO request cmd_exit, stop mongoDB
                return App.doStopBackend()
            throw new Error(l10n.oops_rcif)
       }
    },'-',{
        text: l10n.stsRestart
       ,iconCls: 'sg-r'
       ,handler: function(){
            if(App.doRestartBackend)// request cmd_exit, respawn, recheck
                return App.doRestartBackend()
            throw new Error(l10n.oops_rcif)
       }
    },'-','->',{
        text: l10n.stsKill
       ,iconCls: 'sg-k'
       ,handler: function(){
            if(App.doTerminateBackend)// spawn `terminate.wsh $PID`
                return App.doTerminateBackend()
            throw new Error(l10n.oops_rcif)
        }
    }]
})
