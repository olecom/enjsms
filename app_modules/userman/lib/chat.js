function chat(api){
var chat_api = { 'user': null, 'text': null, 'deve': load_api }

    load_api()// init api

    return mwChat

    function mwChat(req, res, next){
    var ret = { success: false }
    var m = req.url.slice(1, 5)
        //TODO: auth for devel feature
        chat_api[m] && chat_api[m](ret, api, req, res, next)// try/catch by `connect`
        res.json(ret)
        return
    }

    function load_api(){
    var fs = require('fs')
    var m, tmp
        for(m in chat_api){
            if(0 != m.indexOf('deve')){
                chat_api[m] && (tmp = chat_api[m])
                try {
                    chat_api[m] = new Function(
                       'ret, api, req, res, next',
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

module.exports = chat
