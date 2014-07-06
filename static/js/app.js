var app = angular.module('AlternateSideNYC',[]);
app.controller("todayController",function($scope,$http){
  $scope.date = moment().format("MMMM Do YYYY");
  var httpMethods = {
    method: "GET",
    url: "http://api.alternatesidenyc.com/date"
  };
  $http(httpMethods).success(function(data, status, headers, config) {
    if (data === "IN EFFECT"){
      $(".status").css("color","green");
      $scope.status = data;
    }
    else{
      $(".status").css("color","red");
      $scope.status = data;
    }
  });
});

app.controller("scheduleController",function($scope,$http){
  $scope.data = [];
  $scope.weather = [];
  var httpMethods = {
    method: "GET",
    url: "http://api.alternatesidenyc.com/weather"
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
        url: "http://api.alternatesidenyc.com/date/" + moment().add('days', i).format("YYYY") + "/" + moment().add('days', i).format("MM") + "/" + moment().add('days', i+1).format("DD"),
        async: false,
        success: function(reply){
          row.dateStatus = reply;
          if(reply === "IN EFFECT"){
            row.class = "success";
          }
          else{
            row.class = "danger";
          }
        }
      });
      $scope.data.push(row);
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
            url: "http://api.alternatesidenyc.com/signs/" + town + "/" + road + "/"  + street_address
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
              url: "http://api.alternatesidenyc.com/signs/" + town + "/" + road + "/"  + street_address
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