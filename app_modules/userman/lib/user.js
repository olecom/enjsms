api_user(ret, api, req, res, next)// for `new Function(...)`
//??? maybe provide `require` module interface

function api_user(ret, api, req, res, next){
var log = api._log, ipt = api.ipt

    if('/user' == req.url.pathname && 'GET' == req.method){
        ret.data = user_list()
    }

    ret.success = true
}

function user_list(){
    return [
        { _id: 'onliolecom@127.0.0.1 '+ req.sessionID, date: '2009-09-28T19:03:12Z' }
       ,{ _id: 'onli123', date: '2009-09-28T19:03:12Z' }
       ,{ _id: 'onli23', date: '2009-09-28T19:03:12Z' }
       ,{ _id: 'onli3', date: '2009-09-28T19:03:12Z' }
       ,{ _id: 'onli1', date: '2009-09-28T19:03:12Z' }
    ]
}
