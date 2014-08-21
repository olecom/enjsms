/**
 * `Base` from which all other models can/will extend
 * `BaseR` for grids with 'viewed' field
 * `BaseCRUD` for all models from backend
 */

/* this is kind of breakable toy to try some hybrid config for Model and Grid
 * this Models are being loaded manually by View && Store, full MVC runs later
 */

Ext.util.Format.status_created = Ext.util.Format.dateRenderer('H:i:s Y-m-d')

App.cfg.modelBase = {
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

        /* NOTE: Model constructor creates accessors for all this,
         * TODO: split columns from fields, in this config object it will be OK,
         *       see `App.cfg.modelChatUser`
         * */
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
    ,idgen:{
        getRecId: function(rec){
            return '' + rec.internalId
        }
    }
    //,proxy : String/Object/Ext.data.proxy.Proxy
    //         every model defines proxy with own `url` and `reader.root`
    //,validations : Object[]

   ,c9r: function constructorModelBase(){
    var me = this
        me.idgen.getRecId = App.cfg.modelBase.idgen.getRecId
        me.callParent(arguments)
    }
}

Ext.define('App.model.Base',{
    extend: Ext.data.Model,
    fields: Ext.Array.clone(App.cfg.modelBase.fields)
   ,constructor: function(cfg){
        App.cfg.modelBase.c9r.call(this, cfg)
    }
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
        text: '<img src="css/colread.png"></img>&#160',
        renderer:function style_res(value, meta){
            meta.tdCls = value ? 'row-unread' : 'row-read'
            return ''
        }
    }]
)

Ext.define('App.model.BaseR',{
    extend: Ext.data.Model,
    fields: App.cfg.modelBase.fields,
    constructor: function(){
        /* Before:
         * > id: "App.model.Status-ext-record-9
         * > internalId: "ext-record-9"
         **/
        App.cfg.modelBase.c9r.apply(this, arguments)
        /* After:
         * > id: "ext-record-9"
         * > internalId: "ext-record-9"
         */
    }
})

Ext.define('App.model.BaseCRUD',{
    extend: Ext.data.Model,
    requires:[
        'App.proxy.CRUD'
    ],
    idProperty: '_id',
    /* abstract options may be defined by inherited Models: */
    //clientIdProperty: 'Id' && !persist, for writing records to the server
    //url: Model operates on its own (without store)
    //fields: reconfigured by store/proxy/grid; or see below 'modelShoeItems'

    constructor: function(){
        if(this.url){
            // NOTE: Model's proxy doesn't play role in Store setup
            App.cfg.backend.url && (this.url = App.cfg.backend.url + this.url)
            this.setProxy({
                type: 'crud',
                url: this.url
            })
        }

        App.cfg.modelBase.c9r.apply(this, arguments)// use short view ids
    }
})

/* =============================================================================

App.cfg.modelShoeItems = {
    /*fields:[// this are initial sets of config; first init is done by `metaChange`
    { name: 'add',     type: 'date' },
    { name: 'id',      type: 'int' },
    'id_mpcode'
    /*{ name: 'add_by',  type: 'string' },
    { name: 'edit',    type: 'date' },
    { name: 'edit_by', type: 'string' },* /
    ],* /
    columns:[
    { dataIndex: 'id',      text: l10n.so.clmn.id, width: 28 },
    { dataIndex: 'add',     text: l10n.so.clmn.add, format: 'Y/m/d H:i:s l', xtype: "datecolumn" }
    /*{ dataIndex: 'add_by',  text: l10n.so.clmn.add_by, hidden: true },
    { dataIndex: 'edit',    text: l10n.so.clmn.edit, hidden: true },
    { dataIndex: 'edit_by', text: l10n.so.clmn.edit_by, hidden: true }* /
    ]
}

/*Ext.define('App.shoesupro.model.OrderItems',{
    extend: App.model.BaseCRUD,
    fields: App.cfg.modelShoeItems.fields
})
 *
doc = {
  "_id": new ObjectID("53df77df9bfa430000000004")
, add: new Date("Mon Aug 04 2014 03:00:00 GMT+0300 (Калининградское время (зима))")
, "add_by": "default login"
, edit: null
, "edit_by": ""
, name: "Осень-зима 2014/2015"
, "#": 31
, "total_plan": 12345
, "total_done": 0
, eur: 15000
, dlr: 12000
, fem: 120
, mal: 130
, id: 0
, fields: [
    {
      name: "add"
    , type: "date"
    }
  , {
      name: "add_by"
    , type: "string"
    }
  , {
      name: "edit"
    , type: "date"
    }
  , {
      name: "edit_by"
    , type: "string"
    }
  , {
      name: "id"
    , type: "int"
    }
  , "id_mpcode"
  , "pcode"
  , {
      name: "total_qty"
    , type: "int"
    }
  , "id_mfg"
  , {
      name: "id_in"
    , type: "int"
    }
  , "gend"
  , "prodname"
  , "g_color"
  , "g_material"
  , "g_sizes_set"
  , "g_sizes"
  ]
, columns: [
    {
      dataIndex: "id"
    , text: "id"
    , width: 28
    }
  , {
      dataIndex: "add"
    , text: "add"
    , format: "Y/m/d H:i:s l"
    , xtype: "datecolumn"
    , width: 187
    , tdCls: "so-clmn-add"
    }
  , {
      dataIndex: "id_mpcode"
    , text: "id_mpcode"
    , width: 167
    , editor: "textfield"
    }
  , {
      dataIndex: "id_in"
    , text: "id_in"
    , width: 28
    }
  , {
      dataIndex: "id_mfg"
    , text: "id_mfg"
    , width: 44
    }
  , {
      dataIndex: "g_sizes"
    , text: "g_sizes"
    , xtype: "so_gridColumnSizes"
    }
  , {
      dataIndex: "g_sizes"
    , text: "g_sizes_sum"
    , xtype: "so_gridColumnSizesSum"
    , width: 44
    }
  , {
      dataIndex: "total_qty"
    , text: "total_qty"
    , width: 44
    }
  , {
      dataIndex: "pcode"
    , text: "pcode"
    , editor: "textfield"
    }
  , {
      dataIndex: "gend"
    , text: "gend"
    , width: 44
    }
  , {
      dataIndex: "prodname"
    , text: "prodname"
    }
  , {
      dataIndex: "g_color"
    , text: "g_color"
    }
  , {
      dataIndex: "g_material"
    , text: "g_material"
    }
  , {
      dataIndex: "g_sizes_set"
    , text: "g_sizes_set"
    }
  , {
      dataIndex: "add_by"
    , text: "add_by"
    }
  , {
      dataIndex: "edit"
    , text: "edit"
    , hidden: true
    }
  , {
      dataIndex: "edit_by"
    , text: "edit_by"
    , hidden: true
    }
  ]
};
*/
