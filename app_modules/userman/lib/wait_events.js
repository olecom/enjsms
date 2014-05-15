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
        ,set_id: set_id
        ,get_id: get_id
        ,list_ids: list_ids
        ,broadcast: broadcast
        ,cleanup: cleanup
    }

    function mwPutWaitEvents(req, res){
    var w, s
        if(req.session){
            res.on('close', (function create_on_res_close(rq){
                var sessionID = '' + rq.sessionID// closure, copy string
                return function on_res_close(){
                var wn
                    if((wn = Waits[sessionID])){// mark as gone
                        wn.timer && clearTimeout(wn.timer)
                        wn.timer = 00
                        wn.res = null
                        wn.id = 'offl' + wn.id.slice(4)//TODO: GC res=null && offl
                        //broadcast('endwes@um', wn.id, req.sessionID)
                    }
                    sessionID = null
                }
            })(req))

            s = [{ ev: 'usts@um', json: '' }]
            if((w = Waits[req.sessionID])){// wes exists
                if(!req.txt){// there must be current user status in every wes `req`
                    s = [{
                        ev: 'errdev@um',
                        json: '/um/lib/wait_events: `req.txt` is empty'
                    }]
                    if(w.res){// use pending res
                        w.res.statusCode = 501// "Not Implemented"
                        w.res.json(s)
                    } else {// or current
                        res.statusCode = 501
                        res.json(s)
                    }
                    return
                }
                s[0].json = set_id(req)
                if(w.res){// release pending
                    // UI set status
                    w.res.json(s)// NOTE: res.on('close') sets status to `offline`
                    broadcast('usts@um', set_id(req), req.sessionID)// sets id back
                }
                // assign new waiting cycle
                w.res = res
                return// faster path
            }
            // new wes for new session
            Waits[req.sessionID] = {
                id: null,
                res: null,// firts `res` is being sent back with status confirm-n
                queue: [ ],
                timer: 000
            }
            num++
            s[0].json = set_id(req)
            // UI init status
            res.json(s)// NOTE: res.on('close') sets status to `offline`
            broadcast('usts@um', set_id(req), req.sessionID)// sets id back
            return
        }
        res.statusCode = 401// 'Unauthorized'
        res.end()
        return
    }

    function set_id(req){
        // ID: `status(4 chars) + user_id@remote_addr' 'session_id`
        return Waits[req.sessionID].id = (req.txt || 'onli').slice(0, 4) +
            req.session.user.id + '@' +
            req.socket.remoteAddress + ' ' +
            req.sessionID
    }

    function get_id(req){
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
            session.timer = setTimeout(
                (function create_wait_queue_flush(sn){
                    return function wait_queue_flush(){
                        if(sn.res){
                            sn.res.json(sn.queue.splice(0))
                            sn.res = null
                            sn.timer = 00
                        } else {// wait for `res` to be ready a bit later
                            setTimeout(wait_queue_flush, 512)
                        }
                    }
                })(session)
                ,512
            )
        }
    }

    function broadcast(ev, json){
        for(var id in Waits){
            queue_event(Waits[id],{ ev:ev, json:json })
        }
        return json
    }
}

module.exports = wait_events
