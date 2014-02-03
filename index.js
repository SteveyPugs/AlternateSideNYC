var Hapi = require('hapi')
var masterConfig = require('./config/config')
var server = new Hapi.Server(masterConfig.config.hostname, masterConfig.config.port)

var site = function(request,reply){
	reply.view("index")
}

server.route([
 	{method: 'GET', path: '/', config: { handler: site }},
 	{method: '*', path: '/{path*}', handler: { directory: { path: './static/', listing: false, redirectToSlash: true } } }
])


 server.views({
     engines: {
         html: 'handlebars'            
     },
     path: './lib/views',
 })

server.start(function(){
	console.log('Server Started at: ' + server.info.uri);
})