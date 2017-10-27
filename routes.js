var requestn = require("request");
var server_config = require("./config/server").settings;
var async = require("async");
var csv = require("csv");
var _ = require("underscore");
var fs = require("fs");

var paths = [
	{
		method: "GET",
		path: "/",
		handler: function(request, reply){
			reply.view("index", {
				api: true
			});
		}
	},
	{
		method: "GET",
		path: "/api/v3/status/today",
		handler: function(request, reply){
			var object = {
				name: "Todays Status",
				path: "/api/v3/status/today"
			};
			requestn({
				uri: "https://api.cityofnewyork.us/311/v1/municipalservices?app_id=" + server_config.nyc311id + "&app_key=" + server_config.nyc311key,
				timeout: 100000
			}, function(error, response, body){
				if(!error && response.statusCode == 200 && JSON.parse(body).items[0].items !== undefined){
					object.results = JSON.parse(body).items[0].items[0];
				}
				else{
					object.results = error;
				}
				reply(object).type("application/json");
			});	
		}
	},
	{
		method: "GET",
		path: "/api/v3/status/find/{date}",
		handler: function(request, reply){
			var object = {
				name: "Date Look Up",
				path: "/api/v3/status/find/{date}"
			};
			requestn({
				uri: "https://api.cityofnewyork.us/311/v1/municipalservices?app_id=" + server_config.nyc311id + "&app_key=" + server_config.nyc311key + "&startDate=" + request.params.date + "&endDate=" + request.params.date,
				timeout: 100000
			}, function(error, response, body){
				if(!error && response.statusCode == 200 && JSON.parse(body).items[0].items !== undefined){
					object.results = JSON.parse(body).items[0].items[0];
				}
				else{
					object.results = error;
				}
				reply(object).type("application/json");
			});
		}
	},
	{
		method: "*",
		path: "/{path*}",
		handler:{
			directory:{
				path: ["./node_modules/", "./static/"],
				listing: false,
				redirectToSlash: true
			}
		}
	}
];

exports.paths = paths;