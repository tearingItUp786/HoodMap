//legacy code
// function initMap() {
//   var map = new google.maps.Map(document.getElementById('map'), MapModel.mapOptions);
//   var infowindow = new google.maps.InfoWindow();
//
//   var service = new google.maps.places.PlacesService(map);
//   service.nearbySearch(MapModel.serviceOptions, callback);
//
//   function callback(results, status) {
//     if (status == google.maps.places.PlacesServiceStatus.OK) {
//       for (var i = 0; i < results.length; i++) {
//         var place = results[i];
//         createMarker(results[i]);
//       }
//     }
//   }
//
//   function createMarker(place) {
//     var marker = new google.maps.Marker({
//       position: place.geometry.location,
//       map: map,
//     });
//
//     google.maps.event.addListener(marker, 'click', function() {
//       infowindow.setContent(place.name + "<br/>" + place.vicinity);
//       console.log(place);
//       infowindow.open(map, this);
//     });
//
//   }
//
// }
