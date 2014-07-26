function errorHandler(err, req, res, next){
    if(!err) return next()
    if (err.status) res.statusCode = err.status
    if (res.statusCode < 400) res.statusCode = 500

    err = 'ErrorHandler URL: ' + req.url + '\n' + err + (
        err.stack ? '\nStack:\n' + err.stack : ''
    )
    log(err)
    res.writeHead(res.statusCode, res.ContentTypes.TextPlain)

    return res.end(err)//XXX frontend must wrap this in pretty UI
}

module.exports = errorHandler
