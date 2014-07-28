Ext.define('App.proxy.CRUD',{
    extend: Ext.data.proxy.Rest,
    alias: 'proxy.crud',
    //url(abstract): is defined by Store || Model

    // proxy defaults can be overriden by store's constructor
    idParam: '_id',// mongodb's
    batchActions: true,
    startParam: undefined,// default is empty params
    pageParam: undefined,
    limitParam: undefined,

    listeners:{
        exception:
        function crud_exception(proxy, res, op){
            console.error(arguments)
            Ext.Msg.show({
                title: l10n.errun_title,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR,
                msg: '<b>CRUD Proxy (or Reader or Model) exception!<br><br>operation ' + (
                     op.error ?
                     'error (in proxy/reader/model):</b> ' + op.error.replace(/\r*\n/g, '<br>') :
                     'success (backend):</b> ' + op.success
                )
            })
        }
    },
    /* JSON-optimized reader and writer */
    reader:{
        type: 'json'
       ,idProperty: '_id'
       ,root: 'data'
       //,totalProperty: '#'// by default it is the length of the data array
       ,getResponseData:
        function getResponseDataJSON(res){
            try {// NOTE: dates revive in Model constructor
                return this.readRecords(JSON.parse(res.responseText))
            } catch (ex){
                return new Ext.data.ResultSet({
                    total: 0,
                    count: 0,
                    records: null,
                    success: false,
                    message: ex.stack.replace(/</g, '&lt;')
                    // stack includes `message` and is more informative
                })
            }
        }
       ,readRecords:
        function readRecordsJSON(data){
        var me = this, mo = 0,
            Model, root, result

            if(me.getMeta && (result = me.getMeta(data))){
                me.onMetaChange(result)
            } else if(data.metaData){
                me.onMetaChange(data.metaData)
            }

            /* raw or JSON can be seen by devtools/network, thus no
             * ```
             *  me.rawData = data
             *  me.jsonData = data
             * ``` */

            data = me.getData(data)
            result = {
                total  : 0,
                records: null,
                success: me.getSuccess(data),
                message: me.messageProperty ? me.getMessage(data) : null
            }

            if(result.success){
                root = me.getRoot(data)// is Array or blow up

                if((result.total = root.length)){
                    Model = me.model
                    do {
                        data = (root[mo] = new Model(root[mo]))
                        if(data.phantom){
                            data.phantom = false// if no IDs from the server
                        }
                    } while(++mo < root.length)
                }
                result.records = root
            }
            return new Ext.data.ResultSet(result)
        }
    }

   ,writer:{
        type: 'json'
       ,allowSingle: false
       //,writeRecordId: true  // default
       //,writeAllFields: !true// !default
       ,write:
        function writeJSON(request){
        var operation = request.operation,
            records   = operation.records || [ ],
            len       = records.length,
            data      = new Array(len),
            i         = 0

            do {
                data[i] = this.getRecordData(records[i], operation)
            } while (++i < len)

            if(!this.root){
                request.jsonData = data
                return request
            }
            request.jsonData = request.jsonData || { }
            request.jsonData[this.root] = data
            return request
        }
    }
})
