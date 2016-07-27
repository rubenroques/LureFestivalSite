// Creates the addCtrl Module and Controller. Note that it depends on 'geolocation' and 'gservice' modules.
var createLureController = angular.module('createLureController', ['geolocation', 'gservice']);
createLureController.controller('createLureController', function($scope, $http, $rootScope, geolocation, gservice){

    // Initializes Variables
    // ----------------------------------------------------------------------------
    $scope.formData = {};
    var coords = {};
    var lat = 0;
    var long = 0;

    // Set initial coordinates to the center of the US
    $scope.formData.longitude = -98.350;
    $scope.formData.latitude = 39.500;

    // Get User's actual coordinates based on HTML5 at window load
    geolocation.getLocation().then(function(data){

        // Set the latitude and longitude equal to the HTML5 coordinates
        coords = {lat:data.coords.latitude, long:data.coords.longitude};

        // Display coordinates in location textboxes rounded to three decimal points
        $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
        $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);

        // Display message confirming that the coordinates verified.
        $scope.formData.htmlverified = "Yep (Thanks for giving us real data!)";

        gservice.refresh($scope.formData.latitude, $scope.formData.longitude);

    });



    // Functions
    // ----------------------------------------------------------------------------

    // Get coordinates based on mouse click. When a click event is detected....
    $rootScope.$on("clicked", function(){

        // Run the gservice functions associated with identifying coordinates
        $scope.$apply(function(){
            $scope.formData.latitude = parseFloat(gservice.clickLat).toFixed(3);
            $scope.formData.longitude = parseFloat(gservice.clickLong).toFixed(3);
        });
    });


    // Function for refreshing the HTML5 verified location (used by refresh button)
    $scope.refreshLoc = function(){

        console.log("PRESSED!");

        geolocation.getLocation().then(function(data){
            
            coords = {lat:data.coords.latitude, long:data.coords.longitude};

            $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
            $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);
            
            gservice.refresh(coords.lat, coords.long);
            
        });
    };


    // Creates a new user based on the form fields
    $scope.createUser = function() {

        //var teste = $scope.formData.startDate.toJSON();
        var startDateDate = new Date($scope.formData.startDate);
        var startDateTime = new Date($scope.formData.startDateTime);
        var startDateMerge = new Date(startDateDate.getFullYear(), startDateDate.getMonth(), startDateDate.getDate(), startDateTime.getHours(), startDateTime.getMinutes(), startDateTime.getSeconds());

        var endDateMerge;

        if ($scope.formData.endDate == "undefined" || $scope.formData.endDate  == "null" || $scope.formData.endDate  == null  || $scope.formData.endDate == undefined ||$scope.formData.endDate==""
            || $scope.formData.endDateTime == "undefined" || $scope.formData.endDateTime  ==  "null" || $scope.formData.endDateTime  == null || $scope.formData.endDateTime == undefined || $scope.formData.endDateTime=="" )
        {
            endDateMerge = new Date(startDateMerge.getTime() + 30*60000);
        }
        else {
            var endDateDate = new Date($scope.formData.endDate);
            var endDateTime = new Date($scope.formData.endDateTime);

            endDateMerge = new Date(endDateDate.getFullYear(), endDateDate.getMonth(), endDateDate.getDate(), endDateTime.getHours(), endDateTime.getMinutes(), endDateTime.getSeconds());
        }

        var generatedKey = numberGenerator();

        // Grabs all of the text box fields
        var festivalData = {
            name: $scope.formData.name,
            location: [$scope.formData.longitude, $scope.formData.latitude],
            created_at: $scope.formData.created_at,
            updated_at: $scope.formData.updated_at,
            startDate: startDateMerge,
            endDate: endDateMerge,
            editionKey:generatedKey
        };




        // Saves the user data to the db
        $http.post('/users', festivalData)
            .success(function (data) {

                //Show editionKey to user.

                console.log(data);

                // Once complete, clear the form (except location)
                $scope.formData.name = "";
                $scope.formData.startDate = undefined;
                $scope.formData.startDateTime = undefined;
                $scope.formData.endDate = undefined;
                $scope.formData.endDateTime = undefined;


                // Refresh the map with new data
                gservice.refresh($scope.formData.latitude, $scope.formData.longitude, false);

                $('#myModalHorizontal').modal('toggle');

            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };
});

