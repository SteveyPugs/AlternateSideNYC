$(document).ready(function(){
  $(".ASPContent").slick({
    arrows: false
  });
  $("#Today").click(function(){
    $(".ASPContent").slickGoTo(0);
  });
  $("#9Day").click(function(){
    $(".ASPContent").slickGoTo(1);
  });
  $("#Future").click(function(){
    $(".ASPContent").slickGoTo(2);
  });
  $("#Location").click(function(){
    $(".ASPContent").slickGoTo(3);
  });
  $("#About").click(function(){
    $(".ASPContent").slickGoTo(4);
  });
});

var app = angular.module('AlternateSideNYC',[]);
app.controller("todayController",function($scope,$http){
  $scope.month = moment().format("MMMM");
  $scope.day = moment().format("Do");
  $scope.daynum = moment().format("DD");
  $scope.year = moment().format("YYYY");
  var httpMethods = {
    method: "GET",
    url: "http://api.alternatesidenyc.com/Dates/" + $scope.year + "/" + $scope.month + "/" + $scope.daynum
  };
  $http(httpMethods).success(function(data, status, headers, config) {
    if (data.length == 0){
      $("#status").css("color","green");
      $scope.status = "Alternate Side Parking is in Effect Today";
    }
    else{
      $("#status").css("color","red");
      $scope.status = "Alternate Side Parking is not in Effect Today";
    }
  });
});

app.controller("scheduleController",function($scope,$http){
  $scope.data = [];
  $scope.weather = [];
  var httpMethods = {
    method: "GET",
    url: "http://api.alternatesidenyc.com/WeatherForecast"
  };
  $http(httpMethods).success(function(data, status, headers, config) {
    var len = data.forecast.simpleforecast.forecastday.length;
    for(var x = 1; x <= len-1; x++){
      var weatherInner = [];
      weatherInner[0] = data.forecast.simpleforecast.forecastday[x].high.fahrenheit;
      weatherInner[1] = data.forecast.simpleforecast.forecastday[x].low.fahrenheit;
      weatherInner[2] = data.forecast.simpleforecast.forecastday[x].icon_url;
      $scope.weather.push(weatherInner);
    }
    for (var i = 0; i < 9; i++){
      row = {};
      row.date = moment().add('days', i+1).format("MMM") + " " + moment().add('days', i+1).format("DD");
      row.weatherText = $scope.weather[i][0] + "/" + $scope.weather[i][1];
      row.weatherPicture = $scope.weather[i][2];
      $.ajax({
        url: "http://api.alternatesidenyc.com/Dates/" + moment().add('days', i).format("YYYY") + "/" + moment().add('days', i).format("MM") + "/" + moment().add('days', i+1).format("DD"),
        async: false,
        success: function(reply){
          if(reply.length === 0){
            row.dateStatus = "YES";
          }
          else{
            row.dateStatus = "NO";
          }
        }
      });
      $scope.data.push(row);
    }
  });
});

app.controller("daysOffController",function($scope,$http){
  var httpMethods = {
    method: "GET",
    url: "http://api.alternatesidenyc.com/Dates"
  };
  $http(httpMethods).success(function(data, status, headers, config) {
    $scope.data = [];
    var counter = 0;
    for (var i = 1; i < data.length; i++){
      var isBefore = moment(moment(data[i].CancelDate).add('days', 1).format('MM/DD/YYYY')).isBefore(moment().format('YYYY-MM-DD'));
      if (!isBefore){
        row = {};
        if (data[i] !== undefined){
          row.col1a = data[i].CancelName;
          row.col1b = moment(data[i].CancelDate).add('days', 1).format('dddd MMMM Do, YYYY');
        }
        if (data[i+1] !== undefined){
          row.col2a = data[i+1].CancelName;
          row.col2b = moment(data[i+1].CancelDate).add('days', 1).format('dddd MMMM Do, YYYY');
        }
        i = i + 1;
        $scope.data.push(row);
      }
    }
  });
});

