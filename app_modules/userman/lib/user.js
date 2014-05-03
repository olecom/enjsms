function api_user(ret, api, req, res, next){
var log = api._log, ipt = api.ipt

    log('user req.url: ' + req.url)
    log('user req.method: ' + req.method)
    log('user req.json: ' + ipt(req.json))

    ret.success = true
}

api_user(ret, api, req, res, next)// for `new Function(...)`
//??? maybe provide `require` module interface
