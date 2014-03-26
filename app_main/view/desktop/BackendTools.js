Ext.define ('App.view.desktop.BackendTools',{
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'sg-ct',
    dock: 'bottom',
    items:[ '-','nodejs: ',{
        text: l10n.stsEcho
       ,iconCls: 'sg-e'
       ,handler: function(){
            if(App.doCheckBackend)// request, check/sync $PID
                return App.doCheckBackend()
            throw new Error('OOPS: restricted code in frontend')
       }
    },'->',{
        text: l10n.stsRestart
       ,iconCls: 'sg-r'
       ,handler: function(){
            if(App.doRestartBackend)// request cmd_exit, respawn, recheck
                return App.doRestartBackend()
            throw new Error('OOPS: restricted code in frontend')
       }
    },'-',{
        text: l10n.stsKill
       ,iconCls: 'sg-k'
       ,handler: function(){
            if(App.doTerminateBackend)// spawn `terminate.wsh $PID`
                return App.doTerminateBackend()
            throw new Error('OOPS: restricted code in frontend')
        }
    }]
})
