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
   ,num = 0

    return {
         mwPutWaitEvents: mwPutWaitEvents
        ,id: id
        ,list_ids: list_ids
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
                    id: null,
                    res: res,
                    queue: [ ],
                    timer: 000
                }
                num++
            }
            // NOTE: only the first `req` has data
            req.txt && id(req)// it is an initial user status

            res.on('close', (function create_on_res_close(rq){
                var sessionID = rq.sessionID, id = rq.session.user.id// closure
api._log(sessionID + ': close init')
                return function on_res_close(){
                var wn
api._log(sessionID + ': release 1')
                    if((wn = Waits[sessionID])){// mark as gone
                        wn.timer && clearTimeout(wn.timer)
                        wn.timer = 00
                        wn.res = null
                        broadcast('endwes@um', id)
api._log(sessionID + ': release 2')
                    }
                    sessionID = id = null
                }
            })(req))

            return
        }
        res.statusCode = 401// 'Unauthorized'
        res.end()
        return
    }

    function id(req){
        if(req.txt){
        // ID: `status(4 chars) + user_id@remote_addr' 'session_id`
            broadcast('usts@um',(
                Waits[req.sessionID].id = (req.txt || 'offl').slice(0, 4) +
                    req.session.user.id + '@' +
                    req.socket.remoteAddress + ' ' +
                    req.sessionID
                )
            )
        }
        return Waits[req.sessionID].id
    }

    function list_ids(){
    var sesss = new Array(num), n = 0
       ,sid

        for(sid in Waits){
            sesss[n++] = {
                _id: Waits[sid].id
            }
        }
        return sesss
    }

    function cleanup(sessionID){
    var sn
        if((sn = Waits[sessionID])){
            if(sn.timer) clearTimeout(sn.timer)
            sn.res = null
            delete Waits[sessionID]
            num--
        }
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

    function broadcast(ev, json){
        for(var id in Waits){
            queue_event(Waits[id],{ ev:ev, json:json })
        }
    }
}

module.exports = wait_events
