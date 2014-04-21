function enjsms(api, cfg){
    var name = '/enjsms/'

    api.cfg.extjs.load.requireLaunch.push(name + 'app_front_enjsms')
    api.app.use(name, api.connect['static'](__dirname + '/'))
}

module.exports = enjsms
