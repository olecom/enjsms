module.exports = function errorHandler(err, req, res, next){
            if(!err) return next()
            var api = require('../api.js')

            if (err.status) res.statusCode = err.status
            if (res.statusCode < 400) res.statusCode = 500
            api._err('ErrorHandler:')
            err.url = req.url
            err = api.ipt(err, { depth: 4 }) + '\nStack:\n'
                  api.ipt(err.stack)
            api._err(err)
            res.writeHead(res.statusCode, res.ContentTypes.TextPlain)

            return res.end(err)//XXX frontend must wrap this in pretty UI
}
