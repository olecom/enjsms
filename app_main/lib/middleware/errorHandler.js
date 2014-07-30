function errorHandler(err, req, res, next){
    if(!err) return next()
    if (err.status) res.statusCode = err.status
    if (res.statusCode < 400) res.statusCode = 500
    log('errorHandler: ', err.stack || err), log('URL: ' + req.url)

    return res.json({ url: req.url, err: err.stack || err })// frontend must wrap this in pretty UI
}

module.exports = errorHandler
