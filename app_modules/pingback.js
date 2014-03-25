function pingback(api){// run external text here
    api.app.use('/pingback.js'
   ,function mwPingBack(req, res, next){
        var ret = { success: false }

        if(req.session && req.session.can['App.backend.JS'] &&
           req.body.plain_text
        ) try {
            new Function(
               'ret, api, req, res, next', req.body.plain_text
            )(
                ret, api, req, res, next
            )
            if(ret.async){
                return// user code must do all further response processing
            }
            ret.success = true
        } catch(ex){
            next(ex.stack)
            return
        }
        res.json(ret)
    })
}

module.exports = pingback
