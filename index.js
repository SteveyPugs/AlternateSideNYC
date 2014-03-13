var Hapi = require('hapi')
var masterConfig = require('./config/config')
var server = new Hapi.Server(masterConfig.config.hostname, masterConfig.config.port)

server.route([
 	{method: '*', path: '/{path*}', handler: { directory: { path: './static/', listing: false, redirectToSlash: true } } }
])

server.start(function(){
	console.log('Server Started at: ' + server.info.uri);
})