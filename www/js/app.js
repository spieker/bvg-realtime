// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('MainCtrl', ['$scope', '$ionicModal', function($scope, $ionicModal) {
  var stations = [];
  $scope.result = [];
  $scope.currentItem = null;

  $ionicModal.fromTemplateUrl('info-popover.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalAbout = modal;
  });

  $ionicModal.fromTemplateUrl('bvg-realtime-popover.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function(item) {
    $scope.currentItem = item;
    $scope.modal.show().then(function() {
      $('#info').attr('src', 'http://fahrinfo.bvg.de/Fahrinfo/bin/stboard.bin/dn?start=1&boardType=depRT&input='+item.tags.name);
    });
  };

  $scope.openAbout = function() {
    $scope.modalAbout.show()
  };

  $scope.closeAbout = function() {
    $scope.modalAbout.hide()
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  //window.opApiResult = function(data) {
  //  alert(1);
  //  stations = data.elements;
  //}

  $.ajax({
    url: 'http://www.overpass-api.de/api/interpreter?data=[out:json];rel[network=VBB][operator=BVG];node(r);out;&jsonp=opApiResult',
    type: 'get',
    dataType: 'jsonp',
    jsonp: false,
    jsonpCallback: 'opApiResult',
    cache: true
  }).success(function(data) {
    stations = data.elements;
    $scope.findBusStop();
  }).error(function() {
    alert('Error fetching bus stops!');
  });

  $scope.findBusStop = function() {
    try {
      navigator.geolocation.getCurrentPosition(function(position) {
        // distance calculation
        var result = $.map(stations, function(e) {
          try {
            e.distance = geolib.getDistance(position.coords, {
              latitude: e.lat,
              longitude: e.lon
            });
          } catch(err) {
            return null;
          }
          return e;
        });

        // sort
        result = result.sort(function(a, b) {
          return a.distance-b.distance;
        });

        // get nearest sub-set
        result = result.slice(0, 50);

        // filter
        var usedNames = [];
        result = $.grep(result, function(e) {
          if (usedNames.indexOf(e.tags.name) > -1) {
            return false;
          }
          usedNames.push(e.tags.name);
          return true
        });

        $scope.result = result.slice(0, 10);
        $scope.$apply()
      }, function(error) { // on geo position error
        alert('Location error: '+error.message);
      });
    } catch(e) {
      alert(e);
    }
  }
}])
