// Declares the initial angular module "meanMapApp". Module grabs other controllers and services.
var app = angular.module('lureFestivalApp', ['createLureController', 'queryCtrl', 'geolocation', 'gservice', 'ngRoute']);


function numberGenerator() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + ':' + s4() + ':' + s4() + ':' + s4();
}
