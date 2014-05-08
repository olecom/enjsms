api_user(ret, api, wes, req, res, next)// for `new Function(...)`
//??? maybe provide `require` module interface

function api_user(ret, api, wes, req, res, next){
    if('/user' == req.url.pathname && 'GET' == req.method){
        ret.data = wes.list_ids.call()
    }

    ret.success = true
}
