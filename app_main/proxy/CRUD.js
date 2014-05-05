Ext.define('App.proxy.CRUD',{
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.crud',
    //url: is defined by Store || Model

    // proxy defaults can be overriden by store's constructor
    idParam: '_id',// mongodb's
    batchActions: true,
    startParam: undefined,
    pageParam: undefined,
    limitParam: undefined,

    writer:{
        type: 'json'
       ,allowSingle: false
       //,writeRecordId: true  // default
       //,writeAllFields: !true// !default
    },
    reader:{
        type: 'json'
       ,idProperty: '_id'
       ,root: 'data'
       //,totalProperty: '#'// by default it is the length of the data array
    },

    listeners:{
        exception: function crud_exception(proxy, res, op){
            console.error(arguments)
            Ext.Msg.show({
               title: l10n.errun_title,
               buttons: Ext.Msg.OK,
               icon: Ext.Msg.ERROR,
               msg: '<b>CRUD Proxy (or Reader or Model) exception!<br><br>operation ' +
                    (op.error ? 'error: ' + op.error  : 'success: ' + op.success) +
                    '</b>'
            })
        }
    }
})
