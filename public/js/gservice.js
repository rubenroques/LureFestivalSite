

// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
    .factory('gservice', function($rootScope, $http, $filter){



        var blue_marker_icon = {
            url: "./images/blue_marker.png",

            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17.5,35),
            scaledSize: new google.maps.Size(35,35)
        };

        var pink_marker_icon = {
            url: "./images/pink_marker.png",

            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17.5,35),
            scaledSize: new google.maps.Size(35,35)
        };

        var ball_marker_icon = {
            url: "./images/ball_marker.png",

            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17.5,35),
            scaledSize: new google.maps.Size(35,35)
        };


        // Constructor for generic location
        var LocationPoint = function(latlon, name, startDateTime, endDateTime,infoWindowString) {
            this.latlon = latlon;
            this.name = name;
            this.startDateTime = startDateTime;
            this.endDateTime = endDateTime;
            this.infoWindowString = infoWindowString;
        };



        // Initialize Variables
        // -------------------------------------------------------------
        // Service our factory will return
        var googleMapService = {};
        googleMapService.clickLat  = 0;
        googleMapService.clickLong = 0;

        // Array of locations obtained from API calls
        var locations = [];

        // Variables we'll use to help us pan to the right spot
        var lastMarker;
        var lastInfoWindow;
        var currentSelectedMarker;
        var initialZoomLevel = 15;

        // User Selected Location (initialize to center in Central Park)
        var selectedLat = 40.78286470;
        var selectedLong = -73.96535510;

        if (localStorage) {

            var lastUserLatitude = localStorage.getItem('lastUserLatitude');
            var lastUserLongitude = localStorage.getItem('lastUserLongitude');

            if ((lastUserLatitude != "undefined" && lastUserLatitude  != "null")  && (lastUserLongitude != "undefined" && lastUserLongitude  != "null"))  {
                selectedLat = lastUserLatitude;
                selectedLong = lastUserLongitude;
            }
        }

        // Functions
        // --------------------------------------------------------------
        // Refresh the Map with new data. Takes three parameters (lat, long, and filtering results)
        googleMapService.refresh = function(latitude, longitude, filteredResults){

            // Clears the holding array of locations
            locations = [];

            // Set the selected lat and long equal to the ones provided on the refresh() call
            selectedLat = latitude;
            selectedLong = longitude;

            localStorage.setItem('lastUserLatitude', latitude );
            localStorage.setItem('lastUserLongitude', longitude);

            // Perform an AJAX call to get all of the records in the db.
            $http.get('/users').success(function(response){

                // Then convert the results into map points
                locations = convertToMapPoints(response);

                // Then initialize the map -- noting that no filter was used.
                initialize(latitude, longitude, false);

            }).error(function(){});


        };

        // Private Inner Functions
        // --------------------------------------------------------------

        // Convert a JSON of users into map points
        var convertToMapPoints = function(response){

            // Clear the locations holder
            var locations = [];

            // Loop through all of the JSON entries provided in the response
            for(var i= 0; i < response.length; i++) {
                var festival = response[i];

                var startDateString = $filter('date')(festival.startDate,"HH:mm - dd/MM/yyyy");
                var endDateString = $filter('date')(festival.endDate,"HH:mm - dd/MM/yyyy");


                // Create popup windows for each record
                var  contentString = '<p><b>Festival Name</b>: ' + festival.name + '<br><b>Start</b>: ' + startDateString + '<br>' +
                    '<b>End:</b>: ' + endDateString + '</p>';

                var infoWindow = new google.maps.InfoWindow({ content: contentString,  maxWidth: 310 });
                var coordinate = new google.maps.LatLng(festival.location[1], festival.location[0]);

                var location = new LocationPoint( coordinate,  festival.name,  new Date(festival.startDate),  new Date(festival.endDate), infoWindow );

                // Converts each of the JSON records into Google Maps Location format (Note Lat, Lng format).
                locations.push(location)
            }
            // location is now an array populated with records in Google Maps format
            return locations;
        };


        // Initializes the map
        var initialize = function(latitude, longitude, filter) {

            if (latitude == "undefined" || latitude  == "null" || latitude  == null  || latitude == undefined
                || longitude == "undefined" || longitude  ==  "null" || longitude  == null || longitude == undefined ) {
                latitude = 40.78286470;
                longitude = -73.96535510;
            }

            if (selectedLat == "undefined" || selectedLat  == "null" || selectedLat  == null  || latitude == undefined
                || selectedLong == "undefined" || selectedLong  ==  "null" || selectedLong  == null || selectedLong == undefined ) {
                selectedLat = 40.78286470;
                selectedLong = -73.96535510;
            }

            // Uses the selected lat, long as starting point
            var myLatLng = {lat: parseFloat(selectedLat), lng: parseFloat(selectedLong)};

            // If map has not been created...
            if (!map){

                var myStyles =[
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [
                            { visibility: "off" }
                        ]
                    }
                ];

                // Create a new map and place in the index.html page
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: initialZoomLevel,
                    streetViewControl: false,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_CENTER
                    },
                    styles:myStyles,
                    center: myLatLng
                });
            }

            var now = new Date();

            // Loop through each location in the array and place a marker
            locations.forEach(function(location, index){

                console.log(location);
                console.log(location.startDateTime);

                console.log(location.endDateTime);
                console.log(now);


                if(now > location.startDateTime && now < location.endDateTime ){
                    icon = pink_marker_icon;
                }
                else{
                    icon = blue_marker_icon;
                }


                var marker = new google.maps.Marker({
                    position: location.latlon,
                    map: map,
                    icon: icon
                });

                // For each marker created, add a listener that checks for clicks
                google.maps.event.addListener(marker, 'click', function(e){

                    if(lastInfoWindow){
                        lastInfoWindow.close();
                    }

                    lastInfoWindow = location.infoWindowString;
                    // When clicked, open the selected marker's message
                    currentSelectedMarker = location;
                    location.infoWindowString.open(map, marker);
                });

            });




            // Set initial location as a bouncing red marker
            var initialLocation = new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude));
            var marker = new google.maps.Marker({
                position: initialLocation,
                map: map,
                icon: ball_marker_icon

            });
            lastMarker = marker;

            // Function for moving to a selected location
            map.panTo(new google.maps.LatLng(latitude, longitude));



            // Clicking on the Map moves the bouncing red marker
            google.maps.event.addListener(map, 'click', function(e){
                var marker = new google.maps.Marker({
                    position: e.latLng,
                    map: map,
                    icon: ball_marker_icon
                });

                // When a new spot is selected, delete the old red bouncing marker
                if(lastMarker){
                    lastMarker.setMap(null);
                }

                // Create a new red bouncing marker and move to it
                lastMarker = marker;
                map.panTo(marker.position);

                // Update Broadcasted Variable (lets the panels know to change their lat, long values)
                googleMapService.clickLat = marker.getPosition().lat();
                googleMapService.clickLong = marker.getPosition().lng();

                $rootScope.$broadcast("clicked");
            });
        };

        // Refresh the Map with new data. Takes three parameters (lat, long, and filtering results)
        googleMapService.hideUserLocation = function(){

            // Clears the holding array of locations
            // When a new spot is selected, delete the old red bouncing marker
            if(lastMarker){
                lastMarker.setMap(null);
            }

         };


        // Refresh the page upon window load. Use the initial latitude and longitude
        google.maps.event.addDomListener(window, 'load', googleMapService.refresh(selectedLat, selectedLong));

        return googleMapService;
    });

