/**
 * Store for System's `model.Status`
 */

Ext.require('App.model.Status')
Ext.define('App.store.Status',{
	extend: 'Ext.data.Store',
    singleton: true,// single inctance for status
    storeId: 'app-status',
    model: 'App.model.Status'
})

App.sts = function(op, args, res, time){//global status logger
    App.store.Status.insert(0, new App.model.Status({
        created: time ? time : new Date,
        op: op, args: args, res: res
    }))
}

