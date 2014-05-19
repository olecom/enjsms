/*
 * Simple chat with user list and textual chat room
 **/
module.exports = chat

function chat(api, wes){
var chat_api = { 'user': null, 'text': null, 'deve': load_api }
   ,url = require('url')
   ,qs = require('connect/node_modules/qs')
   ,fs = require('fs')
   ,local = {
        wes: wes
       ,log_dir: ''
       ,log_file: null
       ,log_file_name: ''
       ,require:{
            fs: fs
        }
    }
   ,dir = process.cwd() + api.cfg.app.modules.userman.data + '/chat'

    fs.stat(dir,
        function stat_um_data_chat_dir(err, d){
            if(err){
                require('mkdirp').mkdirp(dir,
                    function mkdirp_um_data_chat_dir(err){
                        if(err) throw(err)
                        load_api()
                    }
                )
                return
            }
            if(!d.isDirectory()){
                throw new Error('Is not a directory: ' + dir)
            }
            load_api()// init api
        }
    )

    return mwChat// return sync, log file open is later and can throw

    function mwChat(req, res, next){
    var ret = { success: false, data: null }//                               \..../
    var m = req.url.slice(1, 5)// call from UI: App.backend.req('/um/lib/chat/deve')
        //TODO: auth for devel feature
        req.url = url.parse(req.url)// parse into object, api has no `require()`
        if(req.url.query){
            req.url.query = qs.parse(req.url.query)
        }
        if(chat_api[m]){
            if(!chat_api[m](ret, api, local, req, res, next)){// try/catch by `connect`
                res.json(ret)// sync
            }// async
        }
        return
    }

    function load_api(){

        if(local.log_file){// close and clear log file write stream
            local.log_file.end(null, do_load)
            local.log_file = null
            local.log_file_name = ''
        } else {
            do_load()
        }

        return

        function do_load(){
        var m, tmp
            local.log_dir || (local.log_dir = dir)// provide new or existing log dir
            for(m in chat_api){
                if(0 != m.indexOf('deve')){
                    chat_api[m] && (tmp = chat_api[m])
                    try {
                        chat_api[m] = new Function(
                           'ret, api, local, req, res, next',
                            fs.readFileSync(__dirname + '/' + m + '.js', 'utf8')
                        )
                    } catch(ex){
                        api._err(api.ipt(ex))
                        tmp && (chat_api[m] = tmp)
                    }
                }
            }
        }
    }
}
