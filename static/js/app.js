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
				$("#" + date + "_row").addClass("text-danger");
			}
			else{
				$("#" + date + "_row").addClass("text-success");
			}		
		}).error(function(data, status, headers, config) {
			console.log(data);
		});
	};
});