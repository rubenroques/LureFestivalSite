// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
    .factory('gservice', function($rootScope, $http){


        var blue_marker_icon = {
            url: "./images/blue_marker.png",
            scale: 1,
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(35,70),
            scaledSize: new google.maps.Size(70,70)
        };

        var pink_marker_icon = {
            url: "./images/pink_marker.png",
            scale: 1,
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(35,70),
            scaledSize: new google.maps.Size(70,70)
        };

        var ball_marker_icon = {
            url: "./images/ball_marker.png",
            scale: 1,
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(35,70),
            scaledSize: new google.maps.Size(70,70)
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
        var currentSelectedMarker;

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

            // If filtered results are provided in the refresh() call...
            if (filteredResults){

                // Then convert the filtered results into map points.
                locations = convertToMapPoints(filteredResults);

                // Then, initialize the map -- noting that a filter was used (to mark icons yellow)
                initialize(latitude, longitude, true);
            }

            // If no filter is provided in the refresh() call...
            else {

                // Perform an AJAX call to get all of the records in the db.
                $http.get('/users').success(function(response){

                    // Then convert the results into map points
                    locations = convertToMapPoints(response);

                    // Then initialize the map -- noting that no filter was used.
                    initialize(latitude, longitude, false);
                }).error(function(){});
            }
        };

        // Private Inner Functions
        // --------------------------------------------------------------

        // Convert a JSON of users into map points
        var convertToMapPoints = function(response){

            // Clear the locations holder
            var locations = [];

            // Loop through all of the JSON entries provided in the response
            for(var i= 0; i < response.length; i++) {
                var user = response[i];

                // Create popup windows for each record
                var  contentString = '<p><b>Name</b>: ' + user.name + '<br><b>Age</b>: ' + user.age + '<br>' +
                    '<b>Gender</b>: ' + user.gender + '<br><b>Favorite Language</b>: ' + user.favlang + '</p>';

                // Converts each of the JSON records into Google Maps Location format (Note Lat, Lng format).
                locations.push(new Location(
                    new google.maps.LatLng(user.location[1], user.location[0]),
                    new google.maps.InfoWindow({
                        content: contentString,
                        maxWidth: 320
                    }),
                    user.name,''
                ))
            }
            // location is now an array populated with records in Google Maps format
            return locations;
        };

        // Constructor for generic location
        var Location = function(latlon, name, startDateTime, endDateTime){
            this.latlon = latlon;
            this.name = name;
            this.startDateTime;
            this.endDateTime;
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
                    zoom: 15,
                    streetViewControl: false,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_CENTER
                    },
                    styles:myStyles,
                    center: myLatLng
                });
            }

            // Loop through each location in the array and place a marker
            locations.forEach(function(location, index){

                //console.log(JSON.stringify(location, null, 2));
                console.log(location);

                // If a filter was used set the icons yellow, otherwise blue
                if(location.name){
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

                    // When clicked, open the selected marker's message
                    currentSelectedMarker = location;
                    n.message.open(map, marker);
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

        // Refresh the page upon window load. Use the initial latitude and longitude
        google.maps.event.addDomListener(window, 'load', googleMapService.refresh(selectedLat, selectedLong));

        return googleMapService;
    });

