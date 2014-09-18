
module.exports = enjsms

function enjsms(api, cfg){
var name = '/enjsms/'

    api.app.use(name, api.connect['static'](__dirname + '/'))

    return { css:[ ], js:[ name + 'app_front_enjsms' ], cfg: cfg}
}
