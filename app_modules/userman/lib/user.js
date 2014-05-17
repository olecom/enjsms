api_user(ret, api, local, req, res, next)// for `new Function(...)`

/*
 * Event(s):
 *   all heavy lifting of user management is done in `wait_events.js`
 *   as part of user auth/out and status event handling
 **/

function api_user(ret, api, local, req, res, next){
    if('/user' == req.url.pathname && 'GET' == req.method){
        ret.data = local.wes.list_ids.call()
    }

    ret.success = true
}
