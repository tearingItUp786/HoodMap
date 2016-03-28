var hoodCoordinates = {
  lat: 49.246292,
  lng: -123.116226
};
var geocoder;
var map;
var infoBox;

function loadScript(callback) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBGpIQbpJCEJPolgUzC8Qnw9vhLfJl6HM8&signed_in=true&libraries=places";
  document.body.appendChild(script);
  script.onload = function() {
    var scriptInfoBox = document.createElement("script");
    scriptInfoBox.type = "text/javascript";
    scriptInfoBox.src = "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/src/infobox_packed.js";
    document.body.appendChild(scriptInfoBox);
    scriptInfoBox.onload = callback;
  };
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: hoodCoordinates,
    disableDefaultUI: true
  });

  geocoder = new google.maps.Geocoder();

  var boxOptions = {
    disableAutoPan: false,
    maxWidth: 0,
    pixelOffset: new google.maps.Size(-140, 0),
    zIndex: null,
    boxStyle: {
      background: "url('http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/examples/tipbox.gif') no-repeat",
      opacity: 0.75,
      width: "400px",
      padding: "10px"
    },
    closeBoxMargin: "8px 2px 2px 2px",
    closeBoxURL: "../images/square.png",
    infoBoxClearance: new google.maps.Size(1, 1),
    isHidden: false,
    pane: "floatPane",
    enableEventPropagation: false,
  };

  infoBox = new InfoBox(boxOptions);
  setTimeout(drawMarkers, 1500);
  google.maps.event.addListener(infoBox, 'closeclick', function() {
    myListView.currentPlace(null);
  });

  google.maps.event.addListener(map, 'click', function(e) {
    contextmenu: true
  });
}

function drawMarkers() {
  for (var i = 0; i < myListView.placeList().length; i++) {
    var thePlace = myListView.placeList()[i];
    console.log("in for loop");
    var marker = new google.maps.Marker({
      position: {
        lat: thePlace.latitude(),
        lng: thePlace.longitude()
      }
    });

    thePlace.marker = marker;
    thePlace.marker.setMap(map);

    google.maps.event.addListener(thePlace.marker, 'click', (function(iCopy) {
      return function() {
        thePlace = myListView.placeList()[iCopy];
        myListView.currentPlace(thePlace);
        map.setCenter(thePlace.marker.getPosition());
        var boxText = document.createElement("div");
        boxText.id = 'ib-container';
        boxText.innerHTML =
          '<div class="header"><h1>' + thePlace.name() + '</h1>' + '<h2>' + thePlace.display_phone() + '</h2><h3 class="sub-title">' + thePlace.location() + '</h3>' + '</div>' +
          '<div class="ib-content">' + '<h3><a href="' + thePlace.mobile_url() + '">Yelp It!</a></h3>' + '<p>' + thePlace.snippet_text() + '</p><img src="' + thePlace.imageURL() + '"/></div>';
        infoBox.setContent(boxText);
        infoBox.open(map, this);
      };
    })(i));
  }
}

var Place = function(data) {
  var self = this;
  this.name = ko.observable(data.name);
  this.location = ko.observable(data.location.display_address);
  this.latitude = ko.observable(data.location.coordinate.latitude);
  this.longitude = ko.observable(data.location.coordinate.longitude);
  this.imageURL = ko.observable(data.image_url);
  this.snippet_text = ko.observable(data.snippet_text);
  this.mobile_url = ko.observable(data.mobile_url);
  this.display_phone = ko.observable(data.display_phone);
  this.rating = ko.observable(data.rating);
  this.active = ko.observable(false);

};

var ListviewModel = function() {
  var self = this;
  self.placeList = ko.observableArray([]);
  self.currentPlace = ko.observable();

  (function assignData() {
    retrieveYelpData("", "", function(data) {
      console.log(data);
      data.forEach(function(place) {
        var aPlace = new Place(place);
        self.placeList.push(aPlace);
      });
    });
  })();

  self.displayInfo = function(place) {
    google.maps.event.trigger(place.marker, 'click');
  };

  self.styling = function(place) {
    if (place === self.currentPlace()) {
      return 'active';
    } else {
      return '';
    }
  };

  self.toggle = function(place) {
    if (place === self.currentPlace()) {
      self.currentPlace().active(!self.currentPlace().active());
    }
  };

};

function retrieveYelpData(uterm, ulocation, aFunc) {
  $.ajax({
    url: "php/sample.php",
    async: true,
    type: "POST",
    data: {
      term: uterm,
      location: ulocation
    },
    dataType: "json",
    success: function(data) {
      aFunc(data.businesses);

    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
      alert("Ajax called failed. Markers will not be made");
    }
  });
}

function codeAddress(callback) {
  console.log("in code");
  var address = document.getElementById("location").value;
  geocoder.geocode({
    'address': address
  }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      callback();
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}


function setMapOnAll(map) {
  for (var i = 0; i < myListView.placeList().length; i++) {
    myListView.placeList()[i].marker.setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

function parseForm() {

  var loc = document.getElementById('location').value;
  var term = document.getElementById('yterm').value;
  console.log(loc);

  retrieveYelpData(term, loc, function(data) {
    console.log(data);
    clearMarkers();
    myListView.placeList.removeAll();
    data.forEach(function(place) {
      var aPlace = new Place(place);
      myListView.placeList.push(aPlace);
    });
    codeAddress(drawMarkers);
  });

}
loadScript(initMap);
myListView = new ListviewModel();
ko.applyBindings(myListView);
