Ext.define('App.proxy.CRUD', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.crud',
    url: null,// is defined by Store || Model

    writer:{
        type: 'json'
       ,writeRecordId: true  // default
       ,writeAllFields: !true// !default
    },
    reader:{
        type: 'json'
    }
})
