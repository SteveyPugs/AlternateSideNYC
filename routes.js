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
		path: "/api/v3",
		handler: function(request, reply){
			object.name = "API";
			object.path = "/api/v3";
			reply(object).type("application/json");
		}
	},
	{
		method: "GET",
		path: "/api/v3/{api}",
		handler: function(request, reply){
			var name = "";
			var descrip = "";
			var link = "";
			var ex = "";
			switch(request.params.api){
				case "current":
					name = "Current Status";
					descrip = "Status for the current day";
					link = "/api/v3/status/today";
					ex = '{"name":"Todays Status","path":"/api/v3/status/today","results":{"icon":"/portal/apps/311_images/ico-parking.png","details":"Alternate side parking and meters in effect","status":"IN EFFECT","type":"Parking"}}';
					break;
				case "future":
					name = "Future Status";
					descrip = "Searching a future date's status";
					link = "/api/v3/status/find/04012015";
					ex = '{"name":"Date Look Up","path":"/api/v3/status/find/{date}","results":{"icon":"/portal/apps/311_images/ico-parking.png","details":"Alternate side parking and meters in effect","status":"IN EFFECT","type":"Parking"}}';
					break;
				case "find":
					name = "Location";
					descrip = "Searching for Alternate Side Parking Signs at Location";
					link = "/api/v3/location/queens/70 Avenue/137-10";
					ex = '{"name":"Location","path":"/api/v3/location/{boro}/{block}/{address}","results":["NO PARKING (SANITATION BROOM SYMBOL) 8:30-10AM FRI","NO PARKING (SANITATION BROOM SYMBOL) 8:30-10AM THURS"]}';
					break;
				default:
					name = "Unknown";
					descrip = "Unknown API Name";
					link = "";
					ex = "";
			}
			reply.view("api", {
				name: name,
				description: descrip,
				link: link,
				example: ex
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
		method: "GET",
		path: "/api/v3/location/{boro}/{block}/{address}",
		handler: function(request, reply){
			var object = {
				name: "Location",
				path: "/api/v3/location/{boro}/{block}/{address}"
			};
			requestn({
				uri: "https://api.cityofnewyork.us/geoclient/v1/address.json?houseNumber=" + request.params.address + "&street=" + request.params.block + "&borough=" + request.params.boro + "&app_id=" + server_config.opennycid + "&app_key=" + server_config.opennyckey,
				timeout: 100000
			}, function(error, response, body){ 
				if (!error && response.statusCode == 200) {
					var data = JSON.parse(body);
					if(data.message == undefined){
						var crossA = data.address.lowCrossStreetName1;
						var crossB = data.address.highCrossStreetName1;
						var locationfile = csv.parse(function(err, data){
							var signids = [];
							var findlocationnumbers = _.filter(data, function(row){
								if(_.contains(row, crossA)){
									if(_.contains(row, crossB)){
										if(_.contains(row, request.params.block.toUpperCase())){
											if(signids.indexOf(row[1]) === -1){
												signids.push(row[1]);
											}
										}
									}
								}
								if(_.contains(row, crossB)){
									if(_.contains(row, crossA)){
										if(_.contains(row, request.params.block.toUpperCase())){
											if(signids.indexOf(row[1]) === -1){
												signids.push(row[1]);
											}
										}
									}
								}
							});
							var signfile = csv.parse({
						 		relax: true 
							}, function(err, data){
								var signs = [];
								var findsigns = _.filter(data, function(row){
									for(var item in signids){
										if(_.contains(row, signids[item])){
											signs.push(row[3]);
										}
									}
								});
								object.results = signs;
								reply(object).type("application/json");
							});
							fs.createReadStream("./lib/data/signs.CSV").pipe(signfile);
						});
						fs.createReadStream("./lib/data/locations.CSV").pipe(locationfile);
					}
					else{
						object.results = [];
						reply(object).type("application/json");
					}
				}
				else{
					object.results = error;
					reply(object).type("application/json");
				}
			});
		}
	},
	{
		method: "*",
		path: "/{path*}",
		handler:{
			directory:{
				path: "./static/",
				listing: false,
				redirectToSlash: true
			}
		}
	}
];

exports.paths = paths;