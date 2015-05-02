var Hapi = require("hapi");
var server_config = require("./config/server").settings;
var routes = require("./routes").paths;
var alternatesidenyc_server = new Hapi.Server();
alternatesidenyc_server.connection({
	host: server_config.hostname,
	port: server_config.port
});

alternatesidenyc_server.views({
	engines:{
		html: require("handlebars"),
	},
	path: "./lib/views",
	partialsPath: "./lib/views/partials"
});

alternatesidenyc_server.route(routes);
alternatesidenyc_server.start(function(){
	console.log("Server running at:", alternatesidenyc_server.info.uri);
});