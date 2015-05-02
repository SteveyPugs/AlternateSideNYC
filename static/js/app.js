var app = angular.module("AltSideNYC", []);

app.controller("TodayCtrl", function($scope, $http){
	$scope.CurrentDate = moment().format("MMMM Do YYYY");
	$scope.CurrentStatus = "......";
	$http.get("/api/v3/status/today").success(function(data, status, headers, config){
		if(data.results.status === "SUSPENDED" || data.results.status === "NOT IN EFFECT"){
			$scope.CurrentStatus = data.results.status;
			$("#CurrentStatus").addClass("text-danger");
		}
		else{
			$scope.CurrentStatus = data.results.status;
			$("#CurrentStatus").addClass("text-success");

		}		
	}).error(function(data, status, headers, config) {
		$scope.CurrentStatus = "Status Not Found";
	});
});

app.controller("FutureCtrl", function($scope, $http){
	$scope.calendar = [];
	$http.get("http://api.wunderground.com/api/63ab9284c0654cf5/forecast10day/q/NY/NYC.json").success(function(data, status, headers, config){
		for(var i = 1; i <= 9; i++){
			var row = {};
			var dayabbr = moment().add(i, "d").format("Do");
			row.col1 = dayabbr;
			row.col1b = moment().add(i, "d").format("MMDDYYYY");
			row.col2a = data.forecast.simpleforecast.forecastday[i].high.fahrenheit + " F / " + data.forecast.simpleforecast.forecastday[i].low.fahrenheit + " F";
			row.col2b = data.forecast.simpleforecast.forecastday[i].icon_url
			$scope.calendar.push(row);
		};
	}).error(function(data, status, headers, config) {
		console.log(data);
	});
	$scope.checkDay = function(date){
		$http.get("/api/v3/status/find/" + date).success(function(data, status, headers, config){
			$("#" + date + "_status").text(data.results.status);
			if(data.results.status === "SUSPENDED" || data.results.status === "NOT IN EFFECT"){
				$("#" + date + "_row").addClass("danger");
			}
			else{
				$("#" + date + "_row").addClass("success");
			}		
		}).error(function(data, status, headers, config) {
			console.log(data);
		});
	};
});

app.controller("MapCtrl", function($scope, $http){
	var map;
	var markers = [];
	var autocomplete;
	geocoder = new google.maps.Geocoder();
	$scope.signs = [];
	$scope.findSigns = function(results){
		var house = results.address_components[0].long_name;
		if(house.match(/-/g) !== null && house.match(/-/g).length > 1){
			house = house.substring(0, house.indexOf("-",0)) + "-0";
		}
		var block = results.address_components[1].long_name;
		if ((block.indexOf("maspeth") == -1) || (block.indexOf("north") == -1) || (block.indexOf("south") == -1)){
			block = block.replace("th","");
		}
		var boro = results.address_components[3].long_name;
		$http.get("/api/v3/location/" + boro + "/" + block + "/" + house).success(function(data, status, headers, config){
			$("#loadtext").addClass("hide");
			if(data.results.length > 0){
				$scope.signs = data.results;
			}
			else{
				$scope.signs = ["No Signs Found at the Location"];
			}			
		}).error(function(data, status, headers, config) {
			console.log(data);
		});
	}
	function initialize(){
		var mapOptions = {
			zoom: 16,
			disableDefaultUI: true,
			draggable: false
		};
		map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(function(position){
				var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				var marker = new google.maps.Marker({
					position: pos,
					map: map
				});
				markers.push(marker);
				map.setCenter(pos);

				geocoder.geocode({
					"latLng": pos
				}, function(results, status){
					if(status == google.maps.GeocoderStatus.OK){
						$scope.findSigns(results[0]);
					}
				});
			}, function(){
				handleNoGeolocation(true);
			});
		}
		else{
			handleNoGeolocation(false);
		}

		autocomplete = new google.maps.places.Autocomplete(/** @type {HTMLInputElement} */(document.getElementById("searchsign")), {
			types: ["geocode"]
		});
		google.maps.event.addListener(autocomplete, "place_changed", function(){
			searchLocation(document.getElementById("searchsign").value);
		});
	}
	function setAllMap(map){
		for (var i = 0; i < markers.length; i++){
			markers[i].setMap(map);
		}
	}
	function clearMarkers(){setAllMap(null);}
	function deleteMarkers(){
		clearMarkers();
		markers = [];
	}
	function searchLocation(location){
		$("#loadtext").removeClass("hide");
		$scope.signs = [];
		geocoder.geocode({
			"address" : location
		}, function(results, status){
			if(status == google.maps.GeocoderStatus.OK){
				deleteMarkers();
				map.setCenter(results[0].geometry.location);
				var marker = new google.maps.Marker({
					map: map,
					position: results[0].geometry.location
				});
				markers.push(marker);
				$scope.findSigns(results[0]);
			}
		});
	}
	function handleNoGeolocation(errorFlag){
		if(errorFlag){
			var content = "Error: The Geolocation service failed.";
		}
		else{
			var content = "Error: Your browser doesn\'t support geolocation.";
		}

		var options = {
			map: map,
			position: new google.maps.LatLng(60, 105),
			content: content
		};

		var infowindow = new google.maps.InfoWindow(options);
		map.setCenter(options.position);
	}
	google.maps.event.addDomListener(window, "load", initialize);
});