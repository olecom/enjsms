/**
 * Base {@link Ext.data.Model} from which all other models can/will extend
 */

/* this is kind of breakable toy to try some hybrid config for Model and Grid */
Ext.util.Format.status_created = Ext.util.Format.dateRenderer('H:i:s Y-m-d')

Ext.ns('App.cfg.model')
App.cfg.model.Base = Ext.define('App.cfg.modelBase',{
    singleton: true,// used only once
    fields: [
    {
       name: 'created',
       type: 'date'
       //,type: [ auto(Default, no conversion), string, int, float, boolean, date ]
      ,persist: false
       //,defaultValue: ""
       //,mapping: "data.option"
       //,serialize: Function
       //,sortDir: "ASC"
       //,sortType : Function/String(Ext.data.SortTypes:[asText, asUCString, asUCText, asDate, asFloat, asInt])
       //,useNull : Boolean
      ,text: l10n.time, dataIndex:'created'
      ,renderer: 'status_created', width: 84
    }
    ]
    //,associations : Object[]
    //,belongsTo : String/Object/String[]/Object[]
    //,clientIdProperty : String
    //,defaultProxyType : String ; Defaults to 'ajax'.
    //,hasMany : String/Object/String[]/Object[]
    //,idProperty : String/Object/Ext.data.Field; Defaults to 'id'.
    //,idgen : String/Object
    //,proxy : String/Object/Ext.data.proxy.Proxy
    //         every model defines proxy with own `url` and `reader.root`
    //,validations : Object[]
})

Ext.define('App.model.Base',{
    extend: 'Ext.data.Model',
    fields: Ext.Array.clone(App.cfg.modelBase.fields)
})

Ext.Array.insert(
    App.cfg.modelBase.fields,
    0,
    [{
        name: 'n',// new msg marker
        type: 'boolean',
        persist: false,
        defaultValue: true,
        dataIndex:'n',
        width: 22,
        text: '<img src="css/colread.png"></img>',
        renderer:function style_res(value, meta){
            meta.tdCls = value ? 'row-unread' : 'row-read'
            return ''
        }
    }]
)

Ext.define('App.model.BaseR',{
    extend: 'Ext.data.Model',
    fields: App.cfg.modelBase.fields
})
