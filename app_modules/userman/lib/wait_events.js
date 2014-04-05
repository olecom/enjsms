function wait_events(api){
var Waits = {// pool of waiting server events `req`uests from UI
/*
 * Waits = {
 *     'sessionID#1': {
 *          res: res,
 *          queue: [ ],
 *          timer: 000
 *     }
 * }
 **/
    }

    return {
         mwPutWaitEvents:  mwPutWaitEvents
        ,broadcast: broadcast
        ,cleanup: cleanup
    }

    function mwPutWaitEvents(req, res){
        var w
        if(req.session){
            if((w = Waits[req.sessionID])){
                if(w.res){// release pending
                    w.res.statusCode = 503// 'Service Unavailable'
                    w.res.end()
                }
                w.res = res// assign new one
            } else {
                Waits[req.sessionID] = {
                    res: res,
                    queue: [ ],
                    timer: 000
                }
            }
            res.on('close', (function create_on_res_close(rq){
                var sessionID = rq.sessionID, id = rq.session.user.id// closure
                api._log(sessionID + ': close init')
                return function on_res_close(){
                    api._log(sessionID + ': release 1')
                    if((w = Waits[sessionID])){// mark as gone
                        w.timer && clearTimeout(w.timer)
                        w.timer = 00
                        w.res = null
                        broadcast('close', id)
                        api._log(sessionID + ': release 2')
                    }
                }
            })(req))
            return
        }
        res.statusCode = 401// 'Unauthorized'
        res.end()
        return
    }

    function cleanup(sessionID){
        var sn = Waits[sessionID]
        if(sn.timer) clearTimeout(sn.timer)
        sn.res = null
        delete Waits[sessionID]
    }

    function queue_event(session, ev){
        session.queue.push(ev)
        if(!session.timer){
            session.timer = setTimeout((function create_wait_queue_flush(sn){
                return function wait_queue_flush(){
                    if(sn.res){
                        sn.res.json(sn.queue.splice(0))
                        sn.res = null
                        sn.timer = 00
                    } else {// wait for `res` to be ready a bit later
                        setTimeout(wait_queue_flush, 512)
                    }
                }})(session), 512
            )
        }
    }

    function broadcast(op, msg){
        for(var id in Waits){
            queue_event(Waits[id], { op:op, msg:msg })
        }
    }
}

module.exports = wait_events