app.controller("mapController",function($scope,$http){
  function initialize(){
    var markers = [];
    var mapOptions = {
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      draggable: false,
      scaleControl: false,
      scrollwheel: false,
      navigationControl: true,
      streetViewControl: false,
      panControl: false,
      zoomControl: false,
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){
        var pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        var httpMethods = {
          method: "GET",
          url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&sensor=true"
        };
        $http(httpMethods).success(function(data, status, headers, config) {
          //console.log(data)
          var street_address = data.results[0].address_components[0].long_name;
          var count = street_address.match(/-/g);
          if (count !== null && count.length > 1){
            street_address = street_address.substring(0, street_address.indexOf("-",0)) + "-0";
          }
          var road = data.results[0].address_components[1].long_name;
          if ((road.indexOf("maspeth") == -1) || (road.indexOf("north") == -1) || (road.indexOf("south") == -1)){
            road = road.replace("th","");
          }
          var town = data.results[0].address_components[3].long_name;
          var state = data.results[0].address_components[5].long_name;
          var zipcode = data.results[0].address_components[7].long_name;
          var httpMethods = {
            method: "GET",
            url: "http://api.alternatesidenyc.com/Signs/" + town + "/" + road + "/"  + street_address
          };
          $http(httpMethods).success(function(data, status, headers, config) {
            if (data.length > 0){
              if(data[0] !== undefined){
                if(data[0].SignDetails !== undefined){
                  $scope.Sign1 = data[0].SignDetails;
                }
                else{
                  $scope.Sign1 = "NO SIGN AVAILABLE";
                }
                $scope.Side1 = data[0].SideOfBlock;
              }
              else{
                $scope.Sign1 = "NO SIGN AVAILABLE";
                $scope.Side1 = "N/A";
              }
              if(data[1] !== undefined){
                if(data[1].SignDetails !== undefined){
                  $scope.Sign2 = data[1].SignDetails;
                }
                else{
                  $scope.Sign2 = "NO SIGN AVAILABLE";
                }
                $scope.Side2 = data[1].SideOfBlock;
              }
              else{
                $scope.Sign2 = "NO SIGN AVAILABLE";
                $scope.Side2 = "N/A";
              }
            }
            else{
              $scope.Sign1 = "NO SIGN AVAILABLE";
              $scope.Side1 = "N/A";
              $scope.Sign2 = "NO SIGN AVAILABLE";
              $scope.Side2 = "N/A";
            }
          });
        });



        var marker = new google.maps.Marker({position: pos,map: map});
        map.setCenter(pos);
        var input = /** @type {HTMLInputElement} */(document.getElementById('pac-input'));
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        var searchBox = new google.maps.places.SearchBox(/** @type {HTMLInputElement} */(input));  
        
        google.maps.event.addListener(searchBox, 'places_changed', function() {

          var places = searchBox.getPlaces();
          for (var i = 0, marker; marker = markers[i]; i++) {
            marker.setMap(null);
          }

          // For each place, get the icon, place name, and location.
          markers = [];
          var bounds = new google.maps.LatLngBounds();
          for (var i = 0, place; place = places[i]; i++) {
            var image = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };
            // Create a marker for each place.
            var marker = new google.maps.Marker({
              map: map,
              icon: image,
              title: place.name,
              position: place.geometry.location
            });

            markers.push(marker);
            bounds.extend(place.geometry.location);
          }

          var pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
          var httpMethods = {
            method: "GET",
            url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + markers[0].position.lat() + "," + markers[0].position.lng() + "&sensor=true"
          };
          $http(httpMethods).success(function(data, status, headers, config) {
            //console.log(data)
            var street_address = data.results[0].address_components[0].long_name;
            var count = street_address.match(/-/g);
            if (count !== null && count.length > 1){
              street_address = street_address.substring(0, street_address.indexOf("-",0)) + "-0";
            }
            var road = data.results[0].address_components[1].long_name;
            if ((road.indexOf("maspeth") == -1) || (road.indexOf("north") == -1) || (road.indexOf("south") == -1)){
              road = road.replace("th","");
            }
            var town = data.results[0].address_components[3].long_name;
            var state = data.results[0].address_components[5].long_name;
            var zipcode = data.results[0].address_components[7].long_name;
            var httpMethods = {
              method: "GET",
              url: "http://api.alternatesidenyc.com/Signs/" + town + "/" + road + "/"  + street_address
            };
            $http(httpMethods).success(function(data, status, headers, config) {
              if (data.length > 0){
                if(data[0] !== undefined){
                  if(data[0].SignDetails !== undefined){
                    $scope.Sign1 = data[0].SignDetails;
                  }
                  else{
                    $scope.Sign1 = "NO SIGN AVAILABLE";
                  }
                  $scope.Side1 = data[0].SideOfBlock;
                }
                else{
                  $scope.Sign1 = "NO SIGN AVAILABLE";
                  $scope.Side1 = "N/A";
                }
                if(data[1] !== undefined){
                  if(data[1].SignDetails !== undefined){
                    $scope.Sign2 = data[1].SignDetails;
                  }
                  else{
                    $scope.Sign2 = "NO SIGN AVAILABLE";
                  }
                  $scope.Side2 = data[1].SideOfBlock;
                }
                else{
                  $scope.Sign2 = "NO SIGN AVAILABLE";
                  $scope.Side2 = "N/A";
                }
              }
              else{
                $scope.Sign1 = "NO SIGN AVAILABLE";
                $scope.Side1 = "N/A";
                $scope.Sign2 = "NO SIGN AVAILABLE";
                $scope.Side2 = "N/A";
              }
            });
          });

          map.fitBounds(bounds);
          });
      }, function(){
        handleNoGeolocation(true);
      });
    }
    else{
      handleNoGeolocation(false);
    }
  }
  function handleNoGeolocation(errorFlag) {
    var content;
    if (errorFlag) {
      content = 'Error: The Geolocation service failed.';
    }
    else{
      content = 'Error: Your browser doesn\'t support geolocation.';
    }
    var options = {map: map, position: new google.maps.LatLng(60, 105), content: content}
    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
  }
  google.maps.event.addDomListener(window, 'load', initialize);
});